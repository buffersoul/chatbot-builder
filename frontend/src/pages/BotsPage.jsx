import { useState, useEffect } from 'react'
import { useBotStore } from '@/store/botStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Bot,
    Plus,
    Trash2,
    Settings2,
    Loader2,
    MessageSquare,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function BotsPage() {
    const { bots, loading, fetchBots, createBot, updateBot, deleteBot } = useBotStore()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingBot, setEditingBot] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        system_prompt: ''
    })

    useEffect(() => {
        fetchBots()
    }, [fetchBots])

    const handleOpenDialog = (bot = null) => {
        if (bot) {
            setEditingBot(bot)
            setFormData({
                name: bot.name,
                description: bot.description || '',
                system_prompt: bot.system_prompt || ''
            })
        } else {
            setEditingBot(null)
            setFormData({
                name: '',
                description: '',
                system_prompt: ''
            })
        }
        setIsDialogOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setIsSaving(true)
            if (editingBot) {
                await updateBot(editingBot.id, formData)
                toast({ title: "Bot updated", description: "Identity changes saved." })
            } else {
                await createBot(formData)
                toast({ title: "Bot created", description: "You can now select it in the sidebar." })
            }
            setIsDialogOpen(false)
        } catch (error) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to save bot.",
                variant: "destructive"
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? All conversations, knowledge base documents, and tools for this bot will be permanently deleted.")) return

        try {
            await deleteBot(id)
            toast({ title: "Bot deleted" })
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete bot.", variant: "destructive" })
        }
    }

    return (
        <div className="p-8 space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bot Management</h1>
                    <p className="text-muted-foreground mt-2">
                        Create multiple AI personas with unique knowledge bases and tools.
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Bot
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="h-24 bg-muted/50" />
                            <CardContent className="h-32" />
                        </Card>
                    ))
                ) : bots.length === 0 ? (
                    <Card className="col-span-full py-12 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center text-center">
                            <Bot className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-lg font-medium">No bots yet</h3>
                            <p className="text-muted-foreground mb-6">Create your first bot to get started.</p>
                            <Button onClick={() => handleOpenDialog()}>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Bot
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    bots.map((bot) => (
                        <Card key={bot.id} className="group hover:border-primary/50 transition-colors shadow-sm overflow-hidden border-border/50">
                            <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                                <div className="flex justify-between items-start">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Bot className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(bot)}>
                                            <Settings2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(bot.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardTitle className="mt-4">{bot.name}</CardTitle>
                                <CardDescription className="line-clamp-2 min-h-[40px] italic">
                                    {bot.description || 'No description provided.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                                        <MessageSquare className="h-3 w-3" />
                                        System Persona
                                    </div>
                                    <p className="text-sm text-foreground line-clamp-3 bg-muted/50 p-3 rounded-md border border-border/50">
                                        {bot.system_prompt || 'No system prompt set.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingBot ? 'Edit Bot' : 'Create New Bot'}</DialogTitle>
                            <DialogDescription>
                                Set up a new bot identity. This will create a completely isolated environment for knowledge and tools.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Bot Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Customer Support Bot"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Short Description</Label>
                                <Input
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Briefly describe the purpose of this bot"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="prompt">System Prompt (The "Identity")</Label>
                                <Textarea
                                    id="prompt"
                                    className="min-h-[200px]"
                                    value={formData.system_prompt}
                                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                                    placeholder="You are a helpful support agent for..."
                                    required
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    This prompt defines how the AI behaves and what rules it follows.
                                </p>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingBot ? 'Save Changes' : 'Create Bot'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
