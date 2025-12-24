import { useEffect } from 'react'
import { useBotStore } from '@/store/botStore'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Bot, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function BotSelector() {
    const { bots, selectedBotId, fetchBots, selectBot } = useBotStore()
    const navigate = useNavigate()

    useEffect(() => {
        fetchBots()
    }, [fetchBots])

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Selected Bot
                </p>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-5 w-5"
                    onClick={() => navigate('/bots')}
                    title="Manage Bots"
                >
                    <Plus className="h-3 w-3" />
                </Button>
            </div>

            <Select value={selectedBotId || ""} onValueChange={selectBot}>
                <SelectTrigger className="w-full bg-muted/30 border-none shadow-none hover:bg-muted/50 transition-colors">
                    <SelectValue placeholder={bots.length === 0 ? "Create a Bot" : "Select Bot"} />
                </SelectTrigger>
                <SelectContent>
                    {bots.map((bot) => (
                        <SelectItem key={bot.id} value={bot.id}>
                            <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4 text-primary" />
                                <span className="truncate max-w-[140px]">{bot.name}</span>
                            </div>
                        </SelectItem>
                    ))}
                    {bots.length === 0 && (
                        <div className="p-2 text-xs text-center text-muted-foreground">
                            No bots found
                        </div>
                    )}
                </SelectContent>
            </Select>
        </div>
    )
}
