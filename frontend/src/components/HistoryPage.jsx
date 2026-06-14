import { useState, useEffect } from 'react'

const API_BASE = 'https://s3r8aqjg75.execute-api.ap-south-1.amazonaws.com'

const GRADE_STYLES = {
  A: { bg: 'bg-sage-light', text: 'text-sage', border: 'border-sage/30' },
  B: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  C: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  D: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
}

const ROUTE_STYLES = {
  Resell: { bg: 'bg-sage-light', text: 'text-sage' },
  Refurbish: { bg: 'bg-blue-50', text: 'text-blue-600' },
  Donate: { bg: 'bg-amber-50', text: 'text-amber-700' },
  Recycle: { bg: 'bg-red-50', text: 'text-red-600' },
}

function HistoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchAllItems()
  }, [])

  const fetchAllItems = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/items`)
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      } else {
        setItems([])
      }
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const toggleExpand = (itemId) => {
    setExpandedId(expandedId === itemId ? null : itemId)
  }

  return (
    <div className="min-h-[85vh] px-6 md:px-12 max-w-7xl mx-auto py-12">
      {/* Header */}
      <div className="mb-12">
        <p className="section-num mb-4">Evaluation Log</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal leading-tight mb-3">
          Return <span className="italic text-terracotta">History</span>
        </h2>
        <p className="font-sans text-base text-charcoal/50 max-w-lg">
          Complete audit trail of every item graded and routed through ReBridge.
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center gap-3 py-16 justify-center">
          <span className="inline-block w-5 h-5 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin"></span>
          <span className="font-sans text-sm text-charcoal/50">Loading evaluation history...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16">
          <p className="font-serif text-2xl text-charcoal/30 italic">No evaluations found</p>
          <p className="font-sans text-sm text-charcoal/40 mt-2">Items will appear here after evaluation</p>
        </div>
      )}

      {/* Table */}
      {!loading && items.length > 0 && (
        <div className="bg-white border border-charcoal/6 rounded-xl overflow-hidden shadow-sm animate-fade-in">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-charcoal/8 bg-charcoal/[0.02]">
            <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Item ID</span>
            <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Category</span>
            <span className="col-span-1 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Grade</span>
            <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Route</span>
            <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Confidence</span>
            <span className="col-span-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Timestamp</span>
          </div>

          {/* Rows */}
          {items.map((item) => {
            const grade = item.grade || '—'
            const gradeStyle = GRADE_STYLES[grade] || { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' }
            const route = item.assigned_route || item.route_decision || '—'
            const routeStyle = ROUTE_STYLES[route] || { bg: 'bg-gray-100', text: 'text-gray-500' }
            const confidence = Math.round((item.confidence_score || item.condition_score || 0) * 100)
            const isExpanded = expandedId === item.item_id

            return (
              <div key={item.item_id} className="border-b border-charcoal/5 last:border-0">
                {/* Main row */}
                <button
                  onClick={() => toggleExpand(item.item_id)}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-5 text-left hover:bg-charcoal/[0.015] transition-colors"
                >
                  {/* Item ID */}
                  <div className="md:col-span-2 flex items-center">
                    <span className="font-serif text-sm font-semibold text-charcoal">{item.item_id}</span>
                  </div>

                  {/* Category */}
                  <div className="md:col-span-2 flex items-center">
                    <span className="font-sans text-sm text-charcoal/60">{item.category || '—'}</span>
                  </div>

                  {/* Grade badge */}
                  <div className="md:col-span-1 flex items-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border font-serif text-sm font-bold ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.border}`}>
                      {grade}
                    </span>
                  </div>

                  {/* Route pill */}
                  <div className="md:col-span-2 flex items-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium ${routeStyle.bg} ${routeStyle.text}`}>
                      {route}
                    </span>
                  </div>

                  {/* Confidence */}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-charcoal/5 rounded-full overflow-hidden">
                      <div className="h-full bg-charcoal/30 rounded-full" style={{ width: `${confidence}%` }}></div>
                    </div>
                    <span className="font-sans text-xs text-charcoal/50">{confidence}%</span>
                  </div>

                  {/* Timestamp */}
                  <div className="md:col-span-3 flex items-center justify-between">
                    <span className="font-sans text-xs text-charcoal/40">
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleDateString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })
                        : '—'}
                    </span>
                    <span className={`text-charcoal/30 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <div className="ml-0 md:ml-6 p-5 bg-cream rounded-lg border border-charcoal/5">
                      {/* Condition summary */}
                      {item.condition_summary && (
                        <div className="mb-4">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans mb-1">Condition Summary</p>
                          <p className="font-serif text-base text-charcoal italic">"{item.condition_summary}"</p>
                        </div>
                      )}

                      {/* Trust breakdown */}
                      {item.trust_breakdown && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans mb-3">Trust Breakdown</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {Object.entries(item.trust_breakdown).map(([key, val]) => {
                              const percent = Math.round((val || 0) * 100)
                              return (
                                <div key={key} className="space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-[10px] uppercase tracking-wider text-charcoal/50 font-sans">{key}</span>
                                    <span className="font-serif text-sm font-semibold text-charcoal">{percent}</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-charcoal/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-charcoal/40 rounded-full" style={{ width: `${percent}%` }}></div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Item count */}
      {!loading && items.length > 0 && (
        <p className="mt-4 text-[11px] font-sans text-charcoal/30 tracking-wide">
          Showing {items.length} evaluated items
        </p>
      )}
    </div>
  )
}

export default HistoryPage
