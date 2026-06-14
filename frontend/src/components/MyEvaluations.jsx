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

function MyEvaluations({ userId, onReeval }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    fetchItems()
  }, [userId])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/items`)
      if (res.ok) {
        const data = await res.json()
        // Filter by current user_id
        const myItems = (data.items || []).filter(item => item.user_id === userId)
        setItems(myItems)
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
        <p className="section-num mb-4">Personal Dashboard</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal leading-tight mb-3">
          My <span className="italic text-terracotta">Evaluations</span>
        </h2>
        <p className="font-sans text-base text-charcoal/50 max-w-lg">
          Your personal evaluation history and graded items.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 py-16 justify-center">
          <span className="inline-block w-5 h-5 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin"></span>
          <span className="font-sans text-sm text-charcoal/50">Loading your evaluations...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="text-center py-16">
          <p className="font-serif text-2xl text-charcoal/30 italic">You haven't evaluated any items yet</p>
          <p className="font-sans text-sm text-charcoal/40 mt-2">Start by evaluating a return!</p>
        </div>
      )}

      {/* Table */}
      {!loading && items.length > 0 && (
        <div className="bg-white border border-charcoal/6 rounded-xl overflow-hidden shadow-sm animate-fade-in">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-charcoal/8 bg-charcoal/[0.02]">
            <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Item ID</span>
            <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Category</span>
            <span className="col-span-1 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Grade</span>
            <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Route</span>
            <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Confidence</span>
            <span className="col-span-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans font-medium">Timestamp</span>
          </div>

          {items.map((item) => {
            const grade = item.grade || '—'
            const gradeStyle = GRADE_STYLES[grade] || { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200' }
            const route = item.assigned_route || item.route_decision || '—'
            const routeStyle = ROUTE_STYLES[route] || { bg: 'bg-gray-100', text: 'text-gray-500' }
            const confidence = Math.round((item.confidence_score || item.condition_score || 0) * 100)
            const isExpanded = expandedId === item.item_id

            return (
              <div key={item.item_id} className="border-b border-charcoal/5 last:border-0">
                <button
                  onClick={() => toggleExpand(item.item_id)}
                  className="w-full grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-5 text-left hover:bg-charcoal/[0.015] transition-colors"
                >
                  <div className="md:col-span-2 flex items-center">
                    <span className="font-serif text-sm font-semibold text-charcoal">{item.item_id}</span>
                  </div>
                  <div className="md:col-span-2 flex items-center">
                    <span className="font-sans text-sm text-charcoal/60">{item.category || '—'}</span>
                  </div>
                  <div className="md:col-span-1 flex items-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border font-serif text-sm font-bold ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.border}`}>
                      {grade}
                    </span>
                  </div>
                  <div className="md:col-span-2 flex items-center">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium ${routeStyle.bg} ${routeStyle.text}`}>
                      {route}
                    </span>
                  </div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-charcoal/5 rounded-full overflow-hidden">
                      <div className="h-full bg-charcoal/30 rounded-full" style={{ width: `${confidence}%` }}></div>
                    </div>
                    <span className="font-sans text-xs text-charcoal/50">{confidence}%</span>
                  </div>
                  <div className="md:col-span-3 flex items-center justify-between">
                    <span className="font-sans text-xs text-charcoal/40">
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleDateString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          })
                        : '—'}
                    </span>
                    <span className={`text-charcoal/30 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <div className="ml-0 md:ml-6 p-5 bg-cream rounded-lg border border-charcoal/5">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Left 60%: condition + trust */}
                        <div className="md:col-span-7">
                          {item.condition_summary && (
                            <div className="mb-4">
                              <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans mb-1">Condition Summary</p>
                              <p className="font-serif text-base text-charcoal italic">"{item.condition_summary}"</p>
                            </div>
                          )}
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

                        {/* Right 40%: photo + QR side by side */}
                        <div className="md:col-span-5">
                          <div className="flex gap-4 justify-end">
                            {item.image_url && (
                              <div className="shrink-0">
                                <img src={item.image_url} alt="Product" className="w-[120px] h-[120px] object-contain rounded-lg border border-charcoal/8 bg-white" />
                              </div>
                            )}
                            <div className="flex flex-col items-center shrink-0">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://d12xi8surv8so8.cloudfront.net?item=${item.item_id}`)}`}
                                alt="QR"
                                width={100}
                                height={100}
                                className="rounded"
                              />
                              <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-charcoal/35 font-sans text-center">
                                Scan Health Card
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end mt-4">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`https://d12xi8surv8so8.cloudfront.net?item=${item.item_id}`)
                                setCopiedId(item.item_id)
                                setTimeout(() => setCopiedId(null), 2000)
                              }}
                              className="px-4 py-2 border border-charcoal/15 text-charcoal/50 font-sans text-[10px] uppercase tracking-[0.15em] rounded-full hover:border-terracotta hover:text-terracotta transition-colors"
                            >
                              {copiedId === item.item_id ? '✓ Copied!' : '🔗 Share'}
                            </button>
                            {onReeval && (
                              <button
                                onClick={() => onReeval(item.item_id)}
                                className="px-4 py-2 border border-terracotta/30 text-terracotta font-sans text-[10px] uppercase tracking-[0.15em] rounded-full hover:bg-terracotta/5 transition-colors"
                              >
                                ↻ Re-evaluate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!loading && items.length > 0 && (
        <p className="mt-4 text-[11px] font-sans text-charcoal/30 tracking-wide">
          Showing {items.length} of your evaluated items
        </p>
      )}
    </div>
  )
}

export default MyEvaluations
