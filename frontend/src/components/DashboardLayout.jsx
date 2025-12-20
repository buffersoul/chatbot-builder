import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { Button } from './ui/button'
import {
    LayoutDashboard,
    Files,
    MessageSquare,
    Settings,
    LogOut,
    Bot,
    Share2,
    CreditCard // Added CreditCard
} from 'lucide-react'

function DashboardLayout() {
    const location = useLocation()
    const logout = useAuthStore((state) => state.logout)
    const user = useAuthStore((state) => state.user)
    const company = useAuthStore((state) => state.company)

    const navItems = [
        { href: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['owner', 'admin', 'agent'] },
        { href: '/knowledge', icon: Files, label: 'Knowledge Base', roles: ['owner', 'admin', 'agent'] },
        { href: '/chat', icon: MessageSquare, label: 'Experience Chat', roles: ['owner', 'admin', 'agent'] },
        { href: '/conversations', icon: MessageSquare, label: 'Conversations', roles: ['owner', 'admin', 'agent'] },
        { href: '/integrations', icon: Share2, label: 'Integrations', roles: ['owner', 'admin'] },
        { href: '/billing', icon: CreditCard, label: 'Billing', roles: ['owner'] },
        { href: '/settings', icon: Settings, label: 'Settings', roles: ['owner', 'admin'] },
    ]

    return (
        <div className="min-h-screen bg-muted/20 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r flex flex-col fixed h-full inset-y-0 z-50">
                <div className="p-6 flex items-center gap-2 border-b">
                    <Bot className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg">Chatbot Builder</span>
                </div>

                <div className="px-4 py-6">
                    <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {company?.name || 'Company'}
                    </div>
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            if (item.roles && !item.roles.includes(user?.role)) return null;
                            const Icon = item.icon
                            const isActive = location.pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.first_name || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                        onClick={logout}
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64">
                <Outlet />
            </main>
        </div>
    )
}

export default DashboardLayout
