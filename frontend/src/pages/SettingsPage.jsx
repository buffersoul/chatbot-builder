import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Building, User, Shield, CreditCard } from 'lucide-react';
import { SecuritySettings } from '../components/settings/SecuritySettings';

const SettingsPage = () => {
    const { user, company } = useAuthStore();
    const navigate = useNavigate();

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account and company preferences.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="company">Company</TabsTrigger>
                    <TabsTrigger value="team">Team</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* User Profile Tab */}
                <TabsContent value="profile" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Profile</CardTitle>
                            <CardDescription>Your personal account information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="flex gap-2">
                                    <User className="w-4 h-4 mt-3 text-muted-foreground absolute ml-3" />
                                    <Input id="email" value={user?.email || ''} readOnly className="pl-9 bg-muted" />
                                </div>
                                <p className="text-[0.8rem] text-muted-foreground">
                                    Contact support to change your email.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Input id="role" value={user?.role || ''} readOnly className="bg-muted capitalize" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="uid">User ID</Label>
                                <Input id="uid" value={user?.id || ''} readOnly className="font-mono text-xs bg-muted" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Company Profile Tab */}
                <TabsContent value="company" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Details</CardTitle>
                            <CardDescription>Manage your company information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="companyName">Company Name</Label>
                                <div className="flex gap-2">
                                    <Building className="w-4 h-4 mt-3 text-muted-foreground absolute ml-3" />
                                    <Input id="companyName" value={company?.name || ''} readOnly className="pl-9 bg-muted" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tier">Subscription Tier</Label>
                                <div className="flex items-center gap-4">
                                    <Input id="tier" value={company?.subscription_tier || 'Free'} readOnly className="bg-muted capitalize" />
                                    <Button variant="outline" onClick={() => navigate('/billing')}>
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Manage Billing
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cid">Company ID</Label>
                                <Input id="cid" value={company?.id || ''} readOnly className="font-mono text-xs bg-muted" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Team Tab (Placeholder) */}
                <TabsContent value="team" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Members</CardTitle>
                            <CardDescription>Invite and manage your team.</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center py-10 text-muted-foreground">
                            <User className="h-10 w-10 mx-auto mb-4 opacity-50" />
                            <p>Team management is coming soon.</p>
                            <p className="text-sm">You will be able to invite members and assign roles.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security" className="mt-6">
                    <SecuritySettings />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsPage;
