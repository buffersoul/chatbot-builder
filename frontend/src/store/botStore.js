import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as api from '../lib/api';

export const useBotStore = create(
    persist(
        (set, get) => ({
            bots: [],
            selectedBotId: null,
            loading: false,
            error: null,

            fetchBots: async () => {
                set({ loading: true });
                try {
                    const response = await api.getBots();
                    set({ bots: response, loading: false });

                    // Auto-select first bot if none selected
                    if (!get().selectedBotId && response.length > 0) {
                        set({ selectedBotId: response[0].id });
                    }
                } catch (error) {
                    set({ error: error.message, loading: false });
                }
            },

            selectBot: (botId) => {
                set({ selectedBotId: botId });
            },

            createBot: async (botData) => {
                try {
                    const newBot = await api.createBot(botData);
                    set((state) => ({ bots: [...state.bots, newBot] }));
                    if (!get().selectedBotId) {
                        set({ selectedBotId: newBot.id });
                    }
                    return newBot;
                } catch (error) {
                    throw error;
                }
            },

            updateBot: async (id, botData) => {
                try {
                    const updatedBot = await api.updateBot(id, botData);
                    set((state) => ({
                        bots: state.bots.map((b) => (b.id === id ? updatedBot : b))
                    }));
                    return updatedBot;
                } catch (error) {
                    throw error;
                }
            },

            getSelectedBot: () => {
                const { bots, selectedBotId } = get();
                return bots.find((b) => b.id === selectedBotId) || null;
            }
        }),
        {
            name: 'bot-storage',
            partialize: (state) => ({ selectedBotId: state.selectedBotId }),
        }
    )
);
