import { useState, useEffect, useRef } from 'react'

const WS_URL = 'wss://kvhtc0th50.execute-api.ap-south-1.amazonaws.com/production'

function ChatPortal({ itemId, itemSummary, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)
  const messagesEndRef = useRef(null)
  const msgCountRef = useRef(0)

  const userId = localStorage.getItem('rebridge_user_id') || 'anonymous'

  useEffect(() => {
    // Connect with itemId and sender as query params
    const ws = new WebSocket(`${WS_URL}?itemId=${itemId}&sender=${userId}`)

    ws.onopen = () => {
      setConnected(true)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // This is a message from another user (server skips sender)
      setMessages(prev => [...prev, {
        message: data.message,
        sender: data.sender,
        _id: `recv_${Date.now()}_${++msgCountRef.current}`,
        _fromServer: true,
      }])
    }

    ws.onclose = () => {
      setConnected(false)
    }

    ws.onerror = () => {
      setConnected(false)
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [itemId, userId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    const text = input.trim()

    // Show own message immediately (optimistic)
    setMessages(prev => [...prev, {
      message: text,
      sender: userId,
      _id: `sent_${Date.now()}_${++msgCountRef.current}`,
      _fromServer: false,
    }])

    // Send via WebSocket — server broadcasts to others only
    wsRef.current.send(JSON.stringify({
      action: 'sendMessage',
      itemId: itemId,
      message: text,
      sender: userId,
    }))

    setInput('')
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] animate-slide-up">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-charcoal/20" onClick={onClose}></div>

      {/* Chat panel */}
      <div className="relative bg-white border-t border-charcoal/10 rounded-t-2xl shadow-[0_-10px_40px_-10px_rgba(28,28,28,0.15)] max-w-2xl mx-auto h-[70vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-charcoal/5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-serif text-lg font-semibold text-charcoal">Negotiate</h3>
            <p className="font-sans text-xs text-charcoal/40">
              {itemSummary} •{' '}
              <span className={connected ? 'text-sage' : 'text-terracotta'}>
                {connected ? '● Connected' : '○ Connecting...'}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center text-charcoal/40 hover:text-charcoal hover:bg-charcoal/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="font-sans text-sm text-charcoal/30">No messages yet. Start the conversation.</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender === userId
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%]">
                  <p className={`text-[10px] font-sans uppercase tracking-wider mb-1 ${
                    isMe ? 'text-right text-terracotta/60' : 'text-charcoal/40'
                  }`}>
                    {isMe ? 'You' : msg.sender}
                  </p>
                  <div className={`px-4 py-2.5 rounded-2xl font-sans text-sm leading-relaxed ${
                    isMe
                      ? 'bg-terracotta text-white rounded-br-md'
                      : 'bg-charcoal/5 text-charcoal rounded-bl-md'
                  }`}>
                    {msg.message}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="px-6 py-4 border-t border-charcoal/5 flex gap-3 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-charcoal/[0.03] border border-charcoal/10 rounded-full font-sans text-sm text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:border-terracotta transition-colors"
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!input.trim() || !connected}
            className="px-5 py-2.5 bg-charcoal text-cream font-sans text-xs uppercase tracking-wider rounded-full hover:bg-terracotta disabled:bg-charcoal/20 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatPortal
