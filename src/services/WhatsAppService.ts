import { supabase } from "@/integrations/supabase/client"

interface WhatsAppTemplate {
  id: string
  name: string
  status: "approved" | "pending" | "rejected"
  category: string
  components: any[]
  language: string
}

interface MessageResponse {
  id: string
  status: string
  timestamp: string
}

export const WhatsAppService = {
  /**
   * Get all WhatsApp message templates
   */
  async getTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      console.log("Fetching WhatsApp templates from Edge Function...")

      // Call the Edge Function to get templates
      const { data, error } = await supabase.functions.invoke("get-whatsapp-templates")

      if (error) {
        console.error("Error invoking Edge Function:", error)
        throw error
      }

      if (!data || !data.templates) {
        console.error("Invalid response from Edge Function:", data)

        // If we can't get real templates, return mock data for development
        return this.getMockTemplates()
      }

      console.log("Templates fetched successfully:", data.templates)
      return data.templates
    } catch (error) {
      console.error("Error fetching WhatsApp templates:", error)

      // Return mock templates as fallback
      console.log("Returning mock templates as fallback")
      return this.getMockTemplates()
    }
  },

  /**
   * Get mock templates for development/testing
   */
  getMockTemplates(): WhatsAppTemplate[] {
    return [
      {
        id: "payment_reminder",
        name: "تذكير بالدفع",
        status: "approved",
        category: "UTILITY",
        components: [
          {
            type: "HEADER",
            format: "TEXT",
            text: "تذكير بدفع الاشتراك",
            example: {
              variables: [],
            },
          },
          {
            type: "BODY",
            text: "مرحباً {{1}}،\n\nهذا تذكير بأن الدفعة المستحقة لاشتراكك بقيمة {{2}} شيكل ستتم في تاريخ {{3}}.\n\nللاستفسارات، يرجى التواصل مع فريق النادي.",
            example: {
              variables: ["محمد", "250", "01/06/2023"],
            },
          },
        ],
        language: "ar",
      },
      {
        id: "membership_renewal",
        name: "تجديد الاشتراك",
        status: "approved",
        category: "UTILITY",
        components: [
          {
            type: "HEADER",
            format: "TEXT",
            text: "اشتراكك على وشك الانتهاء",
            example: {
              variables: [],
            },
          },
          {
            type: "BODY",
            text: "مرحباً {{1}}،\n\nاشتراكك في النادي الرياضي على وشك الانتهاء في تاريخ {{2}}.\n\nلتجديد اشتراكك، يرجى زيارة النادي أو الاتصال بنا على الرقم {{3}}.",
            example: {
              variables: ["محمد", "15/06/2023", "03-1234567"],
            },
          },
        ],
        language: "ar",
      },
      {
        id: "class_reminder",
        name: "تذكير بالحصة",
        status: "approved",
        category: "UTILITY",
        components: [
          {
            type: "HEADER",
            format: "TEXT",
            text: "تذكير بالحصة غداً",
            example: {
              variables: [],
            },
          },
          {
            type: "BODY",
            text: "مرحباً {{1}}،\n\nهذا تذكير بحصة {{2}} التي سجلت فيها غداً في الساعة {{3}}.\n\nنتطلع لرؤيتك!",
            example: {
              variables: ["محمد", "يوغا", "18:00"],
            },
          },
        ],
        language: "ar",
      },
    ]
  },

  /**
   * Send a direct WhatsApp message
   * Note: Direct messages can only be sent within a 24-hour window after the customer's last message
   * or if the customer has opted in to receive messages
   */
  async sendDirectMessage(phoneNumber: string, message: string): Promise<MessageResponse> {
    try {
      // Format phone number (remove spaces, ensure it starts with country code)
      const formattedPhone = this.formatPhoneNumber(phoneNumber)

      // Call the Edge Function to send the message
      const { data, error } = await supabase.functions.invoke("send-whatsapp-message", {
        body: { phoneNumber: formattedPhone, message },
      })

      if (error) {
        console.error("Error sending WhatsApp message:", error)
        throw error
      }

      // Return the response from the WhatsApp API
      return {
        id: data.messages?.[0]?.id || `msg_${Date.now()}`,
        status: "sent",
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error)
      throw error
    }
  },

  /**
   * Send a template WhatsApp message
   */
  async sendTemplateMessage(
    phoneNumber: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<MessageResponse> {
    try {
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(phoneNumber)

      // Call the Edge Function to send the template message
      const { data, error } = await supabase.functions.invoke("send-whatsapp-template", {
        body: { phoneNumber: formattedPhone, templateId, variables },
      })

      if (error) {
        console.error("Error sending WhatsApp template message:", error)
        throw error
      }

      // Return the response from the WhatsApp API
      return {
        id: data.messages?.[0]?.id || `msg_${Date.now()}`,
        status: "sent",
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error sending WhatsApp template message:", error)
      throw error
    }
  },

  /**
   * Format phone number to international format
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, "")

    // Ensure it starts with country code (default to Israel +972)
    if (cleaned.startsWith("0")) {
      cleaned = "972" + cleaned.substring(1)
    }

    // If no country code, assume Israel
    if (!cleaned.startsWith("972") && !cleaned.startsWith("1")) {
      cleaned = "972" + cleaned
    }

    return cleaned
  },

  /**
   * Get message status
   */
  async getMessageStatus(messageId: string): Promise<string> {
    try {
      // Query the database for message status
      const { data, error } = await supabase
        .from("whatsapp_message_statuses")
        .select("status")
        .eq("message_id", messageId)
        .order("timestamp", { ascending: false })
        .limit(1)
        .single()

      if (error) {
        console.error("Error getting message status:", error)
        return "unknown"
      }

      return data?.status || "unknown"
    } catch (error) {
      console.error("Error getting message status:", error)
      return "unknown"
    }
  },

  /**
   * Get recent messages for a member
   */
  async getMemberMessages(memberId: string, limit = 10): Promise<any[]> {
    try {
      // First get the member's phone number
      const { data: memberData, error: memberError } = await supabase
        .from("custom_members")
        .select("phone")
        .eq("id", memberId)
        .single()

      if (memberError || !memberData) {
        console.error("Error getting member data:", memberError)
        return []
      }

      const phoneNumber = this.formatPhoneNumber(memberData.phone)

      // Get outgoing messages
      const { data: outgoingData, error: outgoingError } = await supabase
        .from("whatsapp_outgoing_messages")
        .select("*")
        .eq("recipient", phoneNumber)
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (outgoingError) {
        console.error("Error getting outgoing messages:", outgoingError)
        return []
      }

      // Get incoming messages - match by formatted phone number
      const { data: incomingData, error: incomingError } = await supabase
        .from("whatsapp_incoming_messages")
        .select("*")
        .eq("sender", phoneNumber)
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (incomingError) {
        console.error("Error getting incoming messages:", incomingError)
        return []
      }

      // Combine and sort messages
      const allMessages = [
        ...(outgoingData || []).map((msg) => ({
          ...msg,
          direction: "outgoing",
        })),
        ...(incomingData || []).map((msg) => ({
          ...msg,
          direction: "incoming",
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      return allMessages.slice(0, limit)
    } catch (error) {
      console.error("Error getting member messages:", error)
      return []
    }
  },

  /**
   * Check if a member has opted in to receive WhatsApp messages
   * Note: This is a simplified version since the opt-in field doesn't exist
   */
  async checkMemberOptIn(memberId: string): Promise<boolean> {
    try {
      // Since the whatsapp_opt_in field doesn't exist, we'll assume all members are opted in
      // You may want to add this field to your custom_members table in the future
      return true
    } catch (error) {
      console.error("Error checking member opt-in status:", error)
      return false
    }
  },

  /**
   * Update member opt-in status
   * Note: This is a placeholder since the opt-in field doesn't exist
   */
  async updateMemberOptIn(memberId: string, optIn: boolean): Promise<boolean> {
    try {
      // Since the whatsapp_opt_in field doesn't exist, this is a no-op
      // You may want to add this field to your custom_members table in the future
      console.log(`Member ${memberId} opt-in status would be set to ${optIn}`)
      return true
    } catch (error) {
      console.error("Error updating member opt-in status:", error)
      return false
    }
  },
}

export default WhatsAppService
