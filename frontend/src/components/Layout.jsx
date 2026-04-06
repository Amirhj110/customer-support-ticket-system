import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
    const { user, logout } = useAuth()
    const location = useLocation()

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/tickets', label: 'Tickets', icon: '🎫' },
        { path: '/tickets/new', label: 'New Ticket', icon: '➕' },
    ]

    if (user?.is_staff) {
        navItems.push({ path: '/agents', label: 'Agents', icon: '👥' })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-primary-600">🎫 AI Support System</h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                                Welcome, <span className="font-medium">{user?.username}</span>
                                {user?.is_staff && (
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded">
                                        Admin
                                    </span>
                                )}
                            </span>
                            <button
                                onClick={logout}
                                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 h-12">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${isActive
                                        ? 'text-primary-600 border-b-2 border-primary-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`
                                }
                            >
                                <span className="mr-1.5">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}
