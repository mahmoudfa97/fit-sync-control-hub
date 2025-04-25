import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"
import { he } from "date-fns/locale"

// Add Hebrew font support
// This is a base64-encoded OpenSans Hebrew font

// Helper function to set up right-to-left text in PDF with proper Hebrew font
const setupRtlPdf = (doc: jsPDF) => {
  // Add Hebrew font
doc.setFont("OpenSansHebrew")

  return doc
}

// Add logo and header to PDF
const addHeader = (doc: jsPDF, title: string) => {
  // Add title
  doc.setFontSize(18)
  doc.text(title, doc.internal.pageSize.width / 2, 20, { align: "center" })

  // Add date
  doc.setFontSize(10)
  const date = format(new Date(), "dd/MM/yyyy", { locale: he })
  doc.text(`תאריך הדוח: ${date}`, 190, 30, { align: "right" })

  return doc
}

// Add footer to PDF
const addFooter = (doc: jsPDF) => {
  doc.setFontSize(10)
  doc.text(
    "SpartaGym © Feras Shehibar" + new Date().getFullYear(),
    doc.internal.pageSize.width / 2,
    doc.internal.pageSize.height - 10,
    { align: "center" },
  )
  doc.setR2L(true)
  doc.setLanguage("he")
  return doc
}

// Generate PDF with table data
export const generateTableReport = async (
  fetchDataFn: () => Promise<any[]>,
  columns: { key: string; header: string }[],
  reportTitle: string,
  options: { landscape?: boolean } = {},
): Promise<void> => {
  try {
    const data = await fetchDataFn()
    const date = new Date().toLocaleDateString('he-IL');
    // Create PDF with proper encoding
    const doc = new jsPDF({
      orientation: options.landscape ? "landscape" : "portrait",
      putOnlyUsedFonts: true,
      compress: true,
    })

    // Load the Hebrew font
    setupRtlPdf(doc)


    doc.setLanguage("he")

    addHeader(doc, reportTitle)

    if (!data || data.length === 0) {
      doc.setFontSize(12)
      doc.text("לא נמצאו נתונים להצגה", doc.internal.pageSize.width / 2, 50, { align: "center" })
      addFooter(doc)
      doc.save(`${reportTitle}-${date}.pdf`)
      return
    }

    // Prepare table data
    const headers = [columns.map((col) => col.header)]
    const tableData = data.map((item) =>
      columns.map((col) => {
        const value = item[col.key]
        if (value instanceof Date) {
          return format(value, "dd/MM/yyyy", { locale: he })
        }
        return value !== undefined && value !== null ? String(value) : ""
      }),
    )

    // Add table with proper font settings
    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 40,
      theme: "grid",
      styles: {
        font: "OpenSansHebrew",
        halign: "right",
        fontSize: 10,
      },
      headStyles: {
        fillColor: [66, 66, 66],
        halign: "right",
        font: "OpenSansHebrew",
      },
      columnStyles: {},
      didDrawCell: (data) => {
        // Ensure Hebrew text is rendered correctly in cells
        data.cell.styles.font = "OpenSansHebrew"
      },
    })

    // Add footer
    doc.setFontSize(10)
    doc.text(
      "ספרטה ג'ים © " + new Date().getFullYear(),
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    )

    // Save the PDF
    doc.save(`${reportTitle}-${date}.pdf`)
  } catch (error) {
    console.error("Error generating report:", error)
    throw error
  }
}

// Generate invoice PDF
export const generateInvoicePdf = async (invoiceId: string): Promise<void> => {
  try {
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(`
        *,
        custom_members!member_id (name, last_name, email, phone),
        invoice_items (*)
      `)
      .eq("id", invoiceId)
      .single()

    if (error) throw error
    if (!invoice) throw new Error("חשבונית לא נמצאה")

    // Create PDF with proper encoding
    const doc = new jsPDF({
      putOnlyUsedFonts: true,
      compress: true,
    })

     // Load the Hebrew font
     setupRtlPdf(doc)


    doc.setLanguage("he")

    // Add title
    doc.setFontSize(18)
    doc.text("חשבונית מס", doc.internal.pageSize.width / 2, 20, { align: "center" })

    // Add invoice info
    doc.setFontSize(12)
    doc.text(`מספר חשבונית: ${invoice.invoice_number || invoice.id}`, 190, 40, { align: "right" })
    doc.text(`שם לקוח: ${invoice.custom_members.name} ${invoice.custom_members.last_name || ""}`, 190, 50, {
      align: "right",
    })
    doc.text(`תאריך: ${format(new Date(invoice.created_at), "dd/MM/yyyy", { locale: he })}`, 190, 60, {
      align: "right",
    })
    doc.text(`תאריך לתשלום: ${format(new Date(invoice.due_date), "dd/MM/yyyy", { locale: he })}`, 190, 70, {
      align: "right",
    })

    // Create invoice items table
    const tableHeaders = [["מחיר יחידה", "כמות", "תיאור", "מס'"]]

    const tableData = invoice.invoice_items.map((item: any, index: number) => [
      `₪${Number(item.unit_price).toFixed(2)}`,
      item.quantity.toString(),
      item.description,
      (index + 1).toString(),
    ])

    // Calculate total
    const total = invoice.invoice_items.reduce(
      (sum: number, item: any) => sum + item.quantity * Number(item.unit_price),
      0,
    )

    // Add table with proper font settings
    autoTable(doc, {
      head: tableHeaders,
      body: tableData,
      startY: 80,
      theme: "grid",
      styles: {
        font: "OpenSansHebrew",
        halign: "right",
        fontSize: 10,
      },
      headStyles: {
        fillColor: [66, 66, 66],
        halign: "right",
        font: "OpenSansHebrew",
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "center" },
      },
      didDrawCell: (data) => {
        // Ensure Hebrew text is rendered correctly in cells
        data.cell.styles.font = "OpenSansHebrew"
      },
    })

    // Add total
    const finalY = (doc as any).lastAutoTable.finalY || 120
    doc.text(`סה"כ: ₪${total.toFixed(2)}`, 190, finalY + 20, { align: "right" })

    // Add notes if they exist
    if (invoice.notes) {
      doc.text(`הערות: ${invoice.notes}`, 190, finalY + 30, { align: "right" })
    }

    // Add footer
    doc.setFontSize(10)
    doc.text(
      "ספרטה ג'ים © " + new Date().getFullYear(),
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    )

    // Save the PDF
    doc.save(`חשבונית-${invoice.invoice_number || invoice.id}.pdf`)
  } catch (error) {
    console.error("Error generating invoice PDF:", error)
    throw error
  }
}
