import { useState } from 'react'

const API_BASE = 'https://s3r8aqjg75.execute-api.ap-south-1.amazonaws.com'
const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home']

function HomePage({ onNavigate, onNavigateShop }) {
  const [riskCategory, setRiskCategory] = useState('')
  const [riskDescription, setRiskDescription] = useState('')
  const [riskLoading, setRiskLoading] = useState(false)
  const [riskResult, setRiskResult] = useState(null) // { grade, isHighRisk }

  const handleCheckRisk = async (e) => {
    e.preventDefault()
    setRiskLoading(true)
    setRiskResult(null)

    try {
      const response = await fetch(`${API_BASE}/evaluate-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: `risk-check-${Date.now()}`,
          category: riskCategory,
          condition_notes: riskDescription,
          simulated_image_label: 'pre_purchase_check',
        }),
      })

      if (!response.ok) throw new Error('Check failed')
      const data = await response.json()
      const grade = data.grade || 'B'
      const isHighRisk = grade === 'C' || grade === 'D'
      setRiskResult({ grade, isHighRisk, summary: data.condition_summary })
    } catch {
      // Fallback — simulate a moderate risk
      setRiskResult({ grade: 'B', isHighRisk: false, summary: 'Unable to assess — defaulting to low risk.' })
    } finally {
      setRiskLoading(false)
    }
  }

  const isRiskFormValid = riskCategory && riskDescription

  return (
    <div className="px-6 md:px-12 max-w-7xl mx-auto">
      {/* Hero section */}
      <div className="min-h-[80vh] flex flex-col justify-center py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          {/* Left: headline */}
          <div className="md:col-span-7">
            <p className="section-num mb-6">Circular Commerce Platform</p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-charcoal leading-[0.9] tracking-tight">
              Every Return<br />
              Finds a{' '}
              <span className="italic text-terracotta">New Life</span>
            </h1>
          </div>

          {/* Right: description + CTA */}
          <div className="md:col-span-5 md:pb-2">
            <p className="font-sans text-base text-charcoal/60 leading-relaxed mb-8 max-w-sm">
              AI-powered grading that transforms returns into value.
              Each item receives a trust score and optimal routing —
              resell, refurbish, donate, or recycle.
            </p>
            <button
              onClick={onNavigate}
              className="group inline-flex items-center gap-3 px-7 py-4 bg-charcoal text-cream font-sans text-sm font-medium uppercase tracking-[0.15em] rounded-full hover:bg-terracotta transition-colors duration-300"
            >
              Evaluate a Return
              <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Return Prevention Section */}
      <div className="py-20 border-t border-charcoal/8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
          {/* Left: heading */}
          <div className="md:col-span-5">
            <p className="section-num mb-4">Return Prevention</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal leading-tight mb-4">
              Check Before<br />You <span className="italic text-terracotta">Buy</span>
            </h2>
            <p className="font-sans text-sm text-charcoal/50 leading-relaxed max-w-sm">
              Thinking about a purchase? Our AI can assess the return risk
              based on product category and intended use — helping you make
              smarter, more sustainable decisions.
            </p>
          </div>

          {/* Right: form + result */}
          <div className="md:col-span-6 md:col-start-7">
            <form onSubmit={handleCheckRisk} className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                  Product Category
                </label>
                <select
                  value={riskCategory}
                  onChange={(e) => setRiskCategory(e.target.value)}
                  className="input-editorial cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%231C1C1C%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0_center]"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                  Describe Condition / Intended Use
                </label>
                <textarea
                  value={riskDescription}
                  onChange={(e) => setRiskDescription(e.target.value)}
                  rows={3}
                  placeholder="e.g. Buying a refurbished laptop for school, want to know if I'll need to return it..."
                  className="input-editorial resize-none"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={!isRiskFormValid || riskLoading}
                className="group inline-flex items-center gap-3 px-7 py-3.5 bg-charcoal text-cream font-sans text-sm font-medium uppercase tracking-[0.15em] rounded-full hover:bg-terracotta disabled:bg-charcoal/20 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {riskLoading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></span>
                    Checking
                  </>
                ) : (
                  <>
                    Check Return Risk
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </>
                )}
              </button>
            </form>

            {/* Result */}
            {riskResult && (
              <div className={`mt-8 p-6 rounded-xl border animate-slide-up ${
                riskResult.isHighRisk
                  ? 'bg-terracotta/5 border-terracotta/20'
                  : 'bg-sage-light border-sage/20'
              }`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">
                    {riskResult.isHighRisk ? '⚠️' : '✓'}
                  </span>
                  <div>
                    <p className={`font-serif text-lg font-semibold mb-1 ${
                      riskResult.isHighRisk ? 'text-terracotta' : 'text-sage'
                    }`}>
                      {riskResult.isHighRisk
                        ? 'High Return Risk'
                        : 'Low Return Risk'}
                    </p>
                    <p className="font-sans text-sm text-charcoal/60 leading-relaxed">
                      {riskResult.isHighRisk
                        ? 'Consider a Certified Refurbished Alternative — same quality, less waste, better price.'
                        : 'This looks like a great buy! Low likelihood of return based on category and condition.'}
                    </p>
                    {riskResult.isHighRisk && (
                      <button
                        onClick={onNavigateShop}
                        className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta text-white font-sans text-xs font-medium uppercase tracking-[0.15em] rounded-full hover:bg-terracotta/90 transition-colors"
                      >
                        Shop Refurbished →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-charcoal/10 py-8">
        <div className="flex flex-wrap gap-4">
          {['Product Grading', 'Trust Scoring', 'Route Optimization', 'Health Cards'].map((tag) => (
            <span key={tag} className="pill">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
