import { supabase } from "@/integrations/supabase/client"
import { generateTableReport } from "@/utils/pdfGenerator"
import { format, subDays, subMonths } from "date-fns"

// Helper function to format date for queries
const formatDate = (date: Date): string => {
  return date.toISOString()
}

// Helper function to download a file
const downloadFile = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Helper function to convert data to CSV
const convertToCSV = (data: any[], columns: { key: string; header: string }[]) => {
  const BOM = "\uFEFF" // UTF-8 BOM

  // Create header row
  const header = columns.map((col) => col.header).join(",")

  // Create data rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let value = item[col.key]
        if (value == null) value = ""
        // Escape values with commas or double quotes
        if (typeof value === "string") {
          value = value.replace(/"/g, '""') // Escape double quotes
          if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            value = `"${value}"`
          }
        }
        return value
      })
      .join(",")
  })

  return BOM + [header, ...rows].join("\n")
}

// Enhanced payments report with more detailed information
export const generateEnhancedPaymentsReport = async (
  startDate?: Date,
  endDate?: Date,
  paymentMethod?: string,
): Promise<void> => {
  try {
    // Set default date range to current month if not provided
    const effectiveStartDate = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const effectiveEndDate = endDate || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

    // Build query
    let query = supabase
      .from("payments")
      .select(`
        id, 
        payment_date,
        amount,
        payment_method,
        receipt_number,
        notes,
        custom_members!member_id (id, name, last_name, email, phone)
      `)
      .gte("payment_date", format(effectiveStartDate, "yyyy-MM-dd"))
      .lte("payment_date", format(effectiveEndDate, "yyyy-MM-dd"))
      .order("payment_date", { ascending: false })

    // Add payment method filter if provided
    if (paymentMethod && paymentMethod !== "all") {
      query = query.eq("payment_method", paymentMethod)
    }

    const { data, error } = await query

    if (error) throw error

    // Transform data for CSV
    const reportData = (data || []).map((item) => ({
      id: item.id,
      member_id: item.custom_members.id,
      name: item.custom_members.name,
      last_name: item.custom_members.last_name,
      email: item.custom_members.email,
      phone: item.custom_members.phone,
      payment_date: format(new Date(item.payment_date), "yyyy-MM-dd"),
      amount: item.amount,
      payment_method: item.payment_method,
      receipt_number: item.receipt_number || "",
      notes: item.notes || "",
    }))

    // Define columns for the report
    const columns = [
      { key: "id", header: "מזהה" },
      { key: "name", header: "שם" },
      { key: "last_name", header: "שם משפחה" },
      { key: "phone", header: "טלפון" },
      { key: "payment_date", header: "תאריך תשלום" },
      { key: "amount", header: "סכום" },
      { key: "payment_method", header: "אמצעי תשלום" },
      { key: "receipt_number", header: "מספר קבלה" },
      { key: "notes", header: "הערות" },
    ]

    // Convert to CSV
    const csv = convertToCSV(reportData, columns)

    // Generate filename
    const fileName = `דוח_תקבולים_${format(effectiveStartDate, "yyyy-MM-dd")}_${format(effectiveEndDate, "yyyy-MM-dd")}.csv`

    // Download the file
    downloadFile(csv, fileName, "text/csv;charset=utf-8;")
  } catch (error) {
    console.error("Error generating payments report:", error)
    throw error
  }
}

