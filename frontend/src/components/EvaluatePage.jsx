import { useState } from 'react'

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home']

const CONDITION_OPTIONS = {
  Electronics: ['Fully functional', 'Minor scratches', 'Screen cracked', 'Battery issues', 'Water damage', 'Other (describe below)'],
  Clothing: ['Good condition', 'Faded', 'Missing buttons', 'Torn', 'Stains', 'Other (describe below)'],
  Books: ['Good condition', 'Highlighted', 'Torn pages', 'Cover damaged', 'Other (describe below)'],
  Home: ['Light wear', 'Missing pieces', 'Motor broken', 'Shattered/Destroyed', 'Other (describe below)'],
}

const IMAGE_LABEL_MAP = {
  'Fully functional': 'good_condition',
  'Minor scratches': 'light_scratches',
  'Screen cracked': 'cracked_screen',
  'Battery issues': 'battery_damaged',
  'Water damage': 'water_damaged',
  'Good condition': 'good_condition',
  'Faded': 'faded_item',
  'Missing buttons': 'missing_parts',
  'Torn': 'torn_item',
  'Stains': 'stained_item',
  'Highlighted': 'highlighted_book',
  'Torn pages': 'torn_pages',
  'Cover damaged': 'damaged_cover',
  'Light wear': 'light_wear',
  'Missing pieces': 'missing_parts',
  'Motor broken': 'broken_motor',
  'Shattered/Destroyed': 'shattered_item',
}

const RETURN_REASONS = [
  'Changed mind',
  'Defective',
  'Wrong item',
  'Not as described',
  'Better price found',
  'Gift return',
  'Other',
]

const WARRANTY_OPTIONS = [
  'No warranty',
  'Less than 3 months',
  '3-6 months',
  '6-12 months',
  'More than 1 year',
]

const REPAIR_OPTIONS = [
  'Never repaired',
  'Repaired once',
  'Repaired multiple times',
  'Unknown',
]

