import printJS from 'print-js'
import Swal from 'sweetalert2'
import { api } from '~/utils/api'

export function usePrint() {
    const loading = ref(false)

    const printFile = async (path: string | null) => {
        if (!path) return

        loading.value = true
        try {
            // Determine file type from extension
            const extension = path.split('.').pop()?.toLowerCase()
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')
            const isPdf = extension === 'pdf'

            // Fetch blob with auth headers
            const res = await api.getBlob(`/storage/${path}`)
            
            // Create object URL
            const blob = new Blob([res], { 
                type: isImage ? `image/${extension === 'jpg' ? 'jpeg' : extension}` : 'application/pdf' 
            })
            const fileURL = URL.createObjectURL(blob)

            if (isImage) {
                printJS({
                    printable: fileURL,
                    type: 'image',
                    imageStyle: 'max-width:100%;',
                    showModal: true,
                    modalMessage: 'Preparando imagen para impresión...',
                    onPrintDialogClose: () => URL.revokeObjectURL(fileURL)
                })
            } else {
                // Default to PDF/Generic
                printJS({
                    printable: fileURL,
                    type: 'pdf',
                    showModal: true,
                    modalMessage: 'Preparando documento para impresión...',
                    onPrintDialogClose: () => URL.revokeObjectURL(fileURL)
                })
            }

        } catch (e) {
            console.error('Error printing file:', e)
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar el archivo para impresión.'
            })
        } finally {
            loading.value = false
        }
    }

    return {
        printFile,
        loading
    }
}
