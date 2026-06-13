import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import EvaluatePage from './components/EvaluatePage'
import ResultPage from './components/ResultPage'
import ShopPage from './components/ShopPage'
import HistoryPage from './components/HistoryPage'
import WelcomeModal from './components/WelcomeModal'
import SellerPortal from './components/SellerPortal'

const API_BASE = 'https://s3r8aqjg75.execute-api.ap-south-1.amazonaws.com'

function getStoredUserId() {
  return localStorage.getItem('rebridge_user_id') || null
}

function saveUserId(name) {
  const userId = name.trim().toLowerCase().replace(/\s+/g, '_')
  localStorage.setItem('rebridge_user_id', userId)
  return userId
}

function App() {
  const [userId, setUserId] = useState(getStoredUserId)
  const [page, setPage] = useState('home')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [walletCredits, setWalletCredits] = useState(0)

  // Fetch wallet balance
  const fetchWallet = async (uid) => {
    const id = uid || userId
    if (!id) return
    try {
      const res = await fetch(`${API_BASE}/wallet/${id}`)
      if (res.ok) {
        const data = await res.json()
        setWalletCredits(data.total_credits || 0)
      }
    } catch {
      // Silent fail
    }
  }

  useEffect(() => {
    if (userId) fetchWallet()
  }, [userId])

  const handleWelcomeSubmit = (name) => {
    const id = saveUserId(name)
    setUserId(id)
  }

  const handleSwitchUser = () => {
    localStorage.removeItem('rebridge_user_id')
    setUserId(null)
    setWalletCredits(0)
    setPage('home')
    setResult(null)
  }

  const handleEvaluate = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/evaluate-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: userId }),
      })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      setResult(data)
      setPage('result')
      fetchWallet()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewHealthCard = async (itemId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/health-card/${itemId}`)
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Show welcome modal if no user_id
  if (!userId) {
    return <WelcomeModal onSubmit={handleWelcomeSubmit} />
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          <button
            onClick={() => { setPage('home'); setResult(null); setError(null) }}
            className="font-serif text-xl font-bold text-charcoal tracking-tight hover:text-terracotta transition-colors"
          >
            ReBridge
          </button>
          <div className="flex items-center gap-5">
            {/* Green Wallet */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage-light border border-sage/20 rounded-full text-xs font-sans font-medium text-sage">
              🌱 {walletCredits} credits
            </span>
            <button
              onClick={() => setPage('shop')}
              className={`text-xs font-sans uppercase tracking-[0.2em] transition-colors ${
                page === 'shop' ? 'text-terracotta' : 'text-charcoal/50 hover:text-terracotta'
              }`}
            >
              Shop Refurbished
            </button>
            <button
              onClick={() => setPage('history')}
              className={`text-xs font-sans uppercase tracking-[0.2em] transition-colors ${
                page === 'history' ? 'text-terracotta' : 'text-charcoal/50 hover:text-terracotta'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setPage('seller')}
              className={`text-xs font-sans uppercase tracking-[0.2em] transition-colors ${
                page === 'seller' ? 'text-terracotta' : 'text-charcoal/50 hover:text-terracotta'
              }`}
            >
              Seller Portal
            </button>
            {/* Switch User */}
            <button
              onClick={handleSwitchUser}
              className="text-[10px] font-sans text-charcoal/30 hover:text-terracotta transition-colors"
              title="Switch user identity"
            >
              ↺ {userId}
            </button>
            {page !== 'home' && (
              <button
                onClick={() => { setPage('home'); setResult(null); setError(null) }}
                className="text-xs font-sans uppercase tracking-[0.2em] text-charcoal/50 hover:text-terracotta transition-colors"
              >
                ← Home
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Error toast */}
      {error && (
        <div className="fixed top-20 right-6 z-50 animate-slide-up">
          <div className="px-5 py-3 bg-terracotta text-white text-sm font-sans rounded-lg shadow-lg">
            {error}
            <button onClick={() => setError(null)} className="ml-3 opacity-70 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      {/* Pages */}
      <main className="pt-20">
        {page === 'home' && <HomePage onNavigate={() => setPage('evaluate')} onNavigateShop={() => setPage('shop')} />}
        {page === 'evaluate' && <EvaluatePage onSubmit={handleEvaluate} loading={loading} />}
        {page === 'result' && result && (
          <ResultPage result={result} onViewHealthCard={handleViewHealthCard} loading={loading} />
        )}
        {page === 'shop' && <ShopPage />}
        {page === 'history' && <HistoryPage />}
        {page === 'seller' && <SellerPortal />}
      </main>
    </div>
  )
}

export default App