// Financial documents report
export const generateFinancialDocumentsReport = async (
  startDate: string,
  endDate: string,
  documentType: string,
  status: string,
): Promise<void> => {
  try {
    // Build query
    let query = supabase
      .from("payments")
      .select(`
        id, 
        payment_date,
        amount,
        payment_method,
        status,
        receipt_number,
        custom_members!member_id (name, last_name, email, phone)
      `)
      .gte("payment_date", startDate)
      .lte("payment_date", endDate)
      .order("payment_date", { ascending: false })

    // Apply filters
    if (documentType !== "all") {
      query = query.eq("payment_method", documentType)
    }

    if (status !== "all") {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) throw error

    // Transform data for CSV
    const reportData = (data || []).map((doc) => ({
      document_number: doc.receipt_number || `INV-${Math.floor(Math.random() * 10000)}`,
      document_type: doc.payment_method === "כרטיס אשראי" ? "חשבונית מס" : "קבלה",
      issue_date: format(new Date(doc.payment_date), "yyyy-MM-dd"),
      due_date: format(new Date(doc.payment_date), "yyyy-MM-dd"), // In a real app, due date would be different
      member_name: `${doc.custom_members?.name || ""} ${doc.custom_members?.last_name || ""}`,
      amount: doc.amount,
      status: doc.status || "שולם",
    }))

    // Define columns for the report
    const columns = [
      { key: "document_number", header: "מספר מסמך" },
      { key: "document_type", header: "סוג מסמך" },
      { key: "issue_date", header: "תאריך הנפקה" },
      { key: "due_date", header: "תאריך תשלום" },
      { key: "member_name", header: "שם לקוח" },
      { key: "amount", header: "סכום" },
      { key: "status", header: "סטטוס" },
    ]

    // Convert to CSV
    const csv = convertToCSV(reportData, columns)

    // Generate filename
    const fileName = `דוח_מסמכים_פיננסיים_${startDate}_${endDate}.csv`

    // Download the file
    downloadFile(csv, fileName, "text/csv;charset=utf-8;")
  } catch (error) {
    console.error("Error generating financial documents report:", error)
    throw error
  }
}

// Debts report
export const generateDebtsReport = async (filters: any): Promise<void> => {
  try {
    // Get all members with their memberships and payments
    const { data: membersData, error: membersError } = await supabase.from("custom_members").select(`
      id, 
      name,
      last_name,
      email,
      phone,
      custom_memberships (
        id,
        membership_type,
        start_date,
        end_date,
        status
      ),
      payments (
        amount,
        payment_date
      )
    `)

    if (membersError) throw membersError

    // Calculate debt for each member
    const debtData = (membersData || []).map((member) => {
      // Get the latest membership
      const memberships = member.custom_memberships || []
      const latestMembership =
        memberships.length > 0
          ? memberships.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())[0]
          : null

      // Calculate total payments
      const payments = member.payments || []
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)

      // Get membership cost (in a real app, this would be more accurate)
      const membershipCost = latestMembership?.membership_type === "premium" ? 200 : 100

      // Calculate debt
      const totalDebt = latestMembership ? membershipCost - totalPaid : 0

      // Calculate days overdue
      const lastPaymentDate =
        payments.length > 0
          ? new Date(
              payments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0]
                .payment_date,
            )
          : new Date(2023, 0, 1)

      const daysOverdue = Math.floor((new Date().getTime() - lastPaymentDate.getTime()) / (1000 * 3600 * 24))

      return {
        id: member.id,
        name: member.name,
        last_name: member.last_name || "",
        email: member.email || "",
        phone: member.phone || "",
        total_debt: totalDebt > 0 ? totalDebt : 0,
        last_payment_date: format(lastPaymentDate, "yyyy-MM-dd"),
        days_overdue: daysOverdue,
        subscription_type: latestMembership?.membership_type || "standard",
        status: latestMembership?.status || "inactive",
      }
    })

    // Apply filters
    let filteredData = debtData

    // Filter by debt status
    if (filters.debtStatus === "with-debt") {
      filteredData = filteredData.filter((debt) => debt.total_debt > 0)
    } else if (filters.debtStatus === "no-debt") {
      filteredData = filteredData.filter((debt) => debt.total_debt === 0)
    }

    // Filter by subscription type
    if (filters.subscriptionType !== "all") {
      filteredData = filteredData.filter((debt) => debt.subscription_type === filters.subscriptionType)
    }

    // Filter by amount
    if (filters.minAmount) {
      filteredData = filteredData.filter((debt) => debt.total_debt >= Number(filters.minAmount))
    }
    if (filters.maxAmount) {
      filteredData = filteredData.filter((debt) => debt.total_debt <= Number(filters.maxAmount))
    }

    // Sort data
    filteredData.sort((a, b) => {
      if (filters.sortBy === "amount") {
        return filters.sortOrder === "asc" ? a.total_debt - b.total_debt : b.total_debt - a.total_debt
      } else if (filters.sortBy === "days") {
        return filters.sortOrder === "asc" ? a.days_overdue - b.days_overdue : b.days_overdue - a.days_overdue
      } else {
        // Sort by name
        const nameA = `${a.name} ${a.last_name}`
        const nameB = `${b.name} ${b.last_name}`
        return filters.sortOrder === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      }
    })

    // Define columns for the report
    const columns = [
      { key: "name", header: "שם" },
      { key: "last_name", header: "שם משפחה" },
      { key: "phone", header: "טלפון" },
      { key: "email", header: "אימייל" },
      { key: "subscription_type", header: "סוג מנוי" },
      { key: "last_payment_date", header: "תשלום אחרון" },
      { key: "days_overdue", header: "ימי פיגור" },
      { key: "total_debt", header: "סכום חוב" },
      { key: "status", header: "סטטוס" },
    ]

    // Convert to CSV
    const csv = convertToCSV(filteredData, columns)

    // Generate filename
    const fileName = `דוח_חובות_${format(new Date(), "yyyy-MM-dd")}.csv`

    // Download the file
    downloadFile(csv, fileName, "text/csv;charset=utf-8;")
  } catch (error) {
    console.error("Error generating debts report:", error)
    throw error
  }
}

