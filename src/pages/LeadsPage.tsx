import { useEffect, useMemo, useRef, useState } from 'react'
import { AdminLayout } from '../components/admin/AdminLayout'
import { createLeadsAdminService } from '../lib'
import type { Lead } from '../lib/types'

type SortKey = 'lead_kind' | 'contact_name' | 'business_name' | 'phone' | 'email' | 'website' | 'created_at'
type SortDirection = 'asc' | 'desc'

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

  const searchParams = useMemo(() => new URLSearchParams(window.location.search), [])
  const search = (searchParams.get('search') || '').trim()
  const typeParam = searchParams.getAll('type')
  const types = typeParam.length > 0 ? typeParam : (searchParams.get('type') ? [String(searchParams.get('type'))] : [])

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)))
    }
  }

  const fetchPage = async (offset: number) => {
    const service = createLeadsAdminService()
    const res = await service.searchLeads({
      offset,
      limit: 50,
      orderBy: sortKey as any,
      orderDirection: sortDirection,
      filters: {
        ...(types.length > 0 ? { lead_kind_in: types } : {}),
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
  }, [search, sortKey, sortDirection, types.join(',')])

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
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-100">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>
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
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </span>
        )}
        {types.map((t) => (
          <span key={t} className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-100">
            <span className="uppercase">{t}</span>
            <button
              className="rounded-full p-1 hover:bg-gray-700"
              aria-label={`Remove ${t}`}
              onClick={() => {
                const url = new URL(window.location.href)
                const all = url.searchParams.getAll('type')
                url.searchParams.delete('type')
                all.filter((v) => v !== t).forEach((v) => url.searchParams.append('type', v))
                window.location.href = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '')
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={refresh}
          aria-label="Refresh"
          title="Refresh"
          disabled={refreshing}
          className="rounded-md bg-gray-800 p-2 text-sm text-gray-100 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className={`h-5 w-5 ${refreshing ? 'animate-spin text-gray-300' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.355m-2.496 9.638a8.25 8.25 0 11-1.745-5.148m0 0V4.355"/></svg>
        </button>
        <a href="/manage/leads/import" className="rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-100 hover:bg-gray-700">Import CSV</a>
        <button
          type="button"
          disabled={exporting}
          onClick={async () => {
            setExporting(true)
            try {
              const service = createLeadsAdminService()
              const res = await service.exportLeadsToCSV({
                filters: {
                  ...(types.length > 0 ? { lead_kind_in: types } : {}),
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
          className="rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-100 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {exporting ? (
            <svg className="h-4 w-4 animate-spin text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.355m-2.496 9.638a8.25 8.25 0 11-1.745-5.148m0 0V4.355"/></svg>
          ) : null}
          <span>Download CSV</span>
        </button>
      </div>
    </div>
  )

  const breadcrumb = (
    <div className="flex items-center gap-2">
      <a href="/manage" className="hover:text-gray-200">Dashboard</a>
      <span className="text-gray-600">›</span>
      <span className="text-gray-300">Leads</span>
    </div>
  )

  const headerCell = (label: string, key: SortKey) => (
    <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
      <button className="inline-flex items-center gap-1 hover:text-white" onClick={() => changeSort(key)}>
        <span>{label}</span>
        {sortKey === key ? (
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d={sortDirection === 'asc' ? 'M3 12l7-8 7 8' : 'M3 8l7 8 7-8'} /></svg>
        ) : null}
      </button>
    </th>
  )

  const leadKindIcon = (kind: string) => {
    switch (kind) {
      case 'subscriber':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" /><path d="M8 12h8"/></svg>
      case 'sponsor':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>
      case 'vendor':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 10h18M5 6h14M5 18h14"/></svg>
      case 'volunteer':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 4v16M4 12h16"/></svg>
      default:
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20l9-16H3z"/></svg>
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
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={selectedIds.size === leads.length && leads.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="sticky left-10 top-0 z-10 bg-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Type</th>
                <th className="sticky left-28 top-0 z-10 bg-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Contact Name</th>
                <th className="sticky left-72 top-0 z-10 bg-gray-800 px-3 py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Business Name</th>
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
                    <input
                      type="checkbox"
                      checked={selectedIds.has(lead.id)}
                      onChange={(e) => {
                        const next = new Set(selectedIds)
                        if (e.target.checked) next.add(lead.id)
                        else next.delete(lead.id)
                        setSelectedIds(next)
                      }}
                    />
                  </td>
                  <td className="sticky left-10 bg-gray-900 px-3 py-2" onClick={() => setDrawerLead(lead)}>
                    <div className="flex items-center gap-2">
                      {leadKindIcon(lead.lead_kind)}
                    </div>
                  </td>
                  <td className="sticky left-28 bg-gray-900 px-3 py-2" onClick={() => setDrawerLead(lead)}>
                    {lead.contact_name || '—'}
                  </td>
                  <td className="sticky left-72 bg-gray-900 px-3 py-2" onClick={() => setDrawerLead(lead)}>
                    {lead.business_name || '—'}
                  </td>
                  <td className="px-3 py-2" onClick={() => setDrawerLead(lead)}>
                    {lead.phone ? (<a className="text-indigo-300 hover:text-indigo-200" href={`tel:${lead.phone}`}>{lead.phone}</a>) : '—'}
                  </td>
                  <td className="px-3 py-2" onClick={() => setDrawerLead(lead)}>
                    <a className="text-indigo-300 hover:text-indigo-200" href={`mailto:${lead.email}`}>{lead.email}</a>
                  </td>
                  <td className="px-3 py-2" onClick={() => setDrawerLead(lead)}>
                    {lead.website ? (<a className="text-indigo-300 hover:text-indigo-200" href={lead.website} target="_blank" rel="noreferrer">{lead.website}</a>) : '—'}
                  </td>
                  <td className="px-3 py-2" onClick={() => setDrawerLead(lead)}>
                    {new Date(lead.created_at).toLocaleString(undefined, {
                      weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true, timeZoneName: 'short'
                    })}
                  </td>
                  <td className="px-3 py-2 text-right" onClick={(e) => { e.stopPropagation(); setDrawerLead(lead) }}>
                    <button className="p-2 rounded hover:bg-gray-800" aria-label="View details">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
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
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-gray-400">Type</div>
                <div className="text-gray-100 flex items-center gap-2">{leadKindIcon(drawerLead.lead_kind)}<span className="uppercase">{drawerLead.lead_kind}</span></div>
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
                <div className="text-xs text-gray-400 mb-1">Meta</div>
                <pre className="bg-gray-800 text-gray-100 text-xs rounded p-3 overflow-auto">
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
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-gray-100 break-words">
        {value ? (
          isLink ? <a className="text-indigo-300 hover:text-indigo-200" href={isLink} target={isLink.startsWith('http') ? '_blank' : undefined} rel={isLink.startsWith('http') ? 'noreferrer' : undefined}>{value}</a> : value
        ) : '—'}
      </div>
    </div>
  )
}


