import { useState, useEffect } from 'react'
import { aiApi } from '../services/api'

export default function Agents() {
    const [agents, setAgents] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAgents()
    }, [])

    const loadAgents = async () => {
        try {
            const response = await aiApi.getAgents()
            setAgents(response.data)
        } catch (error) {
            console.error('Failed to load agents:', error)
        } finally {
            setLoading(false)
        }
    }

    const getWorkloadColor = (percentage) => {
        if (percentage < 50) return 'bg-green-500'
        if (percentage < 80) return 'bg-yellow-500'
        return 'bg-red-500'
    }

    const getSpecializationIcon = (spec) => {
        const icons = {
            technical: '🔧',
            billing: '💰',
            account: '👤',
            general: '🎫'
        }
        return icons[spec] || '🎫'
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
                <h1 className="text-2xl font-bold text-gray-900">Support Agents</h1>
                <span className="text-sm text-gray-500">{agents.length} agents total</span>
            </div>

            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-500">Total Agents</p>
                    <p className="text-3xl font-bold text-gray-900">{agents.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-500">Available</p>
                    <p className="text-3xl font-bold text-green-600">
                        {agents.filter(a => a.is_available).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-500">Senior Agents</p>
                    <p className="text-3xl font-bold text-blue-600">
                        {agents.filter(a => a.is_senior).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <p className="text-sm text-gray-500">High Workload</p>
                    <p className="text-3xl font-bold text-orange-600">
                        {agents.filter(a => a.workload_percentage >= 80).length}
                    </p>
                </div>
            </div>

            {/* Agents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                    <div key={agent.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl">
                                    {agent.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{agent.username}</h3>
                                    <p className="text-sm text-gray-500">{agent.email}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${agent.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                {agent.is_available ? 'Available' : 'Offline'}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Specialization</span>
                                <span className="font-medium">
                                    {getSpecializationIcon(agent.specialization)} {agent.specialization_display}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Level</span>
                                <span className={`font-medium ${agent.is_senior ? 'text-blue-600' : 'text-gray-600'}`}>
                                    {agent.is_senior ? '⭐ Senior' : 'Junior'}
                                </span>
                            </div>

                            <div className="pt-2">
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-500">Workload</span>
                                    <span className="font-medium">
                                        {agent.current_tickets} / {agent.max_tickets} tickets
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all ${getWorkloadColor(agent.workload_percentage)}`}
                                        style={{ width: `${agent.workload_percentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">{agent.workload_percentage}% utilized</p>
                            </div>
                        </div>

                        {/* Specialization breakdown */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">Best for categories:</p>
                            <div className="flex flex-wrap gap-1">
                                {agent.specialization === 'technical' && ['Technical Issues', 'Bugs'].map(cat => (
                                    <span key={cat} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded">
                                        {cat}
                                    </span>
                                ))}
                                {agent.specialization === 'billing' && ['Billing Inquiries', 'Refunds'].map(cat => (
                                    <span key={cat} className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded">
                                        {cat}
                                    </span>
                                ))}
                                {agent.specialization === 'account' && ['Account Issues', 'Access'].map(cat => (
                                    <span key={cat} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded">
                                        {cat}
                                    </span>
                                ))}
                                {agent.specialization === 'general' && ['General Inquiries', 'Feature Requests'].map(cat => (
                                    <span key={cat} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {agents.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
                        <p className="text-gray-500">No agents found</p>
                        <p className="text-sm text-gray-400 mt-1">Create agent profiles in the admin panel</p>
                    </div>
                )}
            </div>
        </div>
    )
}