// Monthly payments summary report
export const generateMonthlyPaymentsSummaryReport = async (year: number): Promise<void> => {
  try {
    // Create an array of all months
    const months = Array.from({ length: 12 }, (_, i) => i)
    const monthNames = [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ]

    const result = []

    for (const month of months) {
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0) // Last day of month

      // Get payments for this month
      const { data, error } = await supabase
        .from("payments")
        .select(`
          payment_method,
          amount
        `)
        .gte("payment_date", format(startDate, "yyyy-MM-dd"))
        .lte("payment_date", format(endDate, "yyyy-MM-dd"))

      if (error) throw error

      // Calculate totals by payment method
      const summary = {
        month: monthNames[month],
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

    // Define columns for the report
    const columns = [
      { key: "month", header: "חודש" },
      { key: "total", header: 'סה"כ' },
      { key: "creditCard", header: "כרטיס אשראי" },
      { key: "cash", header: "מזומן" },
      { key: "check", header: "צ'קים" },
      { key: "bankTransfer", header: "העברה בנקאית" },
    ]

    // Convert to CSV
    const csv = convertToCSV(result, columns)

    // Generate filename
    const fileName = `דוח_תקבולים_חודשי_${year}.csv`

    // Download the file
    downloadFile(csv, fileName, "text/csv;charset=utf-8;")
  } catch (error) {
    console.error("Error generating monthly payments report:", error)
    throw error
  }
}

// ==================== MEMBERSHIP REPORTS ====================

// Main members report
export const generateMembersMainReport = async (): Promise<void> => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("custom_members")
      .select(`
    id, 
    name, 
    last_name, 
    email, 
    phone, 
    created_at,
    custom_memberships (
      membership_type,
      start_date,
      end_date,
      status
    )
  `)
      .order("name", { ascending: true })

    if (error) throw error

    return (data || []).map((member) => ({
      id: member.id,
      name: member.name,
      last_name: member.last_name || "",
      email: member.email || "",
      phone: member.phone || "",
      join_date: member.created_at,
      membership_type: member.custom_memberships[0]?.membership_type || "אין מנוי",
      status: member.custom_memberships[0]?.status || "לא פעיל",
    }))
  }

  const columns = [
    { key: "id", header: "מזהה" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "email", header: "אימייל" },
    { key: "phone", header: "טלפון" },
    { key: "join_date", header: "תאריך הצטרפות" },
    { key: "membership_type", header: "סוג מנוי" },
    { key: "status", header: "סטטוס" },
  ]

  await generateTableReport(fetchData, columns, "דוח ראשי מנויים", { landscape: true })
}

