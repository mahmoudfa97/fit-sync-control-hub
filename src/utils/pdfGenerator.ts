
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

// Generate invoice PDF - simplified to use payments table instead of non-existent invoices table
export const generateInvoicePdf = async (paymentId: string): Promise<void> => {
  try {
    const { data: payment, error } = await supabase
      .from("payments")
      .select(`
        *,
        custom_members!member_id (name, last_name, email, phone)
      `)
      .eq("id", paymentId)
      .single()

    if (error) throw error
    if (!payment) throw new Error("תשלום לא נמצא")

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
    doc.text("קבלה", doc.internal.pageSize.width / 2, 20, { align: "center" })

    // Add payment info
    doc.setFontSize(12)
    doc.text(`מספר קבלה: ${payment.receipt_number || payment.id}`, 190, 40, { align: "right" })
    doc.text(`שם לקוח: ${payment.custom_members?.name} ${payment.custom_members?.last_name || ""}`, 190, 50, {
      align: "right",
    })
    doc.text(`תאריך: ${format(new Date(payment.payment_date), "dd/MM/yyyy", { locale: he })}`, 190, 60, {
      align: "right",
    })
    doc.text(`אמצעי תשלום: ${payment.payment_method}`, 190, 70, {
      align: "right",
    })

    // Create payment details table
    const tableHeaders = [["סכום", "תיאור"]]
    const tableData = [[`₪${Number(payment.amount).toFixed(2)}`, payment.description || "תשלום"]]

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
    doc.text(`סה"כ: ₪${Number(payment.amount).toFixed(2)}`, 190, finalY + 20, { align: "right" })

    // Add footer
    doc.setFontSize(10)
    doc.text(
      "ספרטה ג'ים © " + new Date().getFullYear(),
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    )

    // Save the PDF
    doc.save(`קבלה-${payment.receipt_number || payment.id}.pdf`)
  } catch (error) {
    console.error("Error generating receipt PDF:", error)
    throw error
  }
}
