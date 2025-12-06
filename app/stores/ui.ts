import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    loading: false as boolean,
  }),
  actions: {
    setLoading(value: boolean) {
      this.loading = value
    },
  },
})
