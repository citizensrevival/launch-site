import { useEffect, useMemo, useRef, useState } from 'react'
import { AdminLayout } from '../components/admin/AdminLayout'
import { createLeadsAdminService } from '../lib'
import type { Lead } from '../lib/types'
import { formatDistanceToNow } from 'date-fns'
import { Icon } from '@mdi/react'
import { 
  mdiMagnify, 
  mdiClose, 
  mdiRefresh, 
  mdiChevronUp, 
  mdiChevronDown,
  mdiAccountOutline,
  mdiDomain,
  mdiShoppingOutline,
  mdiHandshakeOutline,
  mdiTriangle,
  mdiEye,
  mdiDownload,
  mdiCheckboxBlankCircleOutline,
  mdiCheckCircleOutline
} from '@mdi/js'

type SortKey = 'lead_kind' | 'contact_name' | 'business_name' | 'phone' | 'email' | 'website' | 'created_at'
type SortDirection = 'asc' | 'desc'

const LEAD_TYPES = [
  { key: 'subscriber', label: 'Subscriber', icon: mdiAccountOutline },
  { key: 'sponsor', label: 'Sponsor', icon: mdiDomain },
  { key: 'vendor', label: 'Vendor', icon: mdiShoppingOutline },
  { key: 'volunteer', label: 'Volunteer', icon: mdiHandshakeOutline },
] as const

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [selectedLeadTypes, setSelectedLeadTypes] = useState<Set<string>>(new Set())

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const search = (searchParams.get('search') || '').trim()

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)))
    }
  }

  const toggleLeadType = (leadType: string) => {
    setSelectedLeadTypes(prev => {
      const next = new Set(prev)
      if (next.has(leadType)) {
        next.delete(leadType)
      } else {
        next.add(leadType)
      }
      return next
    })
  }

  const fetchPage = async (offset: number) => {
    const service = createLeadsAdminService()
    const res = await service.searchLeads({
      offset,
      limit: 50,
      orderBy: sortKey as any,
      orderDirection: sortDirection,
      filters: {
        ...(selectedLeadTypes.size > 0 ? { lead_kind_in: Array.from(selectedLeadTypes) } : {}),
        ...(search ? { search } : {}),
      } as any,
    })
    return res
  }

  const refresh = async () => {
    setRefreshing(true)
    setSelectedIds(new Set())
    const res = await fetchPage(0)
    if (res.success && res.data) {
      setLeads(res.data.leads)
      setHasMore(res.data.hasMore)
    }
    setRefreshing(false)
  }

  useEffect(() => {
    setLeads([])
    setHasMore(true)
    setLoading(true)
    fetchPage(0).then((res) => {
      if (res.success && res.data) {
        setLeads(res.data.leads)
        setHasMore(res.data.hasMore)
      }
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortKey, sortDirection, selectedLeadTypes])

  const loaderRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!loaderRef.current) return
    const node = loaderRef.current
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0]
      if (first.isIntersecting && hasMore && !loading) {
        setLoading(true)
        fetchPage(leads.length).then((res) => {
          if (res.success && res.data) {
            setLeads((prev) => [...prev, ...res.data!.leads])
            setHasMore(res.data!.hasMore)
          }
          setLoading(false)
        })
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loading, leads.length])

  const changeSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {search && (
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-3 py-1 text-sm text-white">
            <Icon path={mdiMagnify} className="h-4 w-4" />
            <span className="max-w-[20ch] truncate">{search}</span>
            <button
              className="rounded-full p-1 hover:bg-gray-700"
              aria-label="Clear search"
              onClick={() => {
                const url = new URL(window.location.href)
                url.searchParams.delete('search')
                window.location.href = url.pathname + (url.search ? `?${url.searchParams.toString()}` : '')
              }}
            >
              <Icon path={mdiClose} className="h-4 w-4" />
            </button>
          </span>
        )}
        {LEAD_TYPES.map((leadType) => (
          <button
            key={leadType.key}
            onClick={() => toggleLeadType(leadType.key)}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors ${
              selectedLeadTypes.has(leadType.key)
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Icon path={leadType.icon} className="h-4 w-4" />
            <span>{leadType.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={refresh}
          aria-label="Refresh"
          title="Refresh"
          disabled={refreshing}
          className="rounded-md bg-purple-600 p-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon path={mdiRefresh} className={`h-5 w-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
        </button>
        <a href="/manage/leads/import" className="rounded-md bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700">Import CSV</a>
        <button
          type="button"
          disabled={exporting}
          onClick={async () => {
            setExporting(true)
            try {
              const service = createLeadsAdminService()
              const res = await service.exportLeadsToCSV({
                filters: {
                  ...(selectedLeadTypes.size > 0 ? { lead_kind_in: Array.from(selectedLeadTypes) } : {}),
                  ...(search ? { search } : {}),
                } as any,
              })
              if (res.success && res.data) {
                const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
                link.setAttribute('download', `leads-export-${timestamp}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              }
            } finally {
              setExporting(false)
            }
          }}
          className="rounded-md bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {exporting ? (
            <Icon path={mdiDownload} className="h-4 w-4 animate-spin text-white" />
          ) : null}
          <span>Download CSV</span>
        </button>
      </div>
    </div>
  )

  const breadcrumb = (
      <div className="flex items-center gap-2">
        <a href="/manage" className="text-white hover:text-gray-200">Dashboard</a>
        <span className="text-gray-400">›</span>
        <span className="text-white">Leads</span>
      </div>
  )

  const headerCell = (label: string, key: SortKey) => (
    <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
      <button className="inline-flex items-center gap-1 hover:text-white" onClick={() => changeSort(key)}>
        <span>{label}</span>
        {sortKey === key ? (
          <Icon path={sortDirection === 'asc' ? mdiChevronUp : mdiChevronDown} className="h-3 w-3" />
        ) : null}
      </button>
    </th>
  )

  const leadKindIcon = (kind: string) => {
    switch (kind) {
      case 'subscriber':
        return <Icon path={mdiAccountOutline} className="h-4 w-4 text-white" />
      case 'sponsor':
        return <Icon path={mdiDomain} className="h-4 w-4 text-white" />
      case 'vendor':
        return <Icon path={mdiShoppingOutline} className="h-4 w-4 text-white" />
      case 'volunteer':
        return <Icon path={mdiHandshakeOutline} className="h-4 w-4 text-white" />
      default:
        return <Icon path={mdiTriangle} className="h-4 w-4 text-white" />
    }
  }

  return (
    <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
      <div className="rounded-lg overflow-hidden border border-gray-800">
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 bg-gray-800 px-3 py-2">
                  <button
                    onClick={toggleSelectAll}
                    aria-label="Select all"
                    className="p-1 rounded hover:bg-gray-700"
                  >
                    <Icon 
                      path={selectedIds.size === leads.length && leads.length > 0 ? mdiCheckCircleOutline : mdiCheckboxBlankCircleOutline} 
                      className="h-5 w-5 text-white" 
                    />
                  </button>
                </th>
                {headerCell('Type', 'lead_kind')}
                {headerCell('Contact', 'contact_name')}
                {headerCell('Business', 'business_name')}
                {headerCell('Phone', 'phone')}
                {headerCell('Email', 'email')}
                {headerCell('Website', 'website')}
                {headerCell('Created', 'created_at')}
                <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-800/60">
                  <td className="sticky left-0 z-10 bg-gray-900 px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const next = new Set(selectedIds)
                        if (selectedIds.has(lead.id)) {
                          next.delete(lead.id)
                        } else {
                          next.add(lead.id)
                        }
                        setSelectedIds(next)
                      }}
                      aria-label={`Select ${lead.contact_name || lead.business_name || lead.email}`}
                      className="p-1 rounded hover:bg-gray-800"
                    >
                      <Icon 
                        path={selectedIds.has(lead.id) ? mdiCheckCircleOutline : mdiCheckboxBlankCircleOutline} 
                        className="h-5 w-5 text-white" 
                      />
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {leadKindIcon(lead.lead_kind)}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white">
                    {lead.contact_name || ''}
                  </td>
                  <td className="px-3 py-2 text-white">
                    {lead.business_name || ''}
                  </td>
                  <td className="px-3 py-2 text-white">
                    {lead.phone ? (<a className="text-purple-300 hover:text-purple-200" href={`tel:${lead.phone}`}>{lead.phone}</a>) : ''}
                  </td>
                  <td className="px-3 py-2 text-white">
                    <a className="text-purple-300 hover:text-purple-200" href={`mailto:${lead.email}`}>{lead.email}</a>
                  </td>
                  <td className="px-3 py-2 text-white">
                    {lead.website ? (<a className="text-purple-300 hover:text-purple-200" href={lead.website} target="_blank" rel="noreferrer">{lead.website}</a>) : ''}
                  </td>
                  <td className="px-3 py-2 text-white">
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button 
                      className="p-2 rounded hover:bg-gray-800" 
                      aria-label="View details"
                      onClick={() => setDrawerLead(lead)}
                    >
                      <Icon path={mdiEye} className="h-5 w-5 text-white" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div ref={loaderRef} />
        </div>
      </div>

      {/* Drawer */}
      {drawerLead && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerLead(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-gray-900 border-l border-gray-800 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="text-white font-semibold">Lead Details</div>
              <button className="p-2 rounded hover:bg-gray-800" onClick={() => setDrawerLead(null)} aria-label="Close">
                <Icon path={mdiClose} className="h-5 w-5 text-white" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-gray-300">Type</div>
                <div className="text-white flex items-center gap-2">{leadKindIcon(drawerLead.lead_kind)}<span className="uppercase">{drawerLead.lead_kind}</span></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Contact Name" value={drawerLead.contact_name} />
                <Field label="Business Name" value={drawerLead.business_name} />
                <Field label="Email" value={drawerLead.email} isLink={`mailto:${drawerLead.email}`} />
                <Field label="Phone" value={drawerLead.phone} isLink={drawerLead.phone ? `tel:${drawerLead.phone}` : undefined} />
                <Field label="Website" value={drawerLead.website} isLink={drawerLead.website || undefined} />
                <Field label="Source Path" value={drawerLead.source_path} />
                <Field label="Tags" value={drawerLead.tags?.join(', ')} />
                <Field label="Created At" value={new Date(drawerLead.created_at).toLocaleString(undefined, { weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short' })} />
              </div>
              <div>
                <div className="text-xs text-gray-300 mb-1">Meta</div>
                <pre className="bg-gray-800 text-white text-xs rounded p-3 overflow-auto">
{JSON.stringify(drawerLead.meta, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function Field({ label, value, isLink }: { label: string; value?: string | null; isLink?: string }) {
  return (
    <div>
      <div className="text-xs text-gray-300">{label}</div>
      <div className="text-white break-words">
        {value ? (
          isLink ? <a className="text-purple-300 hover:text-purple-200" href={isLink} target={isLink.startsWith('http') ? '_blank' : undefined} rel={isLink.startsWith('http') ? 'noreferrer' : undefined}>{value}</a> : value
        ) : ''}
      </div>
    </div>
  )
}


