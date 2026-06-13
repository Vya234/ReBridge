import { useState } from 'react'

function WelcomeModal({ onSubmit }) {
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onSubmit(name)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold text-charcoal tracking-tight">
            Re<span className="text-terracotta">Bridge</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white border border-charcoal/6 rounded-2xl p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(28,28,28,0.06)]">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">🌱</span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-charcoal mb-2">
              Welcome to ReBridge
            </h2>
            <p className="font-sans text-sm text-charcoal/50 leading-relaxed max-w-xs mx-auto">
              Enter your name or email to track your Green Credits and sustainable impact.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Your Name or Email
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. kavya or kavya@email.com"
                className="input-editorial text-center"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-4 bg-terracotta text-white font-sans text-sm font-medium uppercase tracking-[0.15em] rounded-full hover:bg-terracotta/90 disabled:bg-charcoal/15 disabled:cursor-not-allowed transition-colors duration-300"
            >
              Get Started
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center mt-6 text-[11px] font-sans text-charcoal/25 tracking-wide">
          Your identity stays on this device — no account needed
        </p>
      </div>
    </div>
  )
}

export default WelcomeModal
