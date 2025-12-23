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
            <div className="p-10 space-y-10 animate-fade-in">
                <h1 className="text-4xl font-bold">Dashboard</h1>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-muted/50 animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-10 space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Dashboard</h1>
                    <p className="text-muted-foreground text-lg">Welcome to your chatbot control center.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => navigate('/knowledge')} size="lg" className="gap-2">
                        <Upload className="h-4 w-4" /> Import Knowledge
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/integrations')} size="lg" className="gap-2">
                        <Zap className="h-4 w-4" /> Connect Apps
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="hover-lift group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Total Conversations</CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">{formatNumber(stats.conversations)}</div>
                        <p className="text-sm text-muted-foreground mt-1">Across all channels</p>
                    </CardContent>
                </Card>
                <Card className="hover-lift group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">Total Messages</CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <Users className="h-5 w-5 text-accent" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-gradient-to-br from-accent to-accent/70 bg-clip-text text-transparent">{formatNumber(stats.messages)}</div>
                        <p className="text-sm text-muted-foreground mt-1">in/out processed</p>
                    </CardContent>
                </Card>
                <Card className="hover-lift group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-semibold text-muted-foreground">AI Token Usage</CardTitle>
                        <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                            <Cpu className="h-5 w-5 text-success" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-gradient-to-br from-success to-success/70 bg-clip-text text-transparent">{formatNumber(stats.tokens)}</div>
                        <p className="text-sm text-muted-foreground mt-1">Total tokens consumed</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="text-xl">Recent Activity</CardTitle>
                        <CardDescription className="text-base">
                            Your bot's 5 most recent conversations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-12">No activity yet.</p>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-all duration-200">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold">
                                                    {activity.visitor_id}
                                                </p>
                                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase">
                                                    {activity.platform}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate max-w-[400px]">
                                                {activity.last_message}
                                            </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground ml-4">
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
                        <CardTitle className="text-xl">Quick Links</CardTitle>
                        <CardDescription className="text-base">Manage your workspace.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div
                            className="group flex items-center justify-between p-5 border-2 border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                            onClick={() => navigate('/billing')}
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-semibold group-hover:text-primary transition-colors">Billing & Plan</p>
                                <p className="text-xs text-muted-foreground">Manage your subscription</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                        <div
                            className="group flex items-center justify-between p-5 border-2 border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                            onClick={() => navigate('/settings')}
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-semibold group-hover:text-primary transition-colors">Settings</p>
                                <p className="text-xs text-muted-foreground">Configure profile & company</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
