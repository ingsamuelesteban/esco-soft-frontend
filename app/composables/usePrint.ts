import printJS from 'print-js'
import Swal from 'sweetalert2'
import { api } from '~/utils/api'

/**
 * Detect if the current device is a mobile device
 */
function isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Download a blob as a file
 */
function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

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

            const isMobile = isMobileDevice()

            if (isPdf && isMobile) {
                // On mobile, download directly to avoid Print.js multi-page issues
                const filename = path.split('/').pop() || 'documento.pdf'
                downloadBlob(blob, filename)
                
                Swal.fire({
                    icon: 'success',
                    title: 'PDF Descargado',
                    text: 'El archivo se ha descargado. Revisa tu carpeta de descargas.',
                    timer: 3000,
                    showConfirmButton: false
                })
            } else if (isImage) {
                printJS({
                    printable: fileURL,
                    type: 'image',
                    imageStyle: 'max-width:100%;',
                    showModal: true,
                    modalMessage: 'Preparando imagen para impresión...',
                    onPrintDialogClose: () => URL.revokeObjectURL(fileURL)
                })
            } else {
                // Default to PDF/Generic on desktop
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

    /**
     * Print a PDF blob (for reports)
     * On mobile: downloads the file
     * On desktop: shows print dialog
     */
    const printPdfBlob = (blob: Blob, filename: string = 'reporte.pdf', modalMessage: string = 'Preparando documento...') => {
        const isMobile = isMobileDevice()
        
        if (isMobile) {
            // Download directly on mobile
            downloadBlob(blob, filename)
            
            Swal.fire({
                icon: 'success',
                title: 'PDF Generado',
                text: 'El reporte se ha descargado. Revisa tu carpeta de descargas.',
                timer: 3000,
                showConfirmButton: false
            })
        } else {
            // Use Print.js on desktop
            const blobUrl = URL.createObjectURL(blob)
            printJS({
                printable: blobUrl,
                type: 'pdf',
                showModal: true,
                modalMessage: modalMessage,
                onPrintDialogClose: () => URL.revokeObjectURL(blobUrl)
            })
        }
    }

    return {
        printFile,
        printPdfBlob,
        loading,
        isMobileDevice
    }
}
