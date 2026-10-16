/**
 * Utilidades de impresión en el cliente (Frontend).
 * En escritorio: lanza la ventana de impresión nativa (window.print() / iframe).
 * En pantallas pequeñas o móviles: fuerza la vista/descarga adecuada para evitar recortes.
 */

export const isSmallOrMobileScreen = (): boolean => {
  if (typeof window === 'undefined') return false
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent || ''
  )
  return window.innerWidth < 1024 || isMobileUA
}

export const handlePrintPdfResponse = (blob: Blob, fallbackFilename: string = 'document.pdf') => {
  if (typeof window === 'undefined') return

  // Si la pantalla es pequeña (móvil/tablet), descargamos el PDF
  if (isSmallOrMobileScreen()) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fallbackFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    return
  }

  // Si la pantalla es grande (desktop), abrimos diálogo de impresión vía iframe oculto
  const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))

  const oldIframe = document.getElementById('pdf-print-iframe')
  if (oldIframe) {
    document.body.removeChild(oldIframe)
  }

  const iframe = document.createElement('iframe')
  iframe.id = 'pdf-print-iframe'
  iframe.style.display = 'none'
  iframe.src = blobUrl

  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000 * 60)
    }, 500)
  }

  document.body.appendChild(iframe)
}

export interface ClientPrintOptions {
  title?: string
  filename?: string
}

/**
 * Imprime un comprobante renderizado 100% en el cliente (Frontend).
 * - En escritorio (>= 1024px): ejecuta window.print() aprovechando las reglas @media print.
 * - En móvil / pantallas pequeñas (< 1024px): genera una vista/descarga independiente limpia
 *   para que el navegador móvil permita guardar como PDF o compartir sin distorsionar el layout.
 */
export const printClientReceipt = (
  elementId: string = 'material-print-area',
  options: ClientPrintOptions = {}
) => {
  if (typeof window === 'undefined') return

  const title = options.title || 'Comprobante_Entrega_Materiales'
  const filename = options.filename || `${title.replace(/\s+/g, '_')}.html`
  const printEl = document.getElementById(elementId)

  if (!isSmallOrMobileScreen()) {
    const prevTitle = document.title
    document.title = title
    setTimeout(() => {
      window.print()
      setTimeout(() => {
        document.title = prevTitle
      }, 500)
    }, 150)
    return
  }

  // En pantallas pequeñas/móviles: construir documento autónomo para vista/descarga limpia
  if (!printEl) {
    window.print()
    return
  }

  const standaloneHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 16px;
    }
    .mobile-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #1e293b;
      color: #fff;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .mobile-toolbar button {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
    }
    .receipt-sheet {
      background: #ffffff;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      max-width: 210mm;
      margin: 0 auto;
    }
    @media print {
      body {
        background: #ffffff !important;
        padding: 0 !important;
      }
      .mobile-toolbar {
        display: none !important;
      }
      .receipt-sheet {
        box-shadow: none !important;
        padding: 0 !important;
        max-width: 100% !important;
      }
    }
  </style>
</head>
<body>
  <div class="mobile-toolbar">
    <span style="font-size: 14px; font-weight: 600;">${title}</span>
    <button onclick="window.print()">Imprimir / Guardar PDF</button>
  </div>
  <div class="receipt-sheet">
    ${printEl.innerHTML}
  </div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 600);
    });
  </script>
</body>
</html>`

  const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const newWin = window.open(url, '_blank')

  // Si el navegador bloquea popups en móvil, forzar descarga directa del comprobante
  if (!newWin) {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60)
}

export default {
  handlePrintPdfResponse,
  printClientReceipt,
  isSmallOrMobileScreen,
}
