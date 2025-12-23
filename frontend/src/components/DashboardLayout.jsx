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
        { href: '/external-apis', icon: Bot, label: 'API Tools', roles: ['owner', 'admin'] },
        { href: '/billing', icon: CreditCard, label: 'Billing', roles: ['owner'] },
        { href: '/settings', icon: Settings, label: 'Settings', roles: ['owner', 'admin'] },
    ]

    return (
        <div className="min-h-screen bg-gradient-subtle flex">
            {/* Sidebar */}
            <aside className="w-64 bg-card/95 backdrop-blur-xl border-r border-border/50 flex flex-col fixed h-full inset-y-0 z-50 shadow-lg">
                {/* Logo Section */}
                <div className="p-6 flex items-center gap-3 border-b border-border/50">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                        <Bot className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Chatbot Builder
                    </span>
                </div>

                {/* Company Info */}
                <div className="px-4 pt-6 pb-4">
                    <div className="mb-3 px-3 py-2 rounded-lg bg-muted/50 backdrop-blur-sm">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Workspace
                        </p>
                        <p className="text-sm font-semibold text-foreground mt-1 truncate">
                            {company?.name || 'Company'}
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            if (item.roles && !item.roles.includes(user?.role)) return null;
                            const Icon = item.icon
                            const isActive = location.pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    to={item.href}
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-md'
                                        : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                                        }`}
                                >
                                    <Icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? '' : 'group-hover:scale-110'}`} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* User Profile Section */}
                <div className="mt-auto p-4 border-t border-border/50 bg-muted/20">
                    <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-lg bg-card/50 backdrop-blur-sm">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-white shadow-md">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user?.first_name || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50"
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