// Membership expiry report
export const generateMembershipExpiryReport = async (): Promise<void> => {
  const fetchData = async () => {
    const thirtyDaysFromNow = formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
    const today = formatDate(new Date())

    const { data, error } = await supabase
      .from("custom_memberships")
      .select(`
        id, 
        end_date, 
        membership_type,
        custom_members!member_id (id, name, last_name, email, phone)
      `)
      .lte("end_date", thirtyDaysFromNow)
      .gte("end_date", today)
      .order("end_date", { ascending: true })

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      member_id: item.custom_members.id,
      name: item.custom_members.name,
      last_name: item.custom_members.last_name,
      email: item.custom_members.email,
      phone: item.custom_members.phone,
      end_date: item.end_date,
      membership_type: item.membership_type,
    }))
  }

  const columns = [
    { key: "member_id", header: "מזהה מנוי" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "email", header: "אימייל" },
    { key: "phone", header: "טלפון" },
    { key: "end_date", header: "תאריך סיום" },
    { key: "membership_type", header: "סוג מנוי" },
  ]

  await generateTableReport(fetchData, columns, "דוח תוקף מנויים", { landscape: true })
}

// Member absence report
export const generateMemberAbsenceReport = async (): Promise<void> => {
  const fetchData = async () => {
    const twoWeeksAgo = formatDate(subDays(new Date(), 14))

    // First get all members
    const { data: members, error: membersError } = await supabase
      .from("custom_members")
      .select("id, name, last_name, email, phone, join_date, status, membership_type")
      .eq("status", "active")

    if (membersError) throw membersError
    if (!members) return []

    // Then get recent check-ins
    const { data: recentCheckins, error: checkinsError } = await supabase
      .from("custom_checkins")
      .select("member_id, check_in_time")
      .gte("check_in_time", twoWeeksAgo)

    if (checkinsError) throw checkinsError

    // Find members without recent check-ins
    const recentCheckinMemberIds = new Set((recentCheckins || []).map((c) => c.member_id))
    const absentMembers = members.filter((member) => !recentCheckinMemberIds.has(member.id))

    return absentMembers
  }

  const columns = [
    { key: "id", header: "מזהה" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "email", header: "אימייל" },
    { key: "phone", header: "טלפון" },
    { key: "join_date", header: "תאריך הצטרפות" },
    { key: "membership_type", header: "סוג מנוי" },
  ]

  await generateTableReport(fetchData, columns, "דוח היעדרות מנויים", { landscape: true })
}

// Check-ins report
export const generateCheckInsReport = async (): Promise<void> => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("custom_checkins")
      .select(`
        id, 
        check_in_time, 
        notes,
        custom_members!member_id (id, name, last_name)
      `)
      .order("check_in_time", { ascending: false })
      .limit(500)

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      member_id: item.custom_members.id,
      name: item.custom_members.name,
      last_name: item.custom_members.last_name,
      check_in_time: item.check_in_time,
      notes: item.notes || "",
    }))
  }

  const columns = [
    { key: "id", header: "מזהה" },
    { key: "member_id", header: "מזהה מנוי" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "check_in_time", header: "זמן כניסה" },
    { key: "notes", header: "הערות" },
  ]

  await generateTableReport(fetchData, columns, "דוח כניסות מנויים", { landscape: true })
}

// Membership renewal report
export const generateMembershipRenewalReport = async (): Promise<void> => {
  const fetchData = async () => {
    const thirtyDaysAgo = formatDate(subDays(new Date(), 30))

    const { data, error } = await supabase
      .from("custom_memberships")
      .select(`
        id, 
        start_date,
        end_date, 
        membership_type,
        price,
        custom_members!member_id (id, name, last_name, email, phone)
      `)
      .gte("start_date", thirtyDaysAgo)
      .order("start_date", { ascending: false })

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      member_id: item.custom_members.id,
      name: item.custom_members.name,
      last_name: item.custom_members.last_name,
      email: item.custom_members.email,
      phone: item.custom_members.phone,
      start_date: item.start_date,
      end_date: item.end_date,
      membership_type: item.membership_type,
      price: item.price,
    }))
  }

  const columns = [
    { key: "member_id", header: "מזהה מנוי" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "start_date", header: "תאריך התחלה" },
    { key: "end_date", header: "תאריך סיום" },
    { key: "membership_type", header: "סוג מנוי" },
    { key: "price", header: "מחיר" },
  ]

  await generateTableReport(fetchData, columns, "דוח חידוש מנויים", { landscape: true })
}

// ==================== FINANCIAL REPORTS ====================


