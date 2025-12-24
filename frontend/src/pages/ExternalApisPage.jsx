import React, { useState, useEffect } from 'react';
import {
    Plus,
    Settings,
    Trash2,
    ExternalLink,
    Loader2,
    Check,
    AlertCircle,
    Code,
    Key,
    Globe,
    Clock,
    Database
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import * as api from '@/lib/api';
import { useBotStore } from '../store/botStore'

export default function ExternalApisPage() {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingApi, setEditingApi] = useState(null);
    const { selectedBotId } = useBotStore();
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        endpoint_url: '',
        method: 'GET',
        auth_type: 'none',
        auth_credentials: '',
        timeout_ms: 10000,
        parameters_schema: JSON.stringify({
            properties: {},
            required: []
        }, null, 2)
    });

    useEffect(() => {
        if (selectedBotId) {
            fetchApis();
        } else {
            setApis([]);
            setLoading(false);
        }
    }, [selectedBotId]);

    const fetchApis = async () => {
        try {
            setLoading(true);
            const data = await api.getCompanyApis(selectedBotId);
            setApis(data);
        } catch (error) {
            console.error('Fetch APIs error:', error);
            toast({
                title: "Error",
                description: "Failed to load API tools.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (apiToEdit = null) => {
        if (apiToEdit) {
            setEditingApi(apiToEdit);
            setFormData({
                name: apiToEdit.name,
                description: apiToEdit.description || '',
                endpoint_url: apiToEdit.endpoint_url,
                method: apiToEdit.method,
                auth_type: apiToEdit.auth_type,
                auth_credentials: apiToEdit.auth_credentials_encrypted || '',
                timeout_ms: apiToEdit.timeout_ms,
                parameters_schema: JSON.stringify(apiToEdit.parameters_schema || { properties: {}, required: [] }, null, 2)
            });
        } else {
            setEditingApi(null);
            setFormData({
                name: '',
                description: '',
                endpoint_url: '',
                method: 'GET',
                auth_type: 'none',
                auth_credentials: '',
                timeout_ms: 10000,
                parameters_schema: JSON.stringify({
                    properties: {},
                    required: []
                }, null, 2)
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);

            // Validate JSON
            let parsedSchema;
            try {
                parsedSchema = JSON.parse(formData.parameters_schema);
            } catch (error) {
                toast({
                    title: "Invalid JSON",
                    description: "Parameters schema must be a valid JSON object.",
                    variant: "destructive",
                });
                return;
            }

            const payload = {
                ...formData,
                bot_id: selectedBotId,
                parameters_schema: parsedSchema
            };

            if (editingApi) {
                await api.updateCompanyApi(editingApi.id, payload);
                toast({
                    title: "Success",
                    description: "API tool updated successfully.",
                });
            } else {
                await api.createCompanyApi(payload);
                toast({
                    title: "Success",
                    description: "API tool created successfully.",
                });
            }

            setIsDialogOpen(false);
            fetchApis();
        } catch (error) {
            console.error('Save API error:', error);
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to save API tool.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this API tool?")) return;

        try {
            await api.deleteCompanyApi(id);
            toast({
                title: "Success",
                description: "API tool deleted successfully.",
            });
            fetchApis();
        } catch (error) {
            console.error('Delete API error:', error);
            toast({
                title: "Error",
                description: "Failed to delete API tool.",
                variant: "destructive",
            });
        }
    };

    const handleToggleActive = async (apiItem) => {
        try {
            await api.updateCompanyApi(apiItem.id, { is_active: !apiItem.is_active });
            fetchApis();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to toggle status.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">API Tools</h1>
                    <p className="text-muted-foreground mt-2">
                        Create and manage external APIs that your chatbot can use as dynamic tools.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()} disabled={!selectedBotId}>
                    <Plus className="mr-2 h-4 w-4" />
                    New API Tool
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Connected APIs</CardTitle>
                    <CardDescription>
                        These APIs are registered as functions that your AI can call during conversations.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : !selectedBotId ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <AlertCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
                            <h3 className="text-lg font-medium text-amber-700">No bot selected</h3>
                            <p className="text-muted-foreground mb-6">Select or create a bot in the sidebar to manage its API tools.</p>
                        </div>
                    ) : apis.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No API tools found</h3>
                            <p className="text-muted-foreground mb-6">Get started by creating your first external tool integration for this bot.</p>
                            <Button variant="outline" onClick={() => handleOpenDialog()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add your first API
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Endpoint</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Auth</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {apis.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {item.description}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-1 rounded">{item.endpoint_url}</code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{item.method}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">{item.auth_type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={item.is_active}
                                                onCheckedChange={() => handleToggleActive(item)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" onClick={() => handleOpenDialog(item)}>
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive/90" onClick={() => handleDelete(item.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingApi ? 'Edit API Tool' : 'Create API Tool'}</DialogTitle>
                            <DialogDescription>
                                Configure an external API that the LLM can call to fetch or push data.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tool Name (Friendly)</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Order Status Checker"
                                        required
                                    />
                                    <p className="text-[10px] text-muted-foreground">Internal name will be converted to snake_case for the AI.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="method">HTTP Method</Label>
                                    <Select
                                        value={formData.method}
                                        onValueChange={(v) => setFormData({ ...formData, method: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GET">GET</SelectItem>
                                            <SelectItem value="POST">POST</SelectItem>
                                            <SelectItem value="PUT">PUT</SelectItem>
                                            <SelectItem value="DELETE">DELETE</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Instruction for AI)</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Tell the AI exactly what this tool does and when to use it..."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="url">Endpoint URL</Label>
                                <Input
                                    id="url"
                                    value={formData.endpoint_url}
                                    onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
                                    placeholder="https://api.yourservice.com/v1/orders/:order_id"
                                    required
                                />
                                <p className="text-[10px] text-muted-foreground">Use :param for dynamic URL substitution from parameters.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="auth_type">Authentication</Label>
                                    <Select
                                        value={formData.auth_type}
                                        onValueChange={(v) => setFormData({ ...formData, auth_type: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="bearer">Bearer Token</SelectItem>
                                            <SelectItem value="api_key">API Key (x-api-key)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="credentials">Credentials / Token</Label>
                                    <Input
                                        id="credentials"
                                        type="password"
                                        value={formData.auth_credentials}
                                        onChange={(e) => setFormData({ ...formData, auth_credentials: e.target.value })}
                                        placeholder={formData.auth_type === 'none' ? 'N/A' : 'Paste token or key here...'}
                                        disabled={formData.auth_type === 'none'}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="schema" className="flex items-center gap-2">
                                        <Code className="h-4 w-4" /> Parameters JSON Schema
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-xs"
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                parameters_schema: JSON.stringify({
                                                    properties: {
                                                        id: { type: "string", description: "The unique ID" }
                                                    },
                                                    required: ["id"]
                                                }, null, 2)
                                            })
                                        }}
                                    >
                                        Load Example
                                    </Button>
                                </div>
                                <Textarea
                                    id="schema"
                                    className="font-mono text-xs min-h-[150px]"
                                    value={formData.parameters_schema}
                                    onChange={(e) => setFormData({ ...formData, parameters_schema: e.target.value })}
                                    placeholder='{"properties": {"key": {"type": "string"}}, "required": ["key"]}'
                                    required
                                />
                                <p className="text-[10px] text-muted-foreground">Define the object structure that the LLM should generate when calling this tool.</p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingApi ? 'Update Tool' : 'Create Tool'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
