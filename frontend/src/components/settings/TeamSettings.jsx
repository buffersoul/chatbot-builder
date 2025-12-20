import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Plus, Trash2, Mail, Copy, Check, MoreVertical, Shield, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import * as api from "@/lib/api";

const TeamSettings = () => {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [inviteOpen, setInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("agent");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState(null);
    const [copied, setCopied] = useState(false);

    // Current User context
    const currentUser = useAuthStore((state) => state.user);

    const { toast } = useToast();

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const data = await api.getTeam();
            setUsers(data.users);
            setInvitations(data.invitations);
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error fetching team",
                description: error.response?.data?.error || "Details could not be loaded",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            setInviteLoading(true);
            const res = await api.createInvitation({
                email: inviteEmail,
                role: inviteRole,
            });

            if (res.link) {
                setGeneratedLink(res.link);
                toast({
                    title: "Invitation Created",
                    description: "Use the link below to invite the user.",
                });
                fetchTeam(); // Refresh list
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Invitation Failed",
                description: error.response?.data?.error || "Could not create invitation",
            });
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRevoke = async (id) => {
        try {
            await api.revokeInvitation(id);
            toast({
                title: "Invitation Revoked",
                description: "The invitation has been cancelled.",
            });
            fetchTeam();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not revoke invitation",
            });
        }
    };

    const handleRemoveUser = async (userId) => {
        if (!confirm("Are you sure you want to remove this user? This action is irreversible.")) return;
        try {
            await api.removeUser(userId);
            toast({
                title: "User Removed",
                description: "The user has been removed from the team.",
            });
            fetchTeam();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.error || "Could not remove user",
            });
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await api.updateMemberRole(userId, newRole);
            toast({
                title: "Role Updated",
                description: `User role updated to ${newRole}.`,
            });
            fetchTeam();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.error || "Could not update role",
            });
        }
    };

    const copyToClipboard = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const resetInviteForm = () => {
        setInviteOpen(false);
        setGeneratedLink(null);
        setInviteEmail("");
        setInviteRole("agent");
    };

    // Helper to check if current user can manage target user
    const canManage = (targetUser) => {
        // Can't manage self
        if (targetUser.id === currentUser.id) return false;

        // Owner can manage everyone (except self)
        if (currentUser.role === 'owner') return true;

        // Admin can manage Agents, but not Admins or Owners
        if (currentUser.role === 'admin') {
            return targetUser.role === 'agent';
        }

        return false;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            Manage your team members and their roles.
                        </CardDescription>
                    </div>
                    <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Invite Member
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Invite Team Member</DialogTitle>
                                <DialogDescription>
                                    Send an invitation link to a new team member.
                                </DialogDescription>
                            </DialogHeader>

                            {!generatedLink ? (
                                <form onSubmit={handleInvite} className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="col-span-3"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="role" className="text-right">
                                            Role
                                        </Label>
                                        <select
                                            id="role"
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
                                        >
                                            <option value="agent">Agent</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={inviteLoading}>
                                            {inviteLoading && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Generate Invite Link
                                        </Button>
                                    </DialogFooter>
                                </form>
                            ) : (
                                <div className="py-4 space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="grid flex-1 gap-2">
                                            <Label htmlFor="link" className="sr-only">
                                                Link
                                            </Label>
                                            <Input
                                                id="link"
                                                defaultValue={generatedLink}
                                                readOnly
                                                className="h-9"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            size="sm"
                                            className="px-3"
                                            onClick={copyToClipboard}
                                        >
                                            <span className="sr-only">Copy</span>
                                            {copied ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <p>Share this link with the user to let them join.</p>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" onClick={resetInviteForm}>
                                            Done
                                        </Button>
                                    </DialogFooter>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {user.first_name} {user.last_name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {user.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {canManage(user) && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleRemoveUser(user.id)} className="text-red-600">
                                                        <UserMinus className="mr-2 h-4 w-4" />
                                                        Remove User
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'admin')} disabled={user.role === 'admin'}>
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Make Admin
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateRole(user.id, 'agent')} disabled={user.role === 'agent'}>
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Make Agent
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pending Invitations Section */}
            {invitations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Invitations</CardTitle>
                        <CardDescription>
                            invitations that have been sent but not yet accepted.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invitations.map((invite) => (
                                    <TableRow key={invite.id}>
                                        <TableCell>{invite.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {invite.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(invite.expires_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRevoke(invite.id)}
                                                className="text-destructive hover:text-destructive/90"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TeamSettings;
