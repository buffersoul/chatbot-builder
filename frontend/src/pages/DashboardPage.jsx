import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Assuming these exist
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Cpu, ArrowRight, Zap, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../lib/api';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ conversations: 0, messages: 0, tokens: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Parallel fetch for better performance
                const [statsRes, activityRes] = await Promise.all([
                    apiClient.get('/dashboard/stats'),
                    apiClient.get('/dashboard/recent')
                ]);

                setStats(statsRes.data);
                setRecentActivity(activityRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Failed to load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num || 0);
    };

    if (loading) {
        return (
            <div className="p-8 space-y-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-2">Welcome to your chatbot control center.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate('/knowledge')}>
                        <Upload className="mr-2 h-4 w-4" /> Import Knowledge
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/integrations')}>
                        <Zap className="mr-2 h-4 w-4" /> Connect Apps
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats.conversations)}</div>
                        <p className="text-xs text-muted-foreground">Across all channels</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats.messages)}</div>
                        <p className="text-xs text-muted-foreground">in/out processed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Token Usage</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(stats.tokens)}</div>
                        <p className="text-xs text-muted-foreground">Total tokens consumed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your bot's 5 most recent conversations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No activity yet.</p>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {activity.visitor_id}
                                                <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase">
                                                    {activity.platform}
                                                </span>
                                            </p>
                                            <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                                                {activity.last_message}
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(activity.last_message_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links Card */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Links</CardTitle>
                        <CardDescription>Manage your workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => navigate('/billing')}
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Billing & Plan</p>
                                <p className="text-xs text-muted-foreground">Manage your subscription</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div
                            className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => navigate('/settings')}
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-medium">Settings</p>
                                <p className="text-xs text-muted-foreground">Configure profile & company</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
