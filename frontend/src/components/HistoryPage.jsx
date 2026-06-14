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

function HistoryPage({ onReeval }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [copiedId, setCopiedId] = useState(null)

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

  // Client-side smart filter
  const filteredItems = (() => {
    if (!searchQuery.trim()) return items

    const q = searchQuery.toLowerCase()

    // Extract structured filters from query
    let gradeFilter = null
    const gradeMatch = q.match(/grade\s*([abcd])/i)
    if (gradeMatch) gradeFilter = gradeMatch[1].toUpperCase()

    let routeFilter = null
    if (q.includes('resell')) routeFilter = 'Resell'
    else if (q.includes('refurbish')) routeFilter = 'Refurbish'
    else if (q.includes('donate')) routeFilter = 'Donate'
    else if (q.includes('recycle')) routeFilter = 'Recycle'

    let categoryFilter = null
    if (q.includes('electronics')) categoryFilter = 'Electronics'
    else if (q.includes('clothing')) categoryFilter = 'Clothing'
    else if (q.includes('books')) categoryFilter = 'Books'
    else if (q.includes('home')) categoryFilter = 'Home'

    // Remaining words for free-text matching
    let remaining = q
      .replace(/grade\s*[abcd]/gi, '')
      .replace(/resell|refurbish|donate|recycle/gi, '')
      .replace(/electronics|clothing|books|home/gi, '')
      .trim()
    const keywords = remaining.split(/\s+/).filter(w => w.length > 1)

    return items.filter((item) => {
      if (gradeFilter && (item.grade || '') !== gradeFilter) return false
      if (routeFilter && (item.assigned_route || item.route_decision || '') !== routeFilter) return false
      if (categoryFilter && (item.category || '') !== categoryFilter) return false

      if (keywords.length > 0) {
        const text = `${item.item_id || ''} ${item.condition_summary || ''}`.toLowerCase()
        const match = keywords.some(kw => text.includes(kw))
        if (!match) return false
      }

      return true
    })
  })()

  // Apply city filter on top of search filter
  const cityFilteredItems = cityFilter.trim()
    ? filteredItems.filter(item => (item.city || '').toLowerCase().includes(cityFilter.trim().toLowerCase()))
    : filteredItems

  return (
    <div className="min-h-[85vh] px-6 md:px-12 max-w-7xl mx-auto py-12">
      {/* Header */}
      <div className="mb-12">
        <p className="section-num mb-4">Evaluation Log</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal leading-tight mb-3">
          Product <span className="italic text-terracotta">Gallery</span>
        </h2>
        <p className="font-sans text-base text-charcoal/50 max-w-lg">
          Browse all AI-evaluated products available for a second life.
        </p>
      </div>

      {/* Search bar */}
      {!loading && items.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history... e.g. Electronics Grade A"
              className="flex-1 px-5 py-3 bg-white border border-charcoal/10 rounded-full font-sans text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-terracotta transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-5 py-3 border border-charcoal/15 text-charcoal/60 font-sans text-xs uppercase tracking-[0.15em] rounded-full hover:border-terracotta hover:text-terracotta transition-colors"
              >
                ✕ Clear
              </button>
            )}
          </div>
          {/* Search hint chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {['Electronics', 'Grade A', 'Refurbish', 'Clothing Grade B', 'Donate'].map(hint => (
              <button
                key={hint}
                onClick={() => setSearchQuery(hint)}
                className="px-3 py-1 bg-charcoal/[0.04] border border-charcoal/8 rounded-full text-[11px] font-sans text-charcoal/45 hover:border-terracotta/40 hover:text-terracotta transition-colors"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* City filter */}
      {!loading && items.length > 0 && (
        <div className="mb-4">
          <input
            type="text"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="Filter by city... e.g. Mumbai"
            className="max-w-xs px-4 py-2.5 bg-white border border-charcoal/10 rounded-full font-sans text-xs text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-terracotta transition-colors"
          />
        </div>
      )}

      {/* Filter result count */}
      {(searchQuery.trim() || cityFilter.trim()) && !loading && (
        <p className="mb-4 font-sans text-xs text-charcoal/50">
          {cityFilteredItems.length} result{cityFilteredItems.length !== 1 ? 's' : ''}{searchQuery.trim() ? ` for "${searchQuery}"` : ''}{cityFilter.trim() ? ` in "${cityFilter}"` : ''}
        </p>
      )}

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
          {cityFilteredItems.map((item) => {
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
                  <div className="md:col-span-1 flex items-center gap-1">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border font-serif text-sm font-bold ${gradeStyle.bg} ${gradeStyle.text} ${gradeStyle.border}`}>
                      {grade}
                    </span>
                    {item.has_image && <span className="text-[10px]" title="AI Vision Verified">📸</span>}
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
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Left: condition + trust */}
                        <div className="flex-1">
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

                        {/* Right: QR code + Re-evaluate + Share */}
                        <div className="flex flex-col items-center justify-center shrink-0 gap-3">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`https://d12xi8surv8so8.cloudfront.net?item=${item.item_id}`)}`}
                            alt="Health Card QR"
                            width={100}
                            height={100}
                            className="rounded"
                          />
                          <p className="text-[9px] uppercase tracking-[0.15em] text-charcoal/35 font-sans text-center">
                            Scan Health Card
                          </p>
                          {item.has_image && (
                            <span className="px-3 py-1 bg-charcoal/[0.04] border border-charcoal/8 rounded-full text-[10px] font-sans text-charcoal/45">
                              📸 AI Vision analyzed
                            </span>
                          )}
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
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Item count */}
      {!loading && items.length > 0 && (
        <p className="mt-4 text-[11px] font-sans text-charcoal/30 tracking-wide">
          Showing {cityFilteredItems.length} of {items.length} evaluated items
        </p>
      )}
    </div>
  )
}

export default HistoryPage