function EvaluatePage({ onSubmit, loading, prefillItemId }) {
  const [formData, setFormData] = useState({
    item_id: prefillItemId || '',
    category: '',
    condition_notes: '',
    custom_condition: '',
    simulated_image_label: '',
    original_price: '',
    return_reason: '',
    warranty_left: '',
    repair_history: '',
    city: '',
    locality: '',
  })
  const [isReeval, setIsReeval] = useState(!!prefillItemId)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const [imageError, setImageError] = useState('')
  const [imageCompressing, setImageCompressing] = useState(false)
  const [imageSize, setImageSize] = useState(null)

  const conditions = formData.category ? CONDITION_OPTIONS[formData.category] || [] : []
  const isOtherCondition = formData.condition_notes === 'Other (describe below)'

  const handleChange = (e) => {
    const { name, value } = e.target
    const updated = { ...formData, [name]: value }

    // Reset condition when category changes
    if (name === 'category') {
      updated.condition_notes = ''
      updated.custom_condition = ''
      updated.simulated_image_label = ''
    }

    // Auto-fill image label when condition is selected
    if (name === 'condition_notes') {
      if (value === 'Other (describe below)') {
        updated.simulated_image_label = 'custom_condition'
        updated.custom_condition = ''
      } else {
        updated.simulated_image_label = IMAGE_LABEL_MAP[value] || ''
        updated.custom_condition = ''
      }
    }

    setFormData(updated)
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  const MAX_DIM = 1920

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        // Resize if needed
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          resolve(blob)
        }, 'image/jpeg', 0.8)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImageError('')
    setImageBase64(null)
    setImageSize(null)

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Unsupported format. Please use JPG, PNG, or WebP.')
      setImageFile(null)
      setImagePreview(null)
      return
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      setImageError('Image too large. Please use a photo under 5MB.')
      setImageFile(null)
      setImagePreview(null)
      return
    }

    setImageFile(file)
    setImageCompressing(true)

    // Compress
    const compressed = await compressImage(file)
    setImagePreview(URL.createObjectURL(compressed))
    setImageSize(Math.round(compressed.size / 1024))

    // Auto-set image label
    setFormData(prev => ({ ...prev, simulated_image_label: 'user_uploaded_image' }))

    // Convert to base64
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      setImageBase64(base64)
      setImageCompressing(false)
    }
    reader.readAsDataURL(compressed)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const conditionValue = isOtherCondition ? formData.custom_condition : formData.condition_notes
    const payload = {
      item_id: formData.item_id,
      category: formData.category,
      condition_notes: conditionValue,
      simulated_image_label: formData.simulated_image_label,
      original_price: formData.original_price ? parseInt(formData.original_price, 10) : 0,
      return_reason: formData.return_reason,
      warranty_left: formData.warranty_left,
      repair_history: formData.repair_history,
      city: formData.city,
      locality: formData.locality,
      image_bytes: imageBase64 || null,
      _isReeval: isReeval && formData.item_id ? true : false,
    }
    onSubmit(payload)
  }

  const conditionFilled = isOtherCondition ? formData.custom_condition.trim() : formData.condition_notes
  const isValid = formData.category && conditionFilled && formData.simulated_image_label && formData.city.trim()

  return (
    <div className="min-h-[85vh] px-6 md:px-12 max-w-7xl mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16">

        {/* Left column — heading */}
        <div className="md:col-span-4">
          <p className="section-num mb-4">Step 01</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal leading-tight mb-4">
            Product<br />Passport
          </h2>
          <p className="font-sans text-sm text-charcoal/50 leading-relaxed">
            Document the item's identity and condition.
            Our AI engine will evaluate and route it within seconds.
          </p>

          {/* Visual tag */}
          <div className="mt-10 hidden md:block">
            <div className="w-32 h-32 border-2 border-charcoal/10 rounded-full flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-terracotta/30 rounded-full flex items-center justify-center">
                <span className="font-serif text-2xl text-terracotta/60 italic">ID</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — form */}
        <div className="md:col-span-7 md:col-start-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Re-evaluate toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isReeval}
                  onChange={(e) => { setIsReeval(e.target.checked); if (!e.target.checked) setFormData(f => ({...f, item_id: ''})) }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-charcoal/10 rounded-full peer peer-checked:bg-terracotta/70 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
              <span className="text-[11px] font-sans text-charcoal/50">Re-evaluating a previously graded item?</span>
            </div>

            {/* Item ID */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                {isReeval ? 'Existing ReBridge ID' : 'Item Identifier (Optional)'}
              </label>
              <input
                type="text"
                name="item_id"
                value={formData.item_id}
                onChange={handleChange}
                placeholder={isReeval ? 'e.g. RB-2026-004521' : 'Leave blank to auto-generate RB-ID'}
                className="input-editorial font-mono"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-editorial cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%231C1C1C%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0_center]"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Condition — Dynamic Dropdown */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Condition
              </label>
              <select
                name="condition_notes"
                value={formData.condition_notes}
                onChange={handleChange}
                disabled={!formData.category}
                className="input-editorial cursor-pointer appearance-none disabled:opacity-40 bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%231C1C1C%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0_center]"
              >
                <option value="">{formData.category ? 'Select condition' : 'Select a category first'}</option>
                {conditions.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
              {/* Custom condition text input */}
              {isOtherCondition && (
                <input
                  type="text"
                  name="custom_condition"
                  value={formData.custom_condition}
                  onChange={handleChange}
                  placeholder="Describe the condition..."
                  className="input-editorial mt-4"
                  autoFocus
                />
              )}
            </div>

            {/* Image Label (auto-filled, editable) */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Image Label (Auto-filled)
              </label>
              <input
                type="text"
                name="simulated_image_label"
                value={formData.simulated_image_label}
                onChange={handleChange}
                placeholder="Auto-fills from condition"
                className="input-editorial font-mono text-charcoal/60"
              />
            </div>

            {/* Product Photo Upload */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Upload Product Photo (Optional but Recommended)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  imagePreview ? 'border-sage/40 bg-sage-light/30' : imageError ? 'border-red-300 bg-red-50/30' : 'border-charcoal/15 hover:border-terracotta/40'
                }`}>
                  {imageCompressing ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin"></span>
                      <span className="font-sans text-sm text-charcoal/50">Compressing image...</span>
                    </div>
                  ) : imagePreview ? (
                    <div className="flex items-center gap-4">
                      <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                      <div className="text-left">
                        <p className="font-sans text-sm text-charcoal/70">{imageFile?.name}</p>
                        <p className="font-sans text-xs text-sage">✓ Photo ready ({imageSize} KB)</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-sans text-sm text-charcoal/40">📷 Drop a photo or click to browse</p>
                      <p className="font-sans text-[10px] text-charcoal/25 mt-1">JPG, PNG, WebP — max 5MB — auto-compressed for AI</p>
                    </>
                  )}
                </div>
                {imageError && (
                  <p className="mt-2 font-sans text-xs text-red-500">{imageError}</p>
                )}
              </div>
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Original Price (₹)
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                placeholder="e.g. 2999"
                min="0"
                className="input-editorial font-mono"
              />
            </div>

            {/* Return Reason */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Return Reason
              </label>
              <select
                name="return_reason"
                value={formData.return_reason}
                onChange={handleChange}
                className="input-editorial cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%231C1C1C%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0_center]"
              >
                <option value="">Select reason</option>
                {RETURN_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Warranty Left */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Warranty Remaining
              </label>
              <select
                name="warranty_left"
                value={formData.warranty_left}
                onChange={handleChange}
                className="input-editorial cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%231C1C1C%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0_center]"
              >
                <option value="">Select warranty status</option>
                {WARRANTY_OPTIONS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Repair History */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Repair History
              </label>
              <select
                name="repair_history"
                value={formData.repair_history}
                onChange={handleChange}
                className="input-editorial cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%231C1C1C%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0_center]"
              >
                <option value="">Select repair history</option>
                {REPAIR_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                City (Required)
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Mumbai, Delhi, Bangalore"
                className="input-editorial"
              />
            </div>

            {/* Locality */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Locality (Optional)
              </label>
              <input
                type="text"
                name="locality"
                value={formData.locality}
                onChange={handleChange}
                placeholder="e.g. Andheri West, Koramangala"
                className="input-editorial"
              />
            </div>

            {/* Divider */}
            <div className="pt-4 border-t border-charcoal/5">
              <button
                type="submit"
                disabled={!isValid || loading}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-charcoal text-cream font-sans text-sm font-medium uppercase tracking-[0.15em] rounded-full hover:bg-terracotta disabled:bg-charcoal/20 disabled:cursor-not-allowed transition-colors duration-300"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin"></span>
                    Processing
                  </>
                ) : (
                  <>
                    Submit for Grading
                    <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EvaluatePage
