import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ticketApi, commentApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function TicketDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [ticket, setTicket] = useState(null)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [assigning, setAssigning] = useState(false)

    useEffect(() => {
        loadTicket()
        loadComments()
    }, [id])

    const loadTicket = async () => {
        try {
            const response = await ticketApi.get(id)
            setTicket(response.data)
        } catch (error) {
            console.error('Failed to load ticket:', error)
            navigate('/tickets')
        } finally {
            setLoading(false)
        }
    }

    const loadComments = async () => {
        try {
            const response = await commentApi.list(id)
            setComments(response.data)
        } catch (error) {
            console.error('Failed to load comments:', error)
        }
    }

    const handleStatusChange = async (newStatus) => {
        try {
            await ticketApi.update(id, { status: newStatus })
            loadTicket()
        } catch (error) {
            console.error('Failed to update status:', error)
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setSubmitting(true)
        try {
            await commentApi.create(id, { content: newComment })
            setNewComment('')
            loadComments()
        } catch (error) {
            console.error('Failed to add comment:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleAnalyze = async () => {
        setAnalyzing(true)
        try {
            await ticketApi.analyze(id)
            loadTicket()
        } catch (error) {
            console.error('Failed to analyze ticket:', error)
        } finally {
            setAnalyzing(false)
        }
    }

    const handleAssignAgent = async () => {
        setAssigning(true)
        try {
            await ticketApi.assignAgent(id)
            loadTicket()
        } catch (error) {
            console.error('Failed to assign agent:', error)
        } finally {
            setAssigning(false)
        }
    }

    const handleApplySuggestedResponse = async () => {
        try {
            await ticketApi.applySuggestedResponse(id)
            loadComments()
            loadTicket()
        } catch (error) {
            console.error('Failed to apply suggested response:', error)
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Ticket not found</p>
                <Link to="/tickets" className="text-primary-600 hover:underline mt-2 inline-block">
                    Back to tickets
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Link to="/tickets" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
                        ← Back to tickets
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">#{ticket.id} {ticket.title}</h1>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        {analyzing ? '🤖 Analyzing...' : '🤖 Re-analyze with AI'}
                    </button>
                    {user.is_staff && !ticket.assigned_to && (
                        <button
                            onClick={handleAssignAgent}
                            disabled={assigning}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                            {assigning ? 'Assigning...' : '🤖 Auto-assign Agent'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
                        <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                    </div>

                    {/* AI Analysis */}
                    {ticket.ai_processed && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Analysis</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Category</p>
                                    <p className="font-medium capitalize">{ticket.ai_category?.replace('_', ' ')}</p>
                                    <p className="text-xs text-gray-400">{Math.round((ticket.ai_category_confidence || 0) * 100)}% confidence</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Priority</p>
                                    <p className={`font-medium capitalize ${ticket.ai_priority === 'urgent' ? 'text-red-600' :
                                            ticket.ai_priority === 'high' ? 'text-orange-600' :
                                                ticket.ai_priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                        }`}>{ticket.ai_priority}</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Sentiment</p>
                                    <p className="font-medium capitalize">
                                        {ticket.ai_sentiment === 'positive' && '😊 '}
                                        {ticket.ai_sentiment === 'neutral' && '😐 '}
                                        {ticket.ai_sentiment === 'negative' && '😞 '}
                                        {ticket.ai_sentiment}
                                    </p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-500">Score</p>
                                    <p className="font-medium">{Math.round((ticket.ai_sentiment_score || 0) * 100)}%</p>
                                </div>
                            </div>

                            {ticket.ai_summary && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-1">AI Summary</p>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{ticket.ai_summary}</p>
                                </div>
                            )}

                            {ticket.ai_entities && Object.keys(ticket.ai_entities).length > 0 && (
                                <div className="mb-4">
                                    <p className="text-sm text-gray-500 mb-2">Extracted Entities</p>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(ticket.ai_entities).map(([type, values]) => (
                                            values.map((value, idx) => (
                                                <span key={`${type}-${idx}`} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                                    {value}
                                                </span>
                                            ))
                                        ))}
                                    </div>
                                </div>
                            )}

                            {ticket.ai_suggested_response && (
                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm text-gray-500">💡 Suggested Response</p>
                                        <button
                                            onClick={handleApplySuggestedResponse}
                                            className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                        >
                                            Apply Response
                                        </button>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg text-gray-700 whitespace-pre-wrap">
                                        {ticket.ai_suggested_response}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Comments */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments ({comments.length})</h2>

                        <div className="space-y-4 mb-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className={`p-4 rounded-lg ${comment.is_ai_suggested ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200' : 'bg-gray-50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium text-gray-900">{comment.author_username}</span>
                                        <span className="text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                                    {comment.is_ai_suggested && (
                                        <span className="inline-block mt-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                            🤖 AI Generated
                                        </span>
                                    )}
                                </div>
                            ))}

                            {comments.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No comments yet</p>
                            )}
                        </div>

                        <form onSubmit={handleAddComment} className="border-t pt-4">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                            />
                            <div className="flex justify-end mt-3">
                                <button
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Status</h3>
                        <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        >
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>

                    {/* Details */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">Details</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created by</span>
                                <span className="font-medium">{ticket.created_by_username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Assigned to</span>
                                <span className="font-medium">{ticket.assigned_to_username || 'Unassigned'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created</span>
                                <span className="font-medium">{formatDate(ticket.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Updated</span>
                                <span className="font-medium">{formatDate(ticket.updated_at)}</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Badge */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">AI Processing</h3>
                        <div className="flex items-center gap-2">
                            {ticket.ai_processed ? (
                                <>
                                    <span className="text-green-500">✓</span>
                                    <span className="text-green-700 font-medium">Processed</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-yellow-500">⏳</span>
                                    <span className="text-yellow-700 font-medium">Pending</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
