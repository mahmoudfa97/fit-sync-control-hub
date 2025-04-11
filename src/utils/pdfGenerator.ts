
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, InvoiceItem } from '@/store/slices/invoicesSlice';

// Helper function to set up right-to-left text in PDF
const setupRtlPdf = (doc: jsPDF) => {
  doc.setR2L(true);
  doc.setLanguage('he');
  return doc;
};

// Generate invoice PDF
export const generateInvoicePdf = (invoice: Invoice, reportTitle: string) => {
  const doc = new jsPDF();
  setupRtlPdf(doc);
  
  // Add title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(reportTitle, doc.internal.pageSize.width / 2, 20, { align: "center" });
  
  // Add invoice info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`מספר חשבונית: ${invoice.id}`, 190, 40, { align: "right" });
  doc.text(`שם לקוח: ${invoice.memberName}`, 190, 50, { align: "right" });
  doc.text(`תאריך: ${invoice.date}`, 190, 60, { align: "right" });
  doc.text(`תאריך לתשלום: ${invoice.dueDate}`, 190, 70, { align: "right" });
  
  // Create invoice items table
  const tableHeaders = [["מחיר יחידה", "כמות", "תיאור", "מס'"]];
  
  const tableData = invoice.items.map((item, index) => [
    `₪${item.unitPrice.toFixed(2)}`,
    item.quantity.toString(),
    item.description,
    (index + 1).toString(),
  ]);
  
  // Calculate total
  const total = invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  
  // Add table
  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: 80,
    theme: 'grid',
    styles: { 
      font: 'helvetica',
      halign: 'right',
      fontSize: 10
    },
    headStyles: { 
      fillColor: [66, 66, 66],
      halign: 'right'
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'center' },
    },
  });
  
  // Add total
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  doc.text(`סה"כ: ₪${total.toFixed(2)}`, 190, finalY + 20, { align: "right" });
  
  // Add notes if they exist
  if (invoice.notes) {
    doc.text(`הערות: ${invoice.notes}`, 190, finalY + 30, { align: "right" });
  }
  
  // Add footer
  doc.setFontSize(10);
  doc.text("ספרטה ג'ים © " + new Date().getFullYear(), doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
  
  // Save the PDF
  doc.save(`invoice-${invoice.id}.pdf`);
};

// Generate general report PDF
export const generateReportPdf = (data: any[], columns: string[], reportTitle: string) => {
  const doc = new jsPDF();
  setupRtlPdf(doc);
  
  // Add title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(reportTitle, doc.internal.pageSize.width / 2, 20, { align: "center" });
  
  // Date of the report
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const date = new Date().toLocaleDateString('he-IL');
  doc.text(`תאריך הדוח: ${date}`, 190, 30, { align: "right" });
  
  // Prepare table data
  const headers = [columns];
  const tableData = data.map(item => columns.map(col => item[col] || ''));
  
  // Add table
  autoTable(doc, {
    head: headers,
    body: tableData,
    startY: 40,
    theme: 'grid',
    styles: { 
      font: 'helvetica',
      halign: 'right',
      fontSize: 10
    },
    headStyles: { 
      fillColor: [66, 66, 66],
      halign: 'right'
    }
  });
  
  // Add footer
  doc.setFontSize(10);
  doc.text("ספרטה ג'ים © " + new Date().getFullYear(), doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });
  
  // Save the PDF
  doc.save(`report-${reportTitle}-${date}.pdf`);
};
