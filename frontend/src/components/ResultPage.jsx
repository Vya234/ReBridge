const GRADE_CONFIG = {
  A: { color: '#7C9E87', label: 'Excellent', ring: 'ring-sage' },
  B: { color: '#5B8FA8', label: 'Good', ring: 'ring-blue-400' },
  C: { color: '#D4A053', label: 'Fair', ring: 'ring-amber-400' },
  D: { color: '#C94A3A', label: 'Poor', ring: 'ring-red-400' },
}

const ROUTES = ['Resell', 'Refurbish', 'Donate', 'Recycle']

function JourneyTracker({ currentRoute }) {
  const activeIndex = ROUTES.indexOf(currentRoute)

  return (
    <div className="flex items-center w-full">
      {ROUTES.map((route, i) => {
        const isActive = i === activeIndex
        const isPast = i < activeIndex
        return (
          <div key={route} className="flex-1 flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center relative">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-sans font-medium transition-all duration-500 ${
                  isActive
                    ? 'bg-terracotta text-white scale-125 shadow-lg shadow-terracotta/30'
                    : isPast
                    ? 'bg-charcoal/10 text-charcoal/40'
                    : 'bg-charcoal/5 text-charcoal/25'
                }`}
              >
                {isActive ? '●' : i + 1}
              </div>
              <span
                className={`mt-2 text-[10px] uppercase tracking-[0.15em] font-sans ${
                  isActive ? 'text-terracotta font-medium' : 'text-charcoal/40'
                }`}
              >
                {route}
              </span>
            </div>
            {/* Connector line */}
            {i < ROUTES.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${isPast ? 'bg-charcoal/20' : 'bg-charcoal/8'}`}></div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TrustBar({ label, value, delay = 0 }) {
  const percent = Math.round((value || 0) * 100)
  return (
    <div className="space-y-2 animate-fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex justify-between items-baseline">
        <span className="text-[11px] uppercase tracking-[0.2em] text-charcoal/50 font-sans">{label}</span>
        <span className="font-serif text-lg font-semibold text-charcoal">{percent}</span>
      </div>
      <div className="w-full h-1.5 bg-charcoal/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-charcoal rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percent}%`, transitionDelay: `${delay + 200}ms` }}
        ></div>
      </div>
    </div>
  )
}

function ResultPage({ result, onViewHealthCard, loading }) {
  const grade = result.grade || 'A'
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG.A
  const route = result.assigned_route || result.route_decision || 'Resell'
  const confidence = Math.round((result.confidence_score || result.condition_score || 0) * 100)

  return (
    <div className="min-h-[85vh] px-6 md:px-12 max-w-7xl mx-auto py-12">
      {/* Header */}
      <div className="mb-12 animate-fade-in">
        <p className="section-num mb-3">Product Health Card</p>
        <div className="flex items-baseline gap-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-charcoal">
            {result.item_id}
          </h2>
          <span className="pill">{result.category}</span>
        </div>
      </div>

      {/* Main card — looks like a certificate/tag */}
      <div className="animate-slide-up bg-white border border-charcoal/8 rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(28,28,28,0.08)]">

        {/* Top section: grade stamp + route */}
        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-12 gap-10 items-center border-b border-charcoal/5">

          {/* Grade Stamp */}
          <div className="md:col-span-3 flex justify-center md:justify-start">
            <div className="animate-stamp stamp-texture w-28 h-28 rounded-full border-[3px] flex flex-col items-center justify-center -rotate-3"
                 style={{ borderColor: config.color }}>
              <span className="font-serif text-4xl font-bold" style={{ color: config.color }}>
                {grade}
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] font-sans font-medium mt-0.5" style={{ color: config.color }}>
                {config.label}
              </span>
            </div>
          </div>

          {/* Route Journey */}
          <div className="md:col-span-9">
            <p className="text-[11px] uppercase tracking-[0.2em] text-charcoal/40 font-sans mb-4">
              Routing Decision
            </p>
            <JourneyTracker currentRoute={route} />
          </div>
        </div>

        {/* Middle section: summary + confidence */}
        <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10 border-b border-charcoal/5">
          {/* Condition Summary */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-charcoal/40 font-sans mb-3">
              Condition Summary
            </p>
            <p className="font-serif text-xl text-charcoal leading-relaxed italic">
              "{result.condition_summary || 'No summary available'}"
            </p>
          </div>

          {/* Confidence */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-charcoal/40 font-sans mb-3">
              Confidence Score
            </p>
            <div className="flex items-end gap-2">
              <span className="font-serif text-5xl font-bold text-charcoal">{confidence}</span>
              <span className="text-charcoal/40 font-sans text-sm mb-2">/ 100</span>
            </div>
            <div className="mt-3 w-full h-2 bg-charcoal/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${confidence}%`, backgroundColor: config.color }}
              ></div>
            </div>
          </div>
        </div>

        {/* Bottom section: trust breakdown */}
        {result.trust_breakdown && (
          <div className="p-8 md:p-12">
            <p className="text-[11px] uppercase tracking-[0.2em] text-charcoal/40 font-sans mb-6">
              Trust Breakdown
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TrustBar label="Cosmetic" value={result.trust_breakdown.cosmetic} delay={0} />
              <TrustBar label="Functional" value={result.trust_breakdown.functional} delay={150} />
              <TrustBar label="Packaging" value={result.trust_breakdown.packaging} delay={300} />
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => onViewHealthCard(result.item_id)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 border border-charcoal/15 text-charcoal/70 font-sans text-xs uppercase tracking-[0.15em] rounded-full hover:border-terracotta hover:text-terracotta disabled:opacity-40 transition-all duration-300"
        >
          {loading ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin"></span>
              Loading
            </>
          ) : (
            <>↻ Refresh Health Card</>
          )}
        </button>

        {result.timestamp && (
          <span className="text-[11px] font-sans text-charcoal/30 tracking-wide">
            Evaluated {new Date(result.timestamp).toLocaleDateString('en-US', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </span>
        )}
      </div>
    </div>
  )
}

export default ResultPage
