import { useState } from 'react'

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home']

function EvaluatePage({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    item_id: '',
    category: '',
    condition_notes: '',
    simulated_image_label: '',
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const isValid = formData.item_id && formData.category && formData.condition_notes && formData.simulated_image_label

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
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Item ID */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Item Identifier
              </label>
              <input
                type="text"
                name="item_id"
                value={formData.item_id}
                onChange={handleChange}
                placeholder="ITEM-001"
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

            {/* Condition Notes */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Condition Notes
              </label>
              <textarea
                name="condition_notes"
                value={formData.condition_notes}
                onChange={handleChange}
                rows={3}
                placeholder="Describe visible wear, damage, or defects..."
                className="input-editorial resize-none"
              />
            </div>

            {/* Image Label */}
            <div>
              <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-charcoal/40 mb-2">
                Image Label (Simulated)
              </label>
              <input
                type="text"
                name="simulated_image_label"
                value={formData.simulated_image_label}
                onChange={handleChange}
                placeholder="e.g. scratched_phone_back"
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
