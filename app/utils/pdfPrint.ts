export const handlePrintPdfResponse = (blob: Blob, fallbackFilename: string = 'document.pdf') => {
    // Si la pantalla es pequeña (móvil/tablet), descargamos el PDF
    if (window.innerWidth < 1024) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('action');
      const link = document.createElement('a');
      link.href = url;
      link.download = fallbackFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return;
    }
  
    // Si la pantalla es grande (desktop), abrimos diálogo de impresión vía iframe oculto
    const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
    
    // Eliminar iframe previo si existe
    const oldIframe = document.getElementById('pdf-print-iframe');
    if (oldIframe) {
      document.body.removeChild(oldIframe);
    }
    
    const iframe = document.createElement('iframe');
    iframe.id = 'pdf-print-iframe';
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        // Opcional: revocar la URL después de un tiempo
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000 * 60);
      }, 500); // Pequeño delay para asegurar que el PDF se haya renderizado en el iframe
    };
    
    document.body.appendChild(iframe);
  };
