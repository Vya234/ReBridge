function HomePage({ onNavigate }) {
  return (
    <div className="min-h-[90vh] flex flex-col justify-between px-6 md:px-12 max-w-7xl mx-auto">
      {/* Top section — editorial asymmetric layout */}
      <div className="flex-1 flex flex-col justify-center py-20">
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
