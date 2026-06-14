import { useState } from 'react'

const API_BASE = 'https://s3r8aqjg75.execute-api.ap-south-1.amazonaws.com'
const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home']

const STATUS_ICONS = { pass: '✅', warn: '⚠️', fail: '❌' }
const STATUS_LABELS = { pass: 'Good', warn: 'Caution', fail: 'Risk' }

function HomePage({ onNavigate, onNavigateShop }) {
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState(null)

  const handleGetAdvice = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAdvice(null)

    try {
      const response = await fetch(`${API_BASE}/purchase-advice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, description }),
      })

      if (!response.ok) throw new Error('Request failed')
      const data = await response.json()

      if (typeof data.compatibility_score === 'number') {
        setAdvice(data)
      } else {
        throw new Error('Malformed response')
      }
    } catch {
      setAdvice({
        compatibility_score: 65,
        reasoning: ['Unable to fully assess — AI service temporarily unavailable'],
        checklist: [{ item: 'AI Analysis', status: 'warn' }],
        potential_risks: ['Assessment may be incomplete'],
        recommendation: 'Consider checking product reviews and return policy before purchasing.',
      })
    } finally {
      setLoading(false)
    }
  }

  const resetAdvisor = () => {
    setAdvice(null)
    setCategory('')
    setDescription('')
  }

  const isFormValid = category && description.trim()

  const getScoreColor = (score) => {
    if (score >= 80) return { bg: 'bg-sage-light', text: 'text-sage', border: 'border-sage/30', ring: 'border-sage' }
    if (score >= 50) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', ring: 'border-amber-400' }
    return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', ring: 'border-red-400' }
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Great Match'
    if (score >= 50) return 'Proceed with Caution'
    return 'High Return Risk'
  }

  return (
    <div className="px-6 md:px-12 max-w-7xl mx-auto">
      {/* Hero section */}
      <div className="min-h-[80vh] flex flex-col justify-center py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-7">
            <p className="section-num mb-6">Circular Commerce Platform</p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-charcoal leading-[0.9] tracking-tight">
              Every Return<br />
              Finds a{' '}
              <span className="italic text-terracotta">New Life</span>
            </h1>
          </div>
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

      {/* AI Purchase Advisor Section */}
      <div className="py-20 border-t border-charcoal/8">

        {/* FORM STATE — show when no advice yet */}
        {!advice && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">
            <div className="md:col-span-5">
              <p className="section-num mb-4">AI Purchase Advisor</p>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal leading-tight mb-4">
                Think Before<br />You <span className="italic text-terracotta">Buy</span>
              </h2>
              <p className="font-sans text-sm text-charcoal/50 leading-relaxed max-w-sm">
                Our AI analyzes your purchase intent, flags potential return risks,
                and gives you a compatibility score — so you buy smarter, return less.
              </p>
            </div>

            <div className="md:col-span-6 md:col-start-7">
              <form onSubmit={handleGetAdvice} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                    Product Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-editorial cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%231C1C1C%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0_center]"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                    Describe Your Purchase Intent
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="e.g. Buying a refurbished laptop for school. Might return it if the battery doesn't last 6 hours..."
                    className="input-editorial resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="group inline-flex items-center gap-3 px-7 py-3.5 bg-charcoal text-cream font-sans text-sm font-medium uppercase tracking-[0.15em] rounded-full hover:bg-terracotta disabled:bg-charcoal/20 disabled:cursor-not-allowed transition-colors duration-300"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></span>
                      Analyzing
                    </>
                  ) : (
                    <>
                      Get Purchase Advice
                      <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* RESULT STATE — full-width card mirroring Health Card */}
        {advice && (
          <div className="max-w-3xl mx-auto animate-slide-up">
            {/* Back button */}
            <button
              onClick={resetAdvisor}
              className="mb-8 text-xs font-sans uppercase tracking-[0.2em] text-charcoal/50 hover:text-terracotta transition-colors"
            >
              ← Start New Check
            </button>

            {/* Header */}
            <div className="mb-8">
              <p className="section-num mb-3">AI Purchase Advisor</p>
              <h2 className="font-serif text-3xl font-bold text-charcoal">
                Purchase Analysis
              </h2>
              <p className="font-sans text-sm text-charcoal/40 mt-1">{category} • {description.slice(0, 60)}{description.length > 60 ? '...' : ''}</p>
            </div>

            {/* Main Card */}
            <div className="bg-white border border-charcoal/8 rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(28,28,28,0.08)]">

              {/* Score + Recommendation Header */}
              <div className="p-8 md:p-10 border-b border-charcoal/5 flex flex-col md:flex-row items-center gap-8">
                {/* Score circle */}
                <div className={`w-28 h-28 rounded-full border-[3px] ${getScoreColor(advice.compatibility_score).ring} flex flex-col items-center justify-center shrink-0`}>
                  <span className={`font-serif text-4xl font-bold ${getScoreColor(advice.compatibility_score).text}`}>
                    {advice.compatibility_score}
                  </span>
                  <span className={`text-[9px] uppercase tracking-[0.2em] font-sans font-medium ${getScoreColor(advice.compatibility_score).text}`}>
                    / 100
                  </span>
                </div>

                {/* Recommendation */}
                <div className="flex-1 text-center md:text-left">
                  <p className={`font-serif text-xl font-bold mb-2 ${getScoreColor(advice.compatibility_score).text}`}>
                    {getScoreLabel(advice.compatibility_score)}
                  </p>
                  {advice.recommendation && (
                    <p className="font-serif text-base text-charcoal/70 italic leading-relaxed">
                      "{advice.recommendation}"
                    </p>
                  )}
                </div>
              </div>

              {/* Two-column: Checklist + Reasoning/Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-charcoal/5">

                {/* Left: Checklist */}
                <div className="p-8 md:p-10">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans mb-5">Compatibility Checklist</p>
                  <div className="space-y-4">
                    {(advice.checklist || []).map((c, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-lg">{STATUS_ICONS[c.status] || '❓'}</span>
                        <div className="flex-1">
                          <p className="font-sans text-sm text-charcoal/80">{c.item}</p>
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-sans font-medium ${
                          c.status === 'pass' ? 'text-sage' : c.status === 'warn' ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {STATUS_LABELS[c.status] || '?'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Reasoning + Risks */}
                <div className="p-8 md:p-10">
                  {/* Reasoning */}
                  {advice.reasoning && advice.reasoning.length > 0 && (
                    <div className="mb-6">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans mb-3">Reasoning</p>
                      <ul className="space-y-2">
                        {advice.reasoning.map((r, i) => (
                          <li key={i} className="font-sans text-sm text-charcoal/70 flex items-start gap-2">
                            <span className="text-charcoal/20 mt-1 shrink-0">—</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Potential Risks */}
                  {advice.potential_risks && advice.potential_risks.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta/60 font-sans mb-3">Potential Risks</p>
                      <ul className="space-y-2">
                        {advice.potential_risks.map((r, i) => (
                          <li key={i} className="font-sans text-sm text-terracotta/80 flex items-start gap-2">
                            <span className="shrink-0 mt-0.5">⚠️</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Shop CTA for low scores */}
              {advice.compatibility_score < 50 && (
                <div className="p-8 md:p-10 border-t border-charcoal/5 bg-terracotta/[0.03]">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <p className="font-sans text-sm text-charcoal/60 flex-1">
                      High return risk detected. Consider a certified refurbished alternative instead.
                    </p>
                    <button
                      onClick={onNavigateShop}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white font-sans text-xs font-medium uppercase tracking-[0.15em] rounded-full hover:bg-terracotta/90 transition-colors"
                    >
                      Shop Refurbished →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
