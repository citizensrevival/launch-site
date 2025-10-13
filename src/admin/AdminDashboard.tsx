import { useEffect, useState } from 'react'
import { createLeadsAdminService } from '../shell/lib'
import { AdminLayout } from './AdminLayout'
import { Icon } from '@mdi/react'
import { mdiRefresh, mdiDownload } from '@mdi/js'

interface CountsState {
  total: number
  vendors: number
  sponsors: number
  volunteers: number
  subscribers: number
}

export default function AdminDashboard() {
  const [counts, setCounts] = useState<CountsState | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const fetchCounts = async () => {
    setLoading(true)
    const leadsAdmin = createLeadsAdminService()
    const res = await leadsAdmin.getDashboardCounts()
    if (res.success && res.data) {
      setCounts(res.data)
    } else {
      setCounts({
        total: 0,
        vendors: 0,
        sponsors: 0,
        volunteers: 0,
        subscribers: 0,
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCounts()
  }, [])

  const handleExportCSV = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const leadsAdmin = createLeadsAdminService()
      const res = await leadsAdmin.exportLeadsToCSV()
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
  }

  const breadcrumb = (
    <div className="flex items-center gap-2">
      <a href="/manage" className="hover:text-gray-200">
        Dashboard
      </a>
    </div>
  )

  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white sm:text-2xl">
          Leads
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={fetchCounts}
          aria-label="Refresh counts"
          title="Refresh counts"
          disabled={loading}
          className="rounded-md bg-gray-800 p-2 text-sm text-gray-100 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
       >
          <Icon path={mdiRefresh} className={`h-5 w-5 ${loading ? 'animate-spin text-gray-300' : ''}`} />
        </button>
        {/* <a
          href="/manage/leads/import"
          className="rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-100 hover:bg-gray-700"
        >
          Import CSV
        </a> */}
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          className="rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-100 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {exporting ? (
            <Icon path={mdiDownload} className="h-4 w-4 animate-spin text-gray-300" />
          ) : null}
          <span>Download CSV</span>
        </button>
      </div>
    </div>
  )

  const renderValue = (value?: number) => {
    if (loading) return '…'
    return value ?? 0
  }

  return (
    <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <a
          href="/manage/leads?type=subscriber"
          className="rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <div className="text-xs text-gray-400">Subscribers</div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {renderValue(counts?.subscribers)}
          </div>
        </a>
        <a
          href="/manage/leads?type=sponsor"
          className="rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <div className="text-xs text-gray-400">Sponsors</div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {renderValue(counts?.sponsors)}
          </div>
        </a>

        <a
          href="/manage/leads?type=vendor"
          className="rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <div className="text-xs text-gray-400">Vendors</div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {renderValue(counts?.vendors)}
          </div>
        </a>
        <a
          href="/manage/leads?type=volunteer"
          className="rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <div className="text-xs text-gray-400">Volunteers</div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {renderValue(counts?.volunteers)}
          </div>
        </a>
        <a
          href="/manage/leads"
          className="rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <div className="text-xs text-gray-400">Total Leads</div>
          <div className="mt-1 text-2xl font-semibold text-white">
            {renderValue(counts?.total)}
          </div>
        </a>
      </div>
    </AdminLayout>
  )
}
