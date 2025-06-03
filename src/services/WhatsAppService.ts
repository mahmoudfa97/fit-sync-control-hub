
import { supabase } from "@/integrations/supabase/client"
import { WhatsAppConfigService } from './WhatsAppConfigService'

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
  async getConfig(organizationId: string) {
    return await WhatsAppConfigService.getConfig(organizationId)
  },

  async getTemplates(organizationId: string): Promise<WhatsAppTemplate[]> {
    try {
      console.log("Fetching WhatsApp templates for organization:", organizationId)

      const config = await this.getConfig(organizationId)
      if (!config || !config.access_token || !config.phone_number_id) {
        console.log("WhatsApp not configured for organization, returning mock templates")
        return this.getMockTemplates()
      }

      const { data, error } = await supabase.functions.invoke("get-whatsapp-templates", {
        body: { 
          organizationId,
          phoneNumberId: config.phone_number_id,
          accessToken: config.access_token
        }
      })

      if (error) {
        console.error("Error invoking Edge Function:", error)
        return this.getMockTemplates()
      }

      if (!data || !data.templates) {
        console.error("Invalid response from Edge Function:", data)
        return this.getMockTemplates()
      }

      console.log("Templates fetched successfully:", data.templates)
      return data.templates
    } catch (error) {
      console.error("Error fetching WhatsApp templates:", error)
      return this.getMockTemplates()
    }
  },

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
            example: { variables: [] },
          },
          {
            type: "BODY",
            text: "مرحباً {{1}}،\n\nهذا تذكير بأن الدفعة المستحقة لاشتراكك بقيمة {{2}} شيكل ستتم في تاريخ {{3}}.\n\nللاستفسارات، يرجى التواصل مع فريق النادي.",
            example: { variables: ["محمد", "250", "01/06/2023"] },
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
            example: { variables: [] },
          },
          {
            type: "BODY",
            text: "مرحباً {{1}}،\n\nاشتراكك في النادي الرياضي على وشك الانتهاء في تاريخ {{2}}.\n\nلتجديد اشتراكك، يرجى زيارة النادي أو الاتصال بنا على الرقم {{3}}.",
            example: { variables: ["محمد", "15/06/2023", "03-1234567"] },
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
            example: { variables: [] },
          },
          {
            type: "BODY",
            text: "مرحباً {{1}}،\n\nهذا تذكير بحصة {{2}} التي سجلت فيها غداً في الساعة {{3}}.\n\nنتطلع لرؤيتك!",
            example: { variables: ["محمد", "يوغا", "18:00"] },
          },
        ],
        language: "ar",
      },
    ]
  },

  async sendDirectMessage(organizationId: string, phoneNumber: string, message: string): Promise<MessageResponse> {
    try {
      const config = await this.getConfig(organizationId)
      if (!config || !config.access_token || !config.phone_number_id) {
        throw new Error('WhatsApp not configured for this organization')
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber)

      const { data, error } = await supabase.functions.invoke("send-whatsapp-message", {
        body: { 
          organizationId,
          phoneNumber: formattedPhone, 
          message,
          phoneNumberId: config.phone_number_id,
          accessToken: config.access_token
        },
      })

      if (error) {
        console.error("Error sending WhatsApp message:", error)
        throw error
      }

      // Store outgoing message
      await this.storeOutgoingMessage(organizationId, formattedPhone, message, 'direct')

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

  async sendTemplateMessage(
    organizationId: string,
    phoneNumber: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<MessageResponse> {
    try {
      const config = await this.getConfig(organizationId)
      if (!config || !config.access_token || !config.phone_number_id) {
        throw new Error('WhatsApp not configured for this organization')
      }

      const formattedPhone = this.formatPhoneNumber(phoneNumber)

      const { data, error } = await supabase.functions.invoke("send-whatsapp-template", {
        body: { 
          organizationId,
          phoneNumber: formattedPhone, 
          templateId, 
          variables,
          phoneNumberId: config.phone_number_id,
          accessToken: config.access_token
        },
      })

      if (error) {
        console.error("Error sending WhatsApp template message:", error)
        throw error
      }

      // Store outgoing message
      await this.storeOutgoingMessage(organizationId, formattedPhone, `Template: ${templateId}`, 'template', templateId, variables)

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

  async storeOutgoingMessage(
    organizationId: string,
    recipient: string,
    content: string,
    messageType: string,
    templateId?: string,
    templateVariables?: Record<string, string>
  ) {
    try {
      const { error } = await supabase
        .from("whatsapp_outgoing_messages")
        .insert({
          recipient,
          content,
          message_type: messageType,
          template_id: templateId,
          template_variables: templateVariables,
          status: 'sent',
          timestamp: new Date().toISOString()
        })

      if (error) {
        console.error("Error storing outgoing message:", error)
      }
    } catch (error) {
      console.error("Error storing outgoing message:", error)
    }
  },

  formatPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\D/g, "")

    if (cleaned.startsWith("0")) {
      cleaned = "972" + cleaned.substring(1)
    }

    if (!cleaned.startsWith("972") && !cleaned.startsWith("1")) {
      cleaned = "972" + cleaned
    }

    return cleaned
  },

  async getMessageStatus(messageId: string): Promise<string> {
    try {
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

  async getMemberMessages(memberId: string, limit = 10): Promise<any[]> {
    try {
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

  async checkMemberOptIn(memberId: string): Promise<boolean> {
    try {
      return true
    } catch (error) {
      console.error("Error checking member opt-in status:", error)
      return false
    }
  },

  async updateMemberOptIn(memberId: string, optIn: boolean): Promise<boolean> {
    try {
      console.log(`Member ${memberId} opt-in status would be set to ${optIn}`)
      return true
    } catch (error) {
      console.error("Error updating member opt-in status:", error)
      return false
    }
  },
}

export default WhatsAppService
