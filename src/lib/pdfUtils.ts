import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

/**
 * Generates and downloads a crisp PDF from an HTML element ID.
 */
export async function downloadElementAsPdf(elementId: string, filename: string = 'document.pdf') {
  const toastId = toast.loading('Generating PDF document...');
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      toast.error('Print element not found', { id: toastId });
      return;
    }

    // Capture element canvas
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for text crispness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200, // Ensure desktop resolution layout during render
      onclone: (clonedDoc, clonedElement) => {
        // 1. Replace oklch/oklab color functions in all stylesheet tags in cloned document
        const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
        for (const style of styleTags) {
          if (style.textContent && /okl(ch|ab)/i.test(style.textContent)) {
            style.textContent = style.textContent.replace(/okl(ch|ab)\([^)]*\)/gi, 'rgb(0, 0, 0)');
          }
        }

        // 2. Clean inline styles in cloned document
        const allCloned = Array.from(clonedDoc.querySelectorAll('*')) as HTMLElement[];
        for (const el of allCloned) {
          const styleAttr = el.getAttribute('style');
          if (styleAttr && /okl(ch|ab)/i.test(styleAttr)) {
            el.setAttribute('style', styleAttr.replace(/okl(ch|ab)\([^)]*\)/gi, 'rgb(0, 0, 0)'));
          }
        }

        // 3. Map live computed styles (resolved as rgb/rgba by browser) onto cloned elements
        const liveElements = Array.from(element.querySelectorAll('*')) as HTMLElement[];
        const clonedElements = Array.from(clonedElement.querySelectorAll('*')) as HTMLElement[];

        const rootComputed = window.getComputedStyle(element);
        if (rootComputed.color && !rootComputed.color.includes('okl')) clonedElement.style.color = rootComputed.color;
        if (rootComputed.backgroundColor && !rootComputed.backgroundColor.includes('okl')) clonedElement.style.backgroundColor = rootComputed.backgroundColor;
        if (rootComputed.borderColor && !rootComputed.borderColor.includes('okl')) clonedElement.style.borderColor = rootComputed.borderColor;

        liveElements.forEach((liveEl, index) => {
          const targetCloned = clonedElements[index];
          if (targetCloned) {
            const computed = window.getComputedStyle(liveEl);
            if (computed.color && !computed.color.includes('okl')) {
              targetCloned.style.color = computed.color;
            }
            if (computed.backgroundColor && !computed.backgroundColor.includes('okl')) {
              targetCloned.style.backgroundColor = computed.backgroundColor;
            }
            if (computed.borderColor && !computed.borderColor.includes('okl')) {
              targetCloned.style.borderColor = computed.borderColor;
            }
          }
        });
      }
    });

    const imgData = canvas.toDataURL('image/png');

    // Create PDF document (A4 format)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    const imgWidth = pdfWidth - 20; // 10mm margins on sides
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10; // Top margin

    // First Page
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= (pdfHeight - 20);

    // Multi-page handling if content exceeds 1 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= (pdfHeight - 20);
    }

    pdf.save(filename);
    toast.success('PDF downloaded successfully!', { id: toastId });
  } catch (error) {
    console.error('PDF export failed:', error);
    toast.error('Failed to generate PDF document', { id: toastId });
  }
}

/**
 * Triggers clean browser print dialog with fallback for iframe environments.
 */
export function triggerPrint(elementId?: string) {
  try {
    if (elementId) {
      const elem = document.getElementById(elementId);
      if (elem) {
        // Try standard print first
        window.print();
        return;
      }
    }
    window.print();
  } catch (err) {
    console.error('Print trigger failed:', err);
    toast.error('System print blocked by browser frame. Try downloading as PDF instead.');
  }
}
