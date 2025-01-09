import { defineStore } from 'pinia';
import PocketBase from 'pocketbase';

const pb = new PocketBase(`${window.location.origin}/pb`);

export const usePocketBaseStore = defineStore('pocketbase', {
  state: () => ({
    isLoggedIn: false,
    user: null,
    error: null,
    pb,
  }),
  actions: {
    async login(username: string, password: string) {
      try {
        const authData: any = await this.pb
          .collection('users')
          .authWithPassword(username, password);
        this.isLoggedIn = true;
        this.user = authData.user;
        localStorage.setItem('authToken', authData.token); // Save token in localStorage
        this.error = null;
      } catch (error: any) {
        console.error('Login failed:', error);
        this.error = error.message || 'Login failed. Please try again.';
        throw error;
      }
    },
    async logout() {
      await this.pb.authStore.clear(); // Clear the auth store
      this.isLoggedIn = false; // Update logged-in state
      this.user = null; // Clear user data
      localStorage.removeItem('authToken'); // Remove token from localStorage
      this.error = null;
    },
    checkAuth() {
      const token = localStorage.getItem('authToken');
      if (token) {
        this.isLoggedIn = true; // Update state if token exists
      }
    },
  },
});

// Call checkAuth to initialize the state when the store is first used
const pocketBaseStore = usePocketBaseStore();
pocketBaseStore.checkAuth();
