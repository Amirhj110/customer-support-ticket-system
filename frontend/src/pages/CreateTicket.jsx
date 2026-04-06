import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ticketApi, aiApi } from '../services/api'

export default function CreateTicket() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    })
    const [aiPreview, setAiPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handlePreviewAI = async () => {
        if (!formData.title || !formData.description) return

        setAnalyzing(true)
        try {
            const response = await aiApi.analyze(formData)
            setAiPreview(response.data.analysis)
        } catch (error) {
            console.error('AI preview failed:', error)
        } finally {
            setAnalyzing(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title.trim() || !formData.description.trim()) return

        setLoading(true)
        try {
            const response = await ticketApi.create(formData)
            navigate(`/tickets/${response.data.id}`)
        } catch (error) {
            console.error('Failed to create ticket:', error)
            alert('Failed to create ticket. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <Link to="/tickets" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
                    ← Back to tickets
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Create New Ticket</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                name="title"
                                type="text"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                placeholder="Brief summary of your issue"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={8}
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                                placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, etc."
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading || !formData.title.trim() || !formData.description.trim()}
                                className="flex-1 py-3 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Ticket'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* AI Preview */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">🤖 AI Preview</h2>
                        <button
                            onClick={handlePreviewAI}
                            disabled={analyzing || !formData.title || !formData.description}
                            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors disabled:opacity-50"
                        >
                            {analyzing ? 'Analyzing...' : 'Analyze'}
                        </button>
                    </div>

                    {!aiPreview ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-4xl mb-2">🤖</p>
                            <p>Enter a title and description to see AI analysis</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 mb-1">Category</p>
                                    <p className="font-medium capitalize">{aiPreview.category?.replace('_', ' ')}</p>
                                    <p className="text-xs text-gray-400">{Math.round(aiPreview.category_confidence * 100)}% confidence</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 mb-1">Priority</p>
                                    <p className={`font-medium capitalize ${aiPreview.priority === 'urgent' ? 'text-red-600' :
                                            aiPreview.priority === 'high' ? 'text-orange-600' :
                                                aiPreview.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                        }`}>{aiPreview.priority}</p>
                                </div>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <p className="text-xs text-gray-500 mb-1">Sentiment</p>
                                <p className="font-medium capitalize">
                                    {aiPreview.sentiment === 'positive' && '😊 '}
                                    {aiPreview.sentiment === 'neutral' && '😐 '}
                                    {aiPreview.sentiment === 'negative' && '😞 '}
                                    {aiPreview.sentiment}
                                </p>
                            </div>

                            {aiPreview.summary && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">AI Summary</p>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{aiPreview.summary}</p>
                                </div>
                            )}

                            {aiPreview.suggested_response && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">💡 Suggested Response</p>
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg text-sm text-gray-700 max-h-40 overflow-y-auto">
                                        {aiPreview.suggested_response}
                                    </div>
                                </div>
                            )}

                            {Object.keys(aiPreview.entities || {}).length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Extracted Entities</p>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(aiPreview.entities).map(([type, values]) => (
                                            values.map((value, idx) => (
                                                <span key={`${type}-${idx}`} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                                                    {value}
                                                </span>
                                            ))
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
