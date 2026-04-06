import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ticketApi } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const response = await ticketApi.dashboardStats()
            setStats(response.data)
        } catch (error) {
            console.error('Failed to load stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        const colors = {
            OPEN: 'bg-blue-100 text-blue-800',
            IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
            RESOLVED: 'bg-green-100 text-green-800',
            CLOSED: 'bg-gray-100 text-gray-800',
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getPriorityColor = (priority) => {
        const colors = {
            URGENT: 'bg-red-100 text-red-800 border-red-200',
            HIGH: 'bg-orange-100 text-orange-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            LOW: 'bg-green-100 text-green-800',
        }
        return colors[priority] || 'bg-gray-100 text-gray-800'
    }

    const getSentimentColor = (sentiment) => {
        const colors = {
            positive: 'bg-green-100 text-green-800',
            neutral: 'bg-yellow-100 text-yellow-800',
            negative: 'bg-red-100 text-red-800',
        }
        return colors[sentiment] || 'bg-gray-100 text-gray-800'
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
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <Link
                    to="/tickets/new"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Create New Ticket
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Tickets</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                        </div>
                        <div className="text-4xl opacity-50">🎫</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Open Tickets</p>
                            <p className="text-3xl font-bold text-blue-600">{stats?.by_status?.OPEN || 0}</p>
                        </div>
                        <div className="text-4xl opacity-50">📬</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">In Progress</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats?.by_status?.IN_PROGRESS || 0}</p>
                        </div>
                        <div className="text-4xl opacity-50">⚡</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Resolved</p>
                            <p className="text-3xl font-bold text-green-600">{stats?.by_status?.RESOLVED || 0}</p>
                        </div>
                        <div className="text-4xl opacity-50">✅</div>
                    </div>
                </div>
            </div>

            {/* Priority & Sentiment Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Priority Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h2>
                    <div className="space-y-3">
                        {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                            <div key={priority} className="flex items-center justify-between">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(priority)}`}>
                                    {priority}
                                </span>
                                <div className="flex-1 mx-4">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${priority === 'URGENT' ? 'bg-red-500' : priority === 'HIGH' ? 'bg-orange-500' : priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'}`}
                                            style={{
                                                width: `${((stats?.by_priority?.[priority] || 0) / (stats?.total || 1)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 w-8">
                                    {stats?.by_priority?.[priority] || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sentiment Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Sentiment</h2>
                    <div className="space-y-3">
                        {['positive', 'neutral', 'negative'].map((sentiment) => (
                            <div key={sentiment} className="flex items-center justify-between">
                                <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${getSentimentColor(sentiment)}`}>
                                    {sentiment === 'positive' && '😊 '}
                                    {sentiment === 'neutral' && '😐 '}
                                    {sentiment === 'negative' && '😞 '}
                                    {sentiment}
                                </span>
                                <div className="flex-1 mx-4">
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${sentiment === 'positive' ? 'bg-green-500' : sentiment === 'neutral' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            style={{
                                                width: `${((stats?.sentiment_distribution?.[sentiment] || 0) / (stats?.total || 1)) * 100}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 w-8">
                                    {stats?.sentiment_distribution?.[sentiment] || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Ticket Categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(stats?.by_category || {}).map(([category, count]) => (
                        <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {category === 'technical' && '🔧 Technical'}
                                {category === 'billing' && '💰 Billing'}
                                {category === 'account' && '👤 Account'}
                                {category === 'feature_request' && '💡 Feature'}
                                {category === 'general_inquiry' && '❓ General'}
                            </p>
                        </div>
                    ))}
                    {Object.keys(stats?.by_category || {}).length === 0 && (
                        <p className="col-span-full text-center text-gray-500 py-4">
                            No tickets categorized yet
                        </p>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        to="/tickets/new"
                        className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                    >
                        <span className="text-2xl">➕</span>
                        <div>
                            <p className="font-medium text-gray-900">Create Ticket</p>
                            <p className="text-sm text-gray-500">Submit a new support request</p>
                        </div>
                    </Link>

                    <Link
                        to="/tickets?status=OPEN&ai_processed=false"
                        className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                        <span className="text-2xl">🤖</span>
                        <div>
                            <p className="font-medium text-gray-900">AI Unprocessed</p>
                            <p className="text-sm text-gray-500">
                                {stats?.unprocessed_count || 0} tickets need AI analysis
                            </p>
                        </div>
                    </Link>

                    <Link
                        to="/tickets?ai_sentiment=negative"
                        className="flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <span className="text-2xl">😞</span>
                        <div>
                            <p className="font-medium text-gray-900">Negative Tickets</p>
                            <p className="text-sm text-gray-500">
                                {stats?.sentiment_distribution?.negative || 0} need attention
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}
