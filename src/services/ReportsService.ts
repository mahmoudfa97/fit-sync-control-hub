import { supabase } from "@/integrations/supabase/client"
import { generateTableReport } from "@/utils/pdfGenerator"
import { subDays, subMonths } from "date-fns"

// Helper function to format date for queries
const formatDate = (date: Date): string => {
  return date.toISOString()
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

// Financial documents report
export const generateFinancialDocumentsReport = async (): Promise<void> => {
  const fetchData = async () => {
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
      .order("created_at", { ascending: false })
      .limit(500)

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

  await generateTableReport(fetchData, columns, "דוח מסמכים פיננסים", { landscape: true })
}

// Debts report
export const generateDebtsReport = async (): Promise<void> => {
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        id, 
        invoice_number,
        created_at,
        due_date,
        total_amount,
        custom_members!member_id (id, name, last_name, email, phone)
      `)
      .eq("status", "unpaid")
      .lte("due_date", formatDate(new Date()))
      .order("due_date", { ascending: true })

    if (error) throw error

    return (data || []).map((item) => ({
      id: item.id,
      invoice_number: item.invoice_number || item.id,
      member_id: item.custom_members.id,
      name: item.custom_members.name,
      last_name: item.custom_members.last_name,
      email: item.custom_members.email,
      phone: item.custom_members.phone,
      created_at: item.created_at,
      due_date: item.due_date,
      total_amount: item.total_amount,
      days_overdue: Math.floor((new Date().getTime() - new Date(item.due_date).getTime()) / (1000 * 60 * 60 * 24)),
    }))
  }

  const columns = [
    { key: "invoice_number", header: "מספר חשבונית" },
    { key: "name", header: "שם" },
    { key: "last_name", header: "שם משפחה" },
    { key: "phone", header: "טלפון" },
    { key: "due_date", header: "תאריך לתשלום" },
    { key: "days_overdue", header: "ימים באיחור" },
    { key: "total_amount", header: "סכום לתשלום" },
  ]

  await generateTableReport(fetchData, columns, "דוח חובות", { landscape: true })
}

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
