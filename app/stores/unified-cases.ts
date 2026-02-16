import { defineStore } from 'pinia'
import { api } from '../utils/api'

export interface UnifiedCaseEntry {
    id: number;
    case_id?: number | null;
    case_source_title?: string;
    user_id?: number | null;
    title?: string; description?: string;
    content?: string;
    date_of_event: string;
    type: string;
    visibility: string;
    author?: { name: string };
    created_at?: string;
}

export interface UnifiedCase {
    id: number;
    student_id: number;
    student?: { id: number, nombres: string, apellidos: string };
    status: 'open' | 'closed';
    created_at: string;
    cases: any[];
    timeline: UnifiedCaseEntry[];
}

export const useUnifiedCasesStore = defineStore('unified-cases', {
    state: () => ({
        unifiedCases: [] as UnifiedCase[],
        currentUnifiedCase: null as UnifiedCase | null,
        suggestions: [] as any[],
        loading: false,
        error: null as any,
    }),

    actions: {
        async fetchUnifiedCases() {
            this.loading = true
            try {
                const res = await api.get('/api/psychology/unified-cases')
                // Adjust if API returns wrapped data
                if (res && res.data) {
                    this.unifiedCases = res.data
                } else if (Array.isArray(res)) {
                    this.unifiedCases = res
                } else {
                    this.unifiedCases = []
                }
            } catch (error) {
                this.error = error
                console.error('Error fetching unified cases:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchSuggestions() {
            this.loading = true
            try {
                const res = await api.get('/api/psychology/unified-cases/suggestions')
                console.log('fetchSuggestions raw response:', res)

                // Handle cases where res might be the array directly or wrapped
                if (res && (res.data || Array.isArray(res.data))) {
                    this.suggestions = res.data
                } else if (Array.isArray(res)) {
                    this.suggestions = res
                } else {
                    console.warn('Unexpected suggestions response structure:', res)
                    this.suggestions = []
                }
            } catch (error) {
                this.error = error
                console.error('Error fetching suggestions:', error)
            } finally {
                this.loading = false
            }
        },

        async fetchStudentCases(studentId: number) {
            try {
                // Reuse suggestions endpoint filtering by student on client-side or add new endpoint?
                // For now, let's use the suggestions endpoint which returns students with multiple cases
                // This is a bit inefficient if we only want one student, but safe for now.
                // Ideally backend should have /api/students/{id}/psychology-cases?status=open&not_unified=true

                // Better approach: Let's assume there's a way to get student details including cases
                // Or filtered suggestions. 
                // Let's implement a client-side filter on suggestions for now to reuse logic
                // If the student appears in suggestions, they have unifiable cases.

                await this.fetchSuggestions()

                // Loose comparison to handle string/number mismatch
                const suggestion = this.suggestions.find((s: any) => s.id == studentId)

                return suggestion ? suggestion.psychology_cases : []
            } catch (error) {
                console.error('Error fetching student cases for unification:', error)
                return []
            }
        },

        async fetchUnifiedCase(id: number) {
            this.loading = true
            this.currentUnifiedCase = null
            try {
                const res = await api.get(`/api/psychology/unified-cases/${id}`)
                const resData = res?.data || res
                if (resData) {
                    this.currentUnifiedCase = {
                        ...resData,
                        timeline: res.timeline || resData.timeline // Handle different response structures
                    }
                }
            } catch (error) {
                this.error = error
                console.error('Error fetching unified case:', error)
            } finally {
                this.loading = false
            }
        },

        async unifyCases(payload: { student_id: number; case_ids: number[] }) {
            this.loading = true
            try {
                const res = await api.post('/api/psychology/unified-cases', payload)
                await this.fetchSuggestions() // Refresh suggestions
                return res?.data || res
            } catch (error) {
                this.error = error
                console.error('Error unifying cases:', error)
                throw error
            } finally {
                this.loading = false
            }
        },

        async addEntry(id: number, entryData: any) {
            this.loading = true
            try {
                const res = await api.post(`/api/psychology/unified-cases/${id}/entries`, entryData)
                // Refresh logic if needed or append to timeline
                await this.fetchUnifiedCase(id)
                return res?.data || res
            } catch (error) {
                this.error = error
                throw error
            } finally {
                this.loading = false
            }
        },

        async closeCase(id: number) {
            this.loading = true
            try {
                await api.post(`/api/psychology/unified-cases/${id}/close`)
                await this.fetchUnifiedCase(id)
            } catch (error) {
                this.error = error
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateEntry(id: number, entryData: any) {
            this.loading = true
            try {
                // Use the generic case entries endpoint since entries are standard
                const res = await api.put(`/api/psychology/case-entries/${id}`, entryData)
                return res?.data || res
            } catch (error) {
                this.error = error
                throw error
            } finally {
                this.loading = false
            }
        }
    },
})
