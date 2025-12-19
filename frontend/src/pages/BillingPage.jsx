import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { getPlans, getBillingUsage, createCheckoutSession, createPortalSession } from '../lib/api';
import { useAuthStore } from '../store/authStore';

const BillingPage = () => {
    const [plans, setPlans] = useState([]);
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusParams] = useSearchParams();
    const { user } = useAuthStore();
    const [error, setError] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Plans
            try {
                const plansData = await getPlans();
                setPlans(plansData);
            } catch (err) {
                console.error("Failed to fetch plans", err);
                setError("Failed to load plans.");
            }

            // Fetch Usage
            try {
                const usageData = await getBillingUsage();
                setUsage(usageData);
            } catch (err) {
                console.error("Failed to fetch usage", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubscribe = async (tierName, interval) => {
        try {
            setLoading(true);
            const { url } = await createCheckoutSession({ tier_name: tierName, interval });
            window.location.href = url;
        } catch (error) {
            console.error("Checkout failed", error);
            setLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        try {
            setLoading(true);
            const { url } = await createPortalSession();
            window.location.href = url;
        } catch (error) {
            console.error("Portal failed", error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const currentTierName = user?.company?.subscription_tier || 'free';
    const currentTier = plans.find(p => p.tier_name === currentTierName) || plans[0];

    // Calculate percentages
    const msgLimit = currentTier?.included_messages || 100;
    const tokenLimit = currentTier?.included_tokens || 50000;

    const msgPercent = Math.min(100, ((usage?.total_messages || 0) / msgLimit) * 100);
    const tokenPercent = Math.min(100, ((usage?.total_tokens || 0) / tokenLimit) * 100);

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing & subscription</h1>
                    <p className="text-muted-foreground mt-2">Manage your plan, usage, and billing info.</p>
                </div>
                <div className="space-x-4">
                    {currentTierName !== 'free' && (
                        <Button variant="outline" onClick={handleManageSubscription}>
                            Manage Subscription
                        </Button>
                    )}
                </div>
            </div>

            {statusParams.get('status') === 'success' && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
                    <Check className="h-4 w-4" />
                    <span>Subscription updated successfully!</span>
                </div>
            )}

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-2" role="alert">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="plans">Plans</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Current Plan Card */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Current Plan</CardTitle>
                                <CardDescription>Your subscription details</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-2xl font-bold capitalize">{currentTier?.display_name || 'Free'}</div>
                                    <Badge variant={currentTierName === 'free' ? 'secondary' : 'default'}>{currentTierName === 'free' ? 'Active' : 'Pro'}</Badge>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Billing Cycle: {user?.company?.billing_cycle || 'Monthly'}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Usage Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Usage This Month</CardTitle>
                                <CardDescription>Resets on {usage?.period_start ? new Date(usage.period_start).toLocaleDateString() : '1st of month'}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Messages</span>
                                        <span className="text-muted-foreground">{usage?.total_messages || 0} / {msgLimit.toLocaleString()}</span>
                                    </div>
                                    <Progress value={msgPercent} className="h-2" />
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>AI Tokens</span>
                                        <span className="text-muted-foreground">{usage?.total_tokens?.toLocaleString() || 0} / {tokenLimit.toLocaleString()}</span>
                                    </div>
                                    <Progress value={tokenPercent} className="h-2" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="plans" className="mt-6">
                    <div className="flex justify-center mb-6">
                        <div className="bg-muted p-1 rounded-lg flex gap-1">
                            <Button
                                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setBillingCycle('monthly')}
                            >
                                Monthly
                            </Button>
                            <Button
                                variant={billingCycle === 'annual' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setBillingCycle('annual')}
                            >
                                Yearly (Save ~20%)
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {plans.map((plan) => {
                            const price = billingCycle === 'monthly' ? plan.monthly_base_price : plan.annual_base_price;

                            return (
                                <Card key={plan.tier_name} className={`flex flex-col ${currentTierName === plan.tier_name ? 'border-primary ring-1 ring-primary' : ''}`}>
                                    <CardHeader>
                                        <CardTitle className="text-xl">{plan.display_name}</CardTitle>
                                        <CardDescription>
                                            <span className="text-3xl font-bold text-foreground">
                                                ${(price / 100).toFixed(0)}
                                            </span>
                                            <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center">
                                                <Check className="mr-2 h-4 w-4 text-primary" />
                                                {plan.included_messages.toLocaleString()} Messages
                                            </li>
                                            <li className="flex items-center">
                                                <Check className="mr-2 h-4 w-4 text-primary" />
                                                {plan.included_tokens.toLocaleString()} Tokens
                                            </li>
                                            {plan.features?.map((feature, i) => (
                                                <li key={i} className="flex items-center capitalize">
                                                    <Check className="mr-2 h-4 w-4 text-primary" />
                                                    {feature.replace(/_/g, ' ')}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <CardFooter>
                                        {currentTierName === plan.tier_name && user?.company?.billing_cycle === billingCycle ? (
                                            <Button className="w-full" disabled>Current Plan</Button>
                                        ) : (
                                            <Button className="w-full" onClick={() => handleSubscribe(plan.tier_name, billingCycle)}>
                                                {plan.monthly_base_price === 0 ? 'Select Free' : 'Upgrade'}
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                <TabsContent value="invoices" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices</CardTitle>
                            <CardDescription>View and download past invoices</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-6 text-muted-foreground">
                                <p>Invoices are managed directly via Stripe Portal.</p>
                                <Button variant="link" onClick={handleManageSubscription}>
                                    Go into Billing Portal
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default BillingPage;
