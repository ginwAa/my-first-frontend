import { defineStore } from 'pinia';

export const useUserStore = defineStore( 'user', {
    state: () => {
        return {
            username: '',
            account: '',
            token: '',
            role: '',
        };
    },
})