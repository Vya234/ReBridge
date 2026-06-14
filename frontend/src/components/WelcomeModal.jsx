import { useState } from 'react'

const API_BASE = 'https://s3r8aqjg75.execute-api.ap-south-1.amazonaws.com'

function WelcomeModal({ onSubmit }) {
  const [name, setName] = useState('')
  const [checking, setChecking] = useState(false)
  const [existingAccount, setExistingAccount] = useState(null) // { userId, credits }

  const normalizeId = (val) => val.trim().toLowerCase().replace(/\s+/g, '_')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    const userId = normalizeId(name)
    setChecking(true)

    try {
      const res = await fetch(`${API_BASE}/wallet/${userId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.total_credits > 0) {
          // Account exists with credits — ask for confirmation
          setExistingAccount({ userId, credits: data.total_credits })
          setChecking(false)
          return
        }
      }
    } catch {
      // Network error — proceed as new account
    }

    // No existing account or zero credits — proceed directly
    setChecking(false)
    onSubmit(name)
  }

  const handleConfirmExisting = () => {
    // Log in with existing account
    onSubmit(existingAccount.userId)
  }

  const handleCreateNew = () => {
    // Append random 4 digits to make unique
    const suffix = Math.floor(1000 + Math.random() * 9000)
    const uniqueId = `${existingAccount.userId}_${suffix}`
    onSubmit(uniqueId)
  }

  // Confirmation screen
  if (existingAccount) {
    return (
      <div className="fixed inset-0 z-[100] bg-cream flex items-center justify-center px-6">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl font-bold text-charcoal tracking-tight">
              Re<span className="text-terracotta">Bridge</span>
            </h1>
          </div>

          <div className="bg-white border border-charcoal/6 rounded-2xl p-8 md:p-10 shadow-[0_20px_60px_-15px_rgba(28,28,28,0.06)]">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">👋</span>
              <h2 className="font-serif text-2xl font-bold text-charcoal mb-2">Welcome back!</h2>
              <p className="font-sans text-sm text-charcoal/60 leading-relaxed">
                We found an account for <span className="font-medium text-charcoal">'{existingAccount.userId}'</span> with{' '}
                <span className="font-medium text-sage">{existingAccount.credits} Green Credits</span>.
              </p>
              <p className="font-sans text-sm text-charcoal/50 mt-2">Is this you?</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleConfirmExisting}
                className="w-full py-4 bg-terracotta text-white font-sans text-sm font-medium uppercase tracking-[0.15em] rounded-full hover:bg-terracotta/90 transition-colors duration-300"
              >
                Yes, that's me
              </button>
              <button
                onClick={handleCreateNew}
                className="w-full py-4 border border-charcoal/15 text-charcoal/60 font-sans text-sm font-medium uppercase tracking-[0.15em] rounded-full hover:border-terracotta hover:text-terracotta transition-colors duration-300"
              >
                No, I'm someone else
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Initial name entry screen
  return (
    <div className="fixed inset-0 z-[100] bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-bold text-charcoal tracking-tight">
            Re<span className="text-terracotta">Bridge</span>
          </h1>
        </div>

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
              disabled={!name.trim() || checking}
              className="w-full py-4 bg-terracotta text-white font-sans text-sm font-medium uppercase tracking-[0.15em] rounded-full hover:bg-terracotta/90 disabled:bg-charcoal/15 disabled:cursor-not-allowed transition-colors duration-300"
            >
              {checking ? 'Checking...' : 'Get Started'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-[11px] font-sans text-charcoal/25 tracking-wide">
          Your identity stays on this device — no account needed
        </p>
      </div>
    </div>
  )
}

export default WelcomeModal
