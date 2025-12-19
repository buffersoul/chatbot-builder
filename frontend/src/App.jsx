import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import KnowledgeBasePage from './pages/KnowledgeBasePage'
import ChatPage from './pages/ChatPage'
import IntegrationsPage from './pages/IntegrationsPage'
import BillingPage from './pages/BillingPage'
import DashboardLayout from './components/DashboardLayout'
import { useAuthStore } from './store/authStore'

function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />

                {/* Protected Routes */}
                <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
                    <Route path="/" element={
                        <div className="p-8">
                            <h1 className="text-3xl font-bold">Dashboard</h1>
                            <p className="text-muted-foreground mt-2">Welcome to your chatbot control center.</p>
                        </div>
                    } />
                    <Route path="/knowledge" element={<KnowledgeBasePage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/integrations" element={<IntegrationsPage />} />
                    <Route path="/billing" element={<BillingPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                    <Route path="/conversations" element={<div className="p-8">Conversations (Coming Soon)</div>} />
                    <Route path="/settings" element={<div className="p-8">Settings (Coming Soon)</div>} />
                </Route>
            </Routes>
        </div>
    )
}

export default App