// Payments report
export const generatePaymentsReport = async (): Promise<void> => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        id, 
        payment_date,
        amount,
        payment_method,
        invoice_id,
        custom_members!member_id (id, name, last_name)
      `)
      .order("payment_date", { ascending: false })
      .limit(500)

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      member_id: item.custom_members.id,
      name: item.custom_members.name,
      last_name: item.custom_members.last_name,
      payment_date: item.payment_date,
      amount: item.amount,
      payment_method: item.payment_method,
      invoice_id: item.invoice_id,
    }))
  }

  const columns = [
    { key: "id", header: "מזהה" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "payment_date", header: "תאריך תשלום" },
    { key: "amount", header: "סכום" },
    { key: "payment_method", header: "אמצעי תשלום" },
    { key: "invoice_id", header: "מזהה חשבונית" },
  ]

  await generateTableReport(fetchData, columns, "דוח תקבולים", { landscape: true })
}

// Document creation report
export const generateDocumentCreationReport = async (): Promise<void> => {
  const fetchData = async () => {
    const thirtyDaysAgo = formatDate(subDays(new Date(), 30))

    const { data, error } = await supabase
      .from("invoices")
      .select(`
        id, 
        invoice_number,
        created_at,
        due_date,
        total_amount,
        status,
        custom_members!member_id (id, name, last_name)
      `)
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      invoice_number: item.invoice_number || item.id,
      member_id: item.custom_members.id,
      name: item.custom_members.name,
      last_name: item.custom_members.last_name,
      created_at: item.created_at,
      due_date: item.due_date,
      total_amount: item.total_amount,
      status: item.status,
    }))
  }

  const columns = [
    { key: "invoice_number", header: "מספר חשבונית" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "created_at", header: "תאריך יצירה" },
    { key: "due_date", header: "תאריך לתשלום" },
    { key: "total_amount", header: "סכום כולל" },
    { key: "status", header: "סטטוס" },
  ]

  await generateTableReport(fetchData, columns, "דוח יצירת מסמכים", { landscape: true })
}

// Payment creation report
export const generatePaymentCreationReport = async (): Promise<void> => {
  const fetchData = async () => {
    const thirtyDaysAgo = formatDate(subDays(new Date(), 30))

    const { data, error } = await supabase
      .from("payments")
      .select(`
        id, 
        payment_date,
        amount,
        payment_method,
        invoice_id,
        custom_members!member_id (id, name, last_name)
      `)
      .gte("payment_date", thirtyDaysAgo)
      .order("payment_date", { ascending: false })

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      member_id: item.custom_members.id,
      name: item.custom_members.name,
      last_name: item.custom_members.last_name,
      payment_date: item.payment_date,
      amount: item.amount,
      payment_method: item.payment_method,
      invoice_id: item.invoice_id,
    }))
  }

  const columns = [
    { key: "id", header: "מזהה" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "payment_date", header: "תאריך תשלום" },
    { key: "amount", header: "סכום" },
    { key: "payment_method", header: "אמצעי תשלום" },
    { key: "invoice_id", header: "מזהה חשבונית" },
  ]

  await generateTableReport(fetchData, columns, "דוח יצירת תקבולים", { landscape: true })
}

// Orders report
export const generateOrdersReport = async (): Promise<void> => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id, 
        order_date,
        total_amount,
        status,
        custom_members!member_id (id, name, last_name)
      `)
      .order("order_date", { ascending: false })
      .limit(500)

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      member_id: item.custom_members.id,
      name: item.custom_members.name,
      last_name: item.custom_members.last_name,
      order_date: item.order_date,
      total_amount: item.total_amount,
      status: item.status,
    }))
  }

  const columns = [
    { key: "id", header: "מזהה" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "order_date", header: "תאריך הזמנה" },
    { key: "total_amount", header: "סכום כולל" },
    { key: "status", header: "סטטוס" },
  ]

  await generateTableReport(fetchData, columns, "דוח הזמנות", { landscape: true })
}

// ==================== GENERAL REPORTS ====================

