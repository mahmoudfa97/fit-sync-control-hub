
import { supabase } from "@/integrations/supabase/client"
import { generateTableReport } from "@/utils/pdfGenerator"
import { format, startOfMonth, endOfMonth } from "date-fns"

// Helper function to format date for queries
const formatDate = (date: Date): string => {
  return date.toISOString()
}

// Enhanced payments report with more detailed information
export const generateEnhancedPaymentsReport = async (
  startDate?: Date,
  endDate?: Date,
  paymentMethod?: string,
): Promise<void> => {
  const fetchData = async () => {
    // Set default date range to current month if not provided
    const effectiveStartDate = startDate || startOfMonth(new Date())
    const effectiveEndDate = endDate || endOfMonth(new Date())

    // Build query - only select existing columns
    let query = supabase
      .from("payments")
      .select(`
        id, 
        payment_date,
        amount,
        payment_method,
        receipt_number,
        description,
        custom_members!member_id (id, name, last_name, email, phone)
      `)
      .gte("payment_date", formatDate(effectiveStartDate))
      .lte("payment_date", formatDate(effectiveEndDate))
      .order("payment_date", { ascending: false })

    // Add payment method filter if provided
    if (paymentMethod && paymentMethod !== "all") {
      query = query.eq("payment_method", paymentMethod)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      member_id: item.custom_members?.id || '',
      name: item.custom_members?.name || '',
      last_name: item.custom_members?.last_name || '',
      email: item.custom_members?.email || '',
      phone: item.custom_members?.phone || '',
      payment_date: item.payment_date,
      amount: item.amount,
      payment_method: item.payment_method,
      receipt_number: item.receipt_number || "",
      description: item.description || "",
    }))
  }

  // Get payment method summary data
  const fetchSummaryData = async () => {
    // Set default date range to current month if not provided
    const effectiveStartDate = startDate || startOfMonth(new Date())
    const effectiveEndDate = endDate || endOfMonth(new Date())

    const { data, error } = await supabase
      .from("payments")
      .select(`
        payment_method,
        amount
      `)
      .gte("payment_date", formatDate(effectiveStartDate))
      .lte("payment_date", formatDate(effectiveEndDate))

    if (error) throw error

    // Calculate totals by payment method
    const summary = {
      total: 0,
      creditCard: 0,
      cash: 0,
      check: 0,
      bankTransfer: 0,
    }

    data?.forEach((payment) => {
      summary.total += payment.amount

      switch (payment.payment_method.toLowerCase()) {
        case "כרטיס אשראי":
          summary.creditCard += payment.amount
          break
        case "מזומן":
          summary.cash += payment.amount
          break
        case "צ'ק":
          summary.check += payment.amount
          break
        case "העברה בנקאית":
          summary.bankTransfer += payment.amount
          break
      }
    })

    // Add summary to report header
    const dateRangeText = `${format(effectiveStartDate, "dd/MM/yyyy")} - ${format(effectiveEndDate, "dd/MM/yyyy")}`
    const summaryText = `סה"כ: ₪${summary.total} | כרטיס אשראי: ₪${summary.creditCard} | מזומן: ₪${summary.cash} | צ'קים: ₪${summary.check} | העברה בנקאית: ₪${summary.bankTransfer}`

    return { dateRangeText, summaryText }
  }

  const columns = [
    { key: "id", header: "מזהה" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "phone", header: "טלפון" },
    { key: "payment_date", header: "תאריך תשלום" },
    { key: "amount", header: "סכום" },
    { key: "payment_method", header: "אמצעי תשלום" },
    { key: "receipt_number", header: "מספר קבלה" },
    { key: "description", header: "תיאור" },
  ]

  // Get summary data for the report header
  const summary = await fetchSummaryData()

  // Generate the report with basic options only
  await generateTableReport(fetchData, columns, "דוח תקבולים מפורט", {
    landscape: true,
  })
}

// Monthly payments summary report
export const generateMonthlyPaymentsSummaryReport = async (year: number): Promise<void> => {
  const fetchData = async () => {
    // Create an array of all months
    const months = Array.from({ length: 12 }, (_, i) => i)

    const result = []

    for (const month of months) {
      const startDate = new Date(year, month, 1)
      const endDate = endOfMonth(startDate)

      // Get payments for this month
      const { data, error } = await supabase
        .from("payments")
        .select(`
          payment_method,
          amount
        `)
        .gte("payment_date", formatDate(startDate))
        .lte("payment_date", formatDate(endDate))

      if (error) throw error

      // Calculate totals by payment method
      const summary = {
        month: format(startDate, "MMMM"),
        total: 0,
        creditCard: 0,
        cash: 0,
        check: 0,
        bankTransfer: 0,
      }

      data?.forEach((payment) => {
        summary.total += payment.amount

        switch (payment.payment_method.toLowerCase()) {
          case "כרטיס אשראי":
            summary.creditCard += payment.amount
            break
          case "מזומן":
            summary.cash += payment.amount
            break
          case "צ'ק":
            summary.check += payment.amount
            break
          case "העברה בנקאית":
            summary.bankTransfer += payment.amount
            break
        }
      })

      result.push(summary)
    }

    return result
  }

  const columns = [
    { key: "month", header: "חודש" },
    { key: "total", header: 'סה"כ' },
    { key: "creditCard", header: "כרטיס אשראי" },
    { key: "cash", header: "מזומן" },
    { key: "check", header: "צ'קים" },
    { key: "bankTransfer", header: "העברה בנקאית" },
  ]

  await generateTableReport(fetchData, columns, `דוח תקבולים חודשי - ${year}`, {
    landscape: true,
  })
}
