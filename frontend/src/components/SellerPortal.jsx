import { useState, useRef } from 'react'

const API_BASE = 'https://s3r8aqjg75.execute-api.ap-south-1.amazonaws.com'

const GRADE_COLORS = {
  A: 'text-sage',
  B: 'text-blue-500',
  C: 'text-amber-600',
  D: 'text-red-500',
}

const ROUTE_STYLES = {
  Resell: 'bg-sage-light text-sage',
  Refurbish: 'bg-blue-50 text-blue-600',
  Donate: 'bg-amber-50 text-amber-700',
  Recycle: 'bg-red-50 text-red-600',
}

const GREEN_CREDITS = { Donate: 50, Refurbish: 30, Resell: 20, Recycle: 10 }

function parseCSV(text) {
  const lines = text.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim())
    if (values.length >= 4) {
      rows.push({
        item_id: values[0],
        category: values[1],
        condition_notes: values[2],
        simulated_image_label: values[3],
      })
    }
  }
  return rows
}

function SellerPortal() {
  const [items, setItems] = useState([])
  const [results, setResults] = useState([])
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef(null)

  const userId = localStorage.getItem('rebridge_user_id') || 'default_user'

  const handleFile = (file) => {
    if (!file || !file.name.endsWith('.csv')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result)
      setItems(parsed)
      setResults([])
      setProcessed(0)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleFileInput = (e) => {
    handleFile(e.target.files[0])
  }

  const processAll = async () => {
    setProcessing(true)
    setResults([])
    setProcessed(0)

    const newResults = []

    // Process concurrently in batches of 3
    const batchSize = 3
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      const promises = batch.map(async (item) => {
        try {
          const res = await fetch(`${API_BASE}/evaluate-return`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, user_id: userId }),
          })
          if (res.ok) {
            return await res.json()
          }
          return { ...item, grade: '—', assigned_route: 'Error', error: true }
        } catch {
          return { ...item, grade: '—', assigned_route: 'Error', error: true }
        }
      })

      const batchResults = await Promise.all(promises)
      newResults.push(...batchResults)
      setResults([...newResults])
      setProcessed(newResults.length)
    }

    setProcessing(false)
  }

  const downloadCSV = () => {
    const headers = 'item_id,category,grade,route,confidence_score,condition_summary,green_credits\n'
    const rows = results.map(r =>
      `${r.item_id},${r.category},${r.grade},${r.assigned_route || ''},${r.confidence_score || ''},${(r.condition_summary || '').replace(/,/g, ';')},${r.green_credits || 0}`
    ).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rebridge_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Summary
  const summary = results.reduce((acc, r) => {
    const route = r.assigned_route || 'Unknown'
    acc[route] = (acc[route] || 0) + 1
    acc.totalCredits += GREEN_CREDITS[route] || 0
    return acc
  }, { totalCredits: 0 })

  const progressPercent = items.length > 0 ? Math.round((processed / items.length) * 100) : 0

  return (
    <div className="min-h-[85vh] px-6 md:px-12 max-w-7xl mx-auto py-12">
      {/* Header */}
      <div className="mb-12">
        <p className="section-num mb-4">Seller Dashboard</p>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal leading-tight mb-3">
          Bulk <span className="italic text-terracotta">Upload</span>
        </h2>
        <p className="font-sans text-base text-charcoal/50 max-w-lg">
          Upload a CSV of returned items. AI will grade and route each one automatically.
        </p>
      </div>

      {/* Upload area */}
      {items.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-16 text-center transition-colors duration-200 ${
            dragOver
              ? 'border-terracotta bg-terracotta/5'
              : 'border-charcoal/15 hover:border-terracotta/50'
          }`}
        >
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
          <div className="text-4xl mb-4">📄</div>
          <p className="font-serif text-xl text-charcoal mb-2">Drop your CSV here</p>
          <p className="font-sans text-sm text-charcoal/40">
            or click to browse — format: item_id, category, condition_notes, simulated_image_label
          </p>
        </div>
      )}

      {/* Preview table */}
      {items.length > 0 && results.length === 0 && !processing && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <p className="font-sans text-sm text-charcoal/60">
              <span className="font-semibold text-charcoal">{items.length}</span> items ready to process
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setItems([]); setResults([]) }}
                className="px-5 py-2.5 border border-charcoal/15 text-charcoal/60 font-sans text-xs uppercase tracking-[0.15em] rounded-full hover:border-terracotta hover:text-terracotta transition-colors"
              >
                Clear
              </button>
              <button
                onClick={processAll}
                className="px-7 py-2.5 bg-charcoal text-cream font-sans text-xs uppercase tracking-[0.15em] rounded-full hover:bg-terracotta transition-colors"
              >
                Process All Items →
              </button>
            </div>
          </div>

          <div className="bg-white border border-charcoal/6 rounded-xl overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-charcoal/8 bg-charcoal/[0.02]">
              <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans">Item ID</span>
              <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans">Category</span>
              <span className="col-span-5 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans">Condition</span>
              <span className="col-span-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans">Image Label</span>
            </div>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-charcoal/4 last:border-0">
                <span className="col-span-2 font-serif text-sm font-medium text-charcoal truncate">{item.item_id}</span>
                <span className="col-span-2 font-sans text-sm text-charcoal/60">{item.category}</span>
                <span className="col-span-5 font-sans text-xs text-charcoal/50 truncate">{item.condition_notes}</span>
                <span className="col-span-3 font-mono text-xs text-charcoal/40 truncate">{item.simulated_image_label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing / Results */}
      {(processing || results.length > 0) && (
        <div className="animate-fade-in">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-sans text-sm text-charcoal/60">
                {processing ? 'Processing...' : 'Complete'}
              </span>
              <span className="font-serif text-lg font-semibold text-charcoal">{processed}/{items.length}</span>
            </div>
            <div className="w-full h-2.5 bg-charcoal/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-terracotta rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Results table */}
          <div className="bg-white border border-charcoal/6 rounded-xl overflow-hidden mb-8">
            <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-charcoal/8 bg-charcoal/[0.02]">
              <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans">Item ID</span>
              <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans">Category</span>
              <span className="col-span-1 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans">Grade</span>
              <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans">Route</span>
              <span className="col-span-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans">Confidence</span>
              <span className="col-span-3 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-sans">Summary</span>
            </div>
            {results.map((r, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-charcoal/4 last:border-0 animate-fade-in">
                <span className="col-span-2 font-serif text-sm font-medium text-charcoal truncate">{r.item_id}</span>
                <span className="col-span-2 font-sans text-sm text-charcoal/60">{r.category}</span>
                <span className={`col-span-1 font-serif text-lg font-bold ${GRADE_COLORS[r.grade] || 'text-charcoal/40'}`}>
                  {r.grade}
                </span>
                <span className="col-span-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-sans font-medium ${ROUTE_STYLES[r.assigned_route] || 'bg-gray-100 text-gray-500'}`}>
                    {r.assigned_route}
                  </span>
                </span>
                <span className="col-span-2 font-sans text-xs text-charcoal/50">
                  {r.confidence_score ? `${Math.round(r.confidence_score * 100)}%` : '—'}
                </span>
                <span className="col-span-3 font-sans text-xs text-charcoal/50 truncate">
                  {r.condition_summary || '—'}
                </span>
              </div>
            ))}
          </div>

          {/* Summary */}
          {!processing && results.length > 0 && (
            <div className="bg-white border border-charcoal/6 rounded-xl p-6 mb-6">
              <p className="text-[11px] uppercase tracking-[0.2em] text-charcoal/40 font-sans mb-4">Summary</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="font-serif text-2xl font-bold text-charcoal">{results.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-charcoal/40 font-sans mt-1">Total</p>
                </div>
                {['Resell', 'Refurbish', 'Donate', 'Recycle'].map(route => (
                  <div key={route} className="text-center">
                    <p className="font-serif text-2xl font-bold text-charcoal">{summary[route] || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-charcoal/40 font-sans mt-1">{route}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-charcoal/5 text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-sage-light rounded-full">
                  <span className="text-lg">🌱</span>
                  <span className="font-serif text-lg font-bold text-sage">{summary.totalCredits}</span>
                  <span className="font-sans text-xs text-sage/70">Green Credits Earned</span>
                </span>
              </div>
            </div>
          )}

          {/* Download button */}
          {!processing && results.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={downloadCSV}
                className="px-7 py-3 bg-charcoal text-cream font-sans text-xs uppercase tracking-[0.15em] rounded-full hover:bg-terracotta transition-colors"
              >
                ↓ Download Results CSV
              </button>
              <button
                onClick={() => { setItems([]); setResults([]); setProcessed(0) }}
                className="px-6 py-3 border border-charcoal/15 text-charcoal/60 font-sans text-xs uppercase tracking-[0.15em] rounded-full hover:border-terracotta hover:text-terracotta transition-colors"
              >
                Upload New File
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SellerPortal
