import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ticketApi } from '../services/api'

export default function TicketList() {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()

    const status = searchParams.get('status') || ''
    const priority = searchParams.get('priority') || ''
    const aiSentiment = searchParams.get('ai_sentiment') || ''

    useEffect(() => {
        loadTickets()
    }, [searchParams])

    const loadTickets = async () => {
        try {
            const params = {}
            if (status) params.status = status
            if (priority) params.priority = priority
            if (aiSentiment) params.ai_sentiment = aiSentiment

            const response = await ticketApi.list(params)
            setTickets(response.data)
        } catch (error) {
            console.error('Failed to load tickets:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const styles = {
            OPEN: 'bg-blue-100 text-blue-800',
            IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
            RESOLVED: 'bg-green-100 text-green-800',
            CLOSED: 'bg-gray-100 text-gray-800',
        }
        return styles[status] || 'bg-gray-100 text-gray-800'
    }

    const getPriorityBadge = (priority) => {
        const styles = {
            URGENT: 'bg-red-100 text-red-800',
            HIGH: 'bg-orange-100 text-orange-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            LOW: 'bg-green-100 text-green-800',
        }
        return styles[priority] || 'bg-gray-100 text-gray-800'
    }

    const getSentimentBadge = (sentiment) => {
        const styles = {
            positive: 'bg-green-100 text-green-800',
            neutral: 'bg-yellow-100 text-yellow-800',
            negative: 'bg-red-100 text-red-800',
        }
        return styles[sentiment] || 'bg-gray-100 text-gray-800'
    }

    const getCategoryBadge = (category) => {
        const styles = {
            technical: 'bg-purple-100 text-purple-800',
            billing: 'bg-teal-100 text-teal-800',
            account: 'bg-indigo-100 text-indigo-800',
            feature_request: 'bg-pink-100 text-pink-800',
            general_inquiry: 'bg-gray-100 text-gray-800',
        }
        return styles[category] || 'bg-gray-100 text-gray-800'
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
                <Link
                    to="/tickets/new"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Create New Ticket
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <div className="flex flex-wrap gap-4">
                    <select
                        value={status}
                        onChange={(e) => {
                            const newParams = new URLSearchParams(searchParams)
                            if (e.target.value) {
                                newParams.set('status', e.target.value)
                            } else {
                                newParams.delete('status')
                            }
                            setSearchParams(newParams)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>

                    <select
                        value={priority}
                        onChange={(e) => {
                            const newParams = new URLSearchParams(searchParams)
                            if (e.target.value) {
                                newParams.set('priority', e.target.value)
                            } else {
                                newParams.delete('priority')
                            }
                            setSearchParams(newParams)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                        <option value="">All Priority</option>
                        <option value="URGENT">Urgent</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>

                    <select
                        value={aiSentiment}
                        onChange={(e) => {
                            const newParams = new URLSearchParams(searchParams)
                            if (e.target.value) {
                                newParams.set('ai_sentiment', e.target.value)
                            } else {
                                newParams.delete('ai_sentiment')
                            }
                            setSearchParams(newParams)
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                        <option value="">All Sentiment</option>
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="negative">Negative</option>
                    </select>

                    {(status || priority || aiSentiment) && (
                        <button
                            onClick={() => setSearchParams(new URLSearchParams())}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Tickets List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {tickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">No tickets found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {tickets.map((ticket) => (
                            <Link
                                key={ticket.id}
                                to={`/tickets/${ticket.id}`}
                                className="block p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-500">#{ticket.id}</span>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getStatusBadge(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${getPriorityBadge(ticket.priority)}`}>
                                                {ticket.priority}
                                            </span>
                                            {ticket.ai_sentiment && (
                                                <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${getSentimentBadge(ticket.ai_sentiment)}`}>
                                                    {ticket.ai_sentiment === 'positive' && '😊 '}
                                                    {ticket.ai_sentiment === 'neutral' && '😐 '}
                                                    {ticket.ai_sentiment === 'negative' && '😞 '}
                                                    {ticket.ai_sentiment}
                                                </span>
                                            )}
                                            {!ticket.ai_processed && (
                                                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                                                    🤖 Needs AI
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-base font-medium text-gray-900 truncate">{ticket.title}</h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span>By {ticket.created_by_username}</span>
                                            {ticket.assigned_to_username && (
                                                <span>→ {ticket.assigned_to_username}</span>
                                            )}
                                            <span>{formatDate(ticket.created_at)}</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex flex-col items-end gap-2">
                                        {ticket.ai_category && (
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${getCategoryBadge(ticket.ai_category)}`}>
                                                {ticket.ai_category.replace('_', ' ')}
                                            </span>
                                        )}
                                        {ticket.comment_count > 0 && (
                                            <span className="text-sm text-gray-500">💬 {ticket.comment_count}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