// Employee attendance report
export const generateEmployeeAttendanceReport = async (): Promise<void> => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("staff_attendance")
      .select(`
        id, 
        check_in_time,
        check_out_time,
        staff!staff_id (id, name, last_name, position)
      `)
      .order("check_in_time", { ascending: false })
      .limit(500)

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      staff_id: item.staff.id,
      name: item.staff.name,
      last_name: item.staff.last_name,
      position: item.staff.position,
      check_in_time: item.check_in_time,
      check_out_time: item.check_out_time,
      hours_worked: item.check_out_time
        ? Math.round(
            ((new Date(item.check_out_time).getTime() - new Date(item.check_in_time).getTime()) / (1000 * 60 * 60)) *
              10,
          ) / 10
        : null,
    }))
  }

  const columns = [
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "position", header: "תפקיד" },
    { key: "check_in_time", header: "זמן כניסה" },
    { key: "check_out_time", header: "זמן יציאה" },
    { key: "hours_worked", header: "שעות עבודה" },
  ]

  await generateTableReport(fetchData, columns, "דוח נוכחות עובדים", { landscape: true })
}

// Messages report
export const generateMessagesReport = async (): Promise<void> => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        id, 
        created_at,
        subject,
        content,
        status,
        sender_id,
        sender_type,
        recipient_id,
        recipient_type
      `)
      .order("created_at", { ascending: false })
      .limit(500)

    if (error) throw error

    return data || []
  }

  const columns = [
    { key: "id", header: "מזהה" },
    { key: "created_at", header: "תאריך יצירה" },
    { key: "subject", header: "נושא" },
    { key: "content", header: "תוכן" },
    { key: "status", header: "סטטוס" },
    { key: "sender_type", header: "סוג שולח" },
    { key: "recipient_type", header: "סוג נמען" },
  ]

  await generateTableReport(fetchData, columns, "דוח הודעות", { landscape: true })
}

// Inactive customers report
export const generateInactiveCustomersReport = async (): Promise<void> => {
  const fetchData = async () => {
    const threeMonthsAgo = formatDate(subMonths(new Date(), 3))

    // First get all members
    const { data: members, error: membersError } = await supabase
      .from("custom_members")
      .select(`
    id, 
    name, 
    last_name, 
    email, 
    phone, 
    created_at,
    custom_memberships!inner (
      id,
      membership_type,
      status
    )
  `)
      .eq("custom_memberships.status", "active")

    if (membersError) throw membersError
    if (!members) return []

    // Then get the most recent check-in for each member
    const { data: lastCheckins, error: lastCheckinsError } = await supabase
      .from("custom_checkins")
      .select("member_id, check_in_time")
      .order("check_in_time", { ascending: false })

    if (lastCheckinsError) throw lastCheckinsError

    // Create a map of member_id to their last check-in date
    const lastCheckinMap = new Map()
    if (lastCheckins) {
      lastCheckins.forEach((checkin) => {
        if (!lastCheckinMap.has(checkin.member_id)) {
          lastCheckinMap.set(checkin.member_id, checkin.check_in_time)
        }
      })
    }

    // Find members without recent check-ins
    const { data: recentCheckins, error: checkinsError } = await supabase
      .from("custom_checkins")
      .select("member_id, check_in_time")
      .gte("check_in_time", threeMonthsAgo)

    if (checkinsError) throw checkinsError

    const recentCheckinMemberIds = new Set((recentCheckins || []).map((c) => c.member_id))
    const inactiveMembers = members
      .filter((member) => !recentCheckinMemberIds.has(member.id))
      .map((member) => ({
        id: member.id,
        name: member.name,
        last_name: member.last_name || "",
        email: member.email || "",
        phone: member.phone || "",
        join_date: member.created_at,
        last_check_in: lastCheckinMap.get(member.id) || "אף פעם",
        membership_type: member.custom_memberships[0]?.membership_type || "אין מנוי",
      }))

    return inactiveMembers
  }

  const columns = [
    { key: "id", header: "מזהה" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "email", header: "אימייל" },
    { key: "phone", header: "טלפון" },
    { key: "join_date", header: "תאריך הצטרפות" },
    { key: "last_check_in", header: "כניסה אחרונה" },
    { key: "membership_type", header: "סוג מנוי" },
  ]

  await generateTableReport(fetchData, columns, "דוח לקוחות לא פעילים", { landscape: true })
}
