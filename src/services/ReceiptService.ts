
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import { supabase } from "@/integrations/supabase/client"

interface ReceiptData {
  receiptNumber: string
  paymentId: string
  paymentDate: string
  memberName: string
  memberEmail?: string
  amount: number
  paymentMethod: string
  description: string
  hypDetails?: {
    transactionId?: string
    referenceId?: string
  }
}

export class ReceiptService {
  static async generateReceipt(paymentId: string): Promise<{ pdfBase64: string; filename: string }> {
    try {
      // Fetch payment data
      const { data: payment, error } = await supabase
        .from("payments")
        .select(`
          *,
          custom_members:member_id (name, last_name, email)
        `)
        .eq("id", paymentId)
        .single()

      if (error) throw error
      if (!payment) throw new Error("Payment not found")

      // Prepare receipt data
      const receiptData: ReceiptData = {
        receiptNumber: payment.receipt_number || `REC-${Date.now().toString().slice(-6)}`,
        paymentId: payment.id,
        paymentDate: format(new Date(payment.payment_date), "dd/MM/yyyy HH:mm"),
        memberName: payment.custom_members
          ? `${payment.custom_members.name} ${payment.custom_members.last_name || ""}`
          : "לקוח",
        memberEmail: payment.custom_members?.email,
        amount: payment.amount,
        paymentMethod: this.translatePaymentMethod(payment.payment_method),
        description: payment.description || "תשלום",
      }

      // Add HYP specific details if applicable
      if (payment.payment_method === "hyp" && payment.payment_details) {
        const paymentDetails = payment.payment_details as any
        receiptData.hypDetails = {
          transactionId: paymentDetails?.transactionId || paymentDetails?.transaction_id,
          referenceId: paymentDetails?.referenceId || paymentDetails?.reference_id,
        }
      }

      // Generate PDF
      const pdf = await this.generatePdf(receiptData)
      const filename = `receipt_${receiptData.receiptNumber.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`

      return {
        pdfBase64: pdf,
        filename,
      }
    } catch (error) {
      console.error("Error generating receipt:", error)
      throw error
    }
  }

  private static translatePaymentMethod(method: string): string {
    const methodMap: Record<string, string> = {
      cash: "מזומן",
      card: "כרטיס אשראי",
      bank: "העברה בנקאית",
      check: "המחאה",
      hyp: "HYP תשלום מקוון",
    }

    return methodMap[method] || method
  }

  private static async generatePdf(data: ReceiptData): Promise<string> {
    // Create new PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Add right-to-left support
    doc.setR2L(true)

    // Load font
    try {
      const fontResponse = await fetch("/api/fonts")
      const fontData = await fontResponse.arrayBuffer()
      doc.addFileToVFS("OpenSansHebrew-Regular.ttf", Buffer.from(fontData).toString("base64"))
      doc.addFont("OpenSansHebrew-Regular.ttf", "OpenSansHebrew", "normal")
      doc.setFont("OpenSansHebrew")
    } catch (error) {
      console.error("Error loading font:", error)
      // Continue with default font if loading fails
    }

    // Add logo and header
    doc.setFontSize(22)
    doc.setTextColor(0, 51, 102) // Navy blue
    doc.text("קבלה", 105, 20, { align: "center" })

    // Add receipt number and date section
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text(`מספר קבלה: ${data.receiptNumber}`, 190, 35, { align: "right" })
    doc.text(`תאריך: ${data.paymentDate}`, 190, 42, { align: "right" })

    // Add customer information
    doc.setFillColor(240, 240, 240)
    doc.rect(20, 50, 170, 25, "F")
    doc.setFontSize(14)
    doc.text("פרטי לקוח", 180, 57)
    doc.setFontSize(12)
    doc.text(`שם: ${data.memberName}`, 180, 65)
    if (data.memberEmail) {
      doc.text(`אימייל: ${data.memberEmail}`, 180, 72)
    }

    // Add payment information
    doc.setFillColor(240, 240, 240)
    doc.rect(20, 85, 170, 35, "F")
    doc.setFontSize(14)
    doc.text("פרטי תשלום", 180, 92)
    doc.setFontSize(12)
    doc.text(`סכום: ${data.amount.toLocaleString()} ₪`, 180, 100)
    doc.text(`אמצעי תשלום: ${data.paymentMethod}`, 180, 107)
    doc.text(`תיאור: ${data.description}`, 180, 114)

    // Add HYP specific details if available
    if (data.hypDetails) {
      doc.setFillColor(220, 242, 255) // Light blue for HYP
      doc.rect(20, 130, 170, 30, "F")
      doc.setFontSize(14)
      doc.setTextColor(0, 100, 150) // Blue for HYP
      doc.text("HYP פרטי עסקה", 180, 137)
      doc.setFontSize(12)

      if (data.hypDetails.transactionId) {
        doc.text(`מזהה עסקה: ${data.hypDetails.transactionId}`, 180, 145)
      }

      if (data.hypDetails.referenceId) {
        doc.text(`מזהה אסמכתא: ${data.hypDetails.referenceId}`, 180, 152)
      }

      doc.text("העסקה בוצעה באמצעות מערכת תשלומים מאובטחת HYP", 180, 159)
    }

    // Add footer
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text("תודה על השימוש במערכת ניהול המועדון", 105, 280, { align: "center" })

    // Convert to base64
    return doc.output("datauristring").split(",")[1]
  }
}

export default ReceiptService
