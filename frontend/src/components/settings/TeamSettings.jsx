import React, { useState, useEffect } from 'react';
import { getTeam, createInvitation, revokeInvitation } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, Mail, Copy, Check } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast"; // Assuming you have a toast hook, or I'll implement a simple one/alert

const TeamSettings = () => {
    const [users, setUsers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isInviteOpen, setIsInviteOpen] = useState(false);

    // Invite Form
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteProcessing, setInviteProcessing] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);
    const [copied, setCopied] = useState(false);

    const fetchTeam = async () => {
        try {
            const data = await getTeam();
            setUsers(data.users);
            setInvitations(data.invitations);
        } catch (error) {
            console.error("Failed to load team", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteProcessing(true);
        try {
            const data = await createInvitation(inviteEmail, 'agent'); // Default to agent
            setGeneratedLink(data.link);
            fetchTeam(); // Refresh lists
        } catch (error) {
            console.error("Invite failed", error);
            // Show error
        } finally {
            setInviteProcessing(false);
        }
    };

    const handleRevoke = async (id) => {
        if (!confirm('Are you sure you want to revoke this invitation?')) return;
        try {
            await revokeInvitation(id);
            setInvitations(prev => prev.filter(vals => vals.id !== id));
        } catch (error) {
            console.error("Revoke failed", error);
        }
    };

    const copyToClipboard = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareViaEmail = () => {
        if (generatedLink) {
            const subject = "Invitation to join our team";
            const body = `Hi,\n\nI'm inviting you to join our team. Please click the link below to set up your account:\n\n${generatedLink}`;
            window.open(`mailto:${inviteEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        }
    };

    const resetInviteForm = () => {
        setInviteEmail('');
        setGeneratedLink(null);
        setIsInviteOpen(false);
    };

    if (loading) return <div className="text-center py-10"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage your team members and permissions.</CardDescription>
                </div>
                <Dialog open={isInviteOpen} onOpenChange={(open) => !open && resetInviteForm()}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsInviteOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Invite Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Invite New Member</DialogTitle>
                            <DialogDescription>
                                Enter the email address of the person you want to invite.
                            </DialogDescription>
                        </DialogHeader>

                        {!generatedLink ? (
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="colleague@company.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={inviteProcessing}>
                                        {inviteProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Generate Link
                                    </Button>
                                </DialogFooter>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-md space-y-2">
                                    <Label className="text-xs text-muted-foreground">Invitation Link</Label>
                                    <div className="flex gap-2">
                                        <Input value={generatedLink} readOnly />
                                        <Button size="icon" variant="outline" onClick={copyToClipboard}>
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={shareViaEmail}>
                                        <Mail className="w-4 h-4 mr-2" />
                                        Share via Email App
                                    </Button>
                                    <Button onClick={resetInviteForm}>
                                        Done
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Active Members */}
                    <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Active Members</h3>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{u.first_name} {u.last_name}</span>
                                                    <span className="text-xs text-muted-foreground">{u.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{u.role}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {/* Pending Invitations */}
                    {invitations.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Pending Invitations</h3>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Sent</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invitations.map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell>{inv.email}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {new Date(inv.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleRevoke(inv.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TeamSettings;
