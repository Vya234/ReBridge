import { useState } from 'react'

const API_BASE = 'https://s3r8aqjg75.execute-api.ap-south-1.amazonaws.com'
const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home']
const KNOWN_ITEMS = ['test-009', 'test-013', 'test-018', 'test-019']

const GRADE_COLORS = {
  A: '#7C9E87',
  B: '#5B8FA8',
  C: '#D4A053',
  D: '#C94A3A',
}

function ProductCard({ item }) {
  const gradeColor = GRADE_COLORS[item.grade] || '#5B8FA8'
  const confidence = Math.round((item.confidence_score || item.condition_score || 0) * 100)

  return (
    <div className="bg-white border border-charcoal/6 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Top row: grade + discount */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-serif text-xl font-bold -rotate-3"
          style={{ borderColor: gradeColor, color: gradeColor }}
        >
          {item.grade}
        </div>
        <span className="px-3 py-1 bg-sage-light text-sage text-xs font-sans font-medium rounded-full">
          Save 35% vs new
        </span>
      </div>

      {/* Category pill */}
      <span className="inline-block px-3 py-1 border border-charcoal/10 rounded-full text-[11px] uppercase tracking-[0.15em] text-charcoal/50 font-sans mb-3">
        {item.category}
      </span>

      {/* Item ID */}
      <h3 className="font-serif text-lg font-semibold text-charcoal mb-2">
        {item.item_id}
      </h3>

      {/* Condition summary */}
      <p className="font-sans text-sm text-charcoal/60 leading-relaxed mb-4 line-clamp-2">
        {item.condition_summary || 'Certified quality — inspected and graded by AI'}
      </p>

      {/* Trust mini bars */}
      {item.trust_breakdown && (
        <div className="space-y-2 mb-5">
          {Object.entries(item.trust_breakdown).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-charcoal/40 font-sans w-20">{key}</span>
              <div className="flex-1 h-1 bg-charcoal/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-charcoal/30 rounded-full"
                  style={{ width: `${Math.round((val || 0) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Route badge */}
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[10px] uppercase tracking-[0.15em] text-charcoal/40 font-sans">Certified</span>
        <span className="px-2 py-0.5 bg-terracotta/10 text-terracotta text-[11px] font-sans font-medium rounded">
          {item.assigned_route || item.route_decision}
        </span>
      </div>

      {/* Add to cart */}
      <button className="w-full py-3 bg-sage text-white font-sans text-sm font-medium rounded-lg hover:bg-sage/90 transition-colors">
        Add to Cart
      </button>
    </div>
  )
}

function ShopPage() {
  const [category, setCategory] = useState('')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    setSearched(true)

    try {
      // Try the category endpoint first
      if (category) {
        const response = await fetch(`${API_BASE}/items/${category}`)
        if (response.ok) {
          const data = await response.json()
          if (data.items && data.items.length > 0) {
            setItems(data.items)
            setLoading(false)
            return
          }
        }
      }

      // Fallback: fetch known items individually and filter
      const results = []
      for (const itemId of KNOWN_ITEMS) {
        try {
          const res = await fetch(`${API_BASE}/health-card/${itemId}`)
          if (res.ok) {
            const item = await res.json()
            const route = item.assigned_route || item.route_decision || ''
            if (route === 'Resell' || route === 'Refurbish') {
              if (!category || item.category === category) {
                results.push(item)
              }
            }
          }
        } catch {
          // Skip failed individual fetches
        }
      }
      setItems(results)
    } catch {
      // If everything fails, show empty state
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] px-6 md:px-12 max-w-7xl mx-auto py-12">
      {/* Header */}
      <div className="mb-12">
        <p className="section-num mb-4">Refurb Recommender</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal leading-tight mb-3">
          Shop <span className="italic text-terracotta">Certified</span> Refurbished
        </h2>
        <p className="font-sans text-base text-charcoal/50 max-w-lg">
          Every item AI-graded, trust-scored, and certified for its next life.
          Same quality, lower impact, better price.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12 pb-8 border-b border-charcoal/5">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-editorial max-w-xs cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%231C1C1C%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0_center]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="group inline-flex items-center gap-3 px-7 py-3 bg-charcoal text-cream font-sans text-sm font-medium uppercase tracking-[0.15em] rounded-full hover:bg-terracotta disabled:bg-charcoal/30 transition-colors duration-300"
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></span>
              Searching
            </>
          ) : (
            <>
              Browse Inventory
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {searched && !loading && items.length === 0 && (
        <div className="text-center py-16">
          <p className="font-serif text-2xl text-charcoal/30 italic">No certified items found</p>
          <p className="font-sans text-sm text-charcoal/40 mt-2">Try a different category or check back later</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {items.map((item) => (
            <ProductCard key={item.item_id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ShopPage
