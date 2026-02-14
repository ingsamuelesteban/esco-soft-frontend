import { ref, watch, onMounted } from 'vue'

export const useTheme = () => {
    const isDark = ref(false)

    const toggleTheme = () => {
        isDark.value = !isDark.value
        updateTheme()
    }

    const updateTheme = () => {
        if (isDark.value) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            isDark.value = true
        } else {
            isDark.value = false
        }
        updateTheme()
    }

    onMounted(() => {
        initTheme()
    })

    return {
        isDark,
        toggleTheme
    }
}
