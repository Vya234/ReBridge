import { useState, useEffect } from 'react'
import HomePage from './components/HomePage'
import EvaluatePage from './components/EvaluatePage'
import ResultPage from './components/ResultPage'
import ShopPage from './components/ShopPage'
import HistoryPage from './components/HistoryPage'
import MyEvaluations from './components/MyEvaluations'
import WelcomeModal from './components/WelcomeModal'
import SellerPortal from './components/SellerPortal'

const API_BASE = 'https://s3r8aqjg75.execute-api.ap-south-1.amazonaws.com'

function getStoredUserId() {
  return localStorage.getItem('rebridge_user_id') || null
}

function saveUserId(name) {
  // If already looks like a normalized ID (no spaces, lowercase), use as-is
  const userId = name.includes(' ') ? name.trim().toLowerCase().replace(/\s+/g, '_') : name.trim().toLowerCase()
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
  const [autoOpenChat, setAutoOpenChat] = useState(false)
  const [prefillItemId, setPrefillItemId] = useState('')
  const [previousGrade, setPreviousGrade] = useState(null)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

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

  // Check URL for ?item= param to deep-link to a health card
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const itemParam = params.get('item')
    if (itemParam && userId) {
      fetch(`${API_BASE}/health-card/${itemParam}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) {
            setResult(data)
            setPage('result')
          }
        })
        .catch(() => {})
    }
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
    setPreviousGrade(null)

    // If re-evaluating, fetch old record first
    if (formData._isReeval && formData.item_id) {
      try {
        const oldRes = await fetch(`${API_BASE}/health-card/${formData.item_id}`)
        if (oldRes.ok) {
          const oldData = await oldRes.json()
          setPreviousGrade(oldData.grade || null)
        }
      } catch {
        // Continue even if old fetch fails
      }
    }

    try {
      const { _isReeval, ...submitData } = formData
      const response = await fetch(`${API_BASE}/evaluate-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...submitData, user_id: userId }),
      })
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      setResult(data)
      setPage('result')
      setPrefillItemId('')
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

  const handleChatWithSeller = async (itemId) => {
    setLoading(true)
    setError(null)
    setAutoOpenChat(true)
    try {
      const response = await fetch(`${API_BASE}/health-card/${itemId}`)
      if (!response.ok) throw new Error(`Request failed (${response.status})`)
      const data = await response.json()
      setResult(data)
      setPage('result')
    } catch (err) {
      setError(err.message)
      setAutoOpenChat(false)
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
            onClick={() => { setPage('home'); setResult(null); setError(null); setAutoOpenChat(false) }}
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
              onClick={() => { setPage('shop'); setAccountMenuOpen(false) }}
              className={`text-xs font-sans uppercase tracking-[0.2em] transition-colors ${
                page === 'shop' ? 'text-terracotta' : 'text-charcoal/50 hover:text-terracotta'
              }`}
            >
              Shop Refurbished
            </button>
            <button
              onClick={() => { setPage('history'); setAccountMenuOpen(false) }}
              className={`text-xs font-sans uppercase tracking-[0.2em] transition-colors ${
                page === 'history' ? 'text-terracotta' : 'text-charcoal/50 hover:text-terracotta'
              }`}
            >
              Product Gallery
            </button>
            {/* My Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className={`text-xs font-sans uppercase tracking-[0.2em] transition-colors ${
                  page === 'myevals' || page === 'seller' ? 'text-terracotta' : 'text-charcoal/50 hover:text-terracotta'
                }`}
              >
                {userId} ▾
              </button>
              {accountMenuOpen && (
                <div className="absolute right-0 top-8 bg-white border border-charcoal/10 rounded-xl shadow-lg py-2 min-w-[180px] z-50 animate-fade-in">
                  <button
                    onClick={() => { setPage('myevals'); setAccountMenuOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-xs font-sans text-charcoal/70 hover:bg-charcoal/[0.03] hover:text-terracotta transition-colors"
                  >
                    My Evaluations
                  </button>
                  <button
                    onClick={() => { setPage('seller'); setAccountMenuOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-xs font-sans text-charcoal/70 hover:bg-charcoal/[0.03] hover:text-terracotta transition-colors"
                  >
                    Seller Portal
                  </button>
                  <div className="border-t border-charcoal/5 my-1"></div>
                  <button
                    onClick={() => { handleSwitchUser(); setAccountMenuOpen(false) }}
                    className="w-full text-left px-4 py-2.5 text-xs font-sans text-charcoal/40 hover:bg-charcoal/[0.03] hover:text-terracotta transition-colors"
                  >
                    ↺ Switch User
                  </button>
                </div>
              )}
            </div>
            {page !== 'home' && (
              <button
                onClick={() => { setPage('home'); setResult(null); setError(null); setAutoOpenChat(false); setAccountMenuOpen(false) }}
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
        {page === 'evaluate' && <EvaluatePage onSubmit={handleEvaluate} loading={loading} prefillItemId={prefillItemId} />}
        {page === 'result' && result && (
          <ResultPage result={result} onViewHealthCard={handleViewHealthCard} loading={loading} autoOpenChat={autoOpenChat} previousGrade={previousGrade} />
        )}
        {page === 'shop' && <ShopPage onChatWithSeller={handleChatWithSeller} />}
        {page === 'history' && <HistoryPage onReeval={(itemId) => { setPrefillItemId(itemId); setPage('evaluate') }} />}
        {page === 'myevals' && <MyEvaluations userId={userId} onReeval={(itemId) => { setPrefillItemId(itemId); setPage('evaluate') }} />}
        {page === 'seller' && <SellerPortal />}
      </main>
    </div>
  )
}

export default App
