"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { sendWhatsAppTemplate } from "@/services/SMS-Serivce"
import { Loader2, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface WhatsAppTemplateFormProps {
  recipientPhone?: string
  onSent?: (result: { success: boolean; message: string }) => void
}

// Available WhatsApp templates - organized by category
const TEMPLATES = [
  // Class & Appointment Templates
  { id: "gym_class_reminder", name: "Class Reminder", language: "en_US", category: "Marketing" },
  { id: "gym_booking_confirmation", name: "Booking Confirmation", language: "en_US", category: "Marketing" },

  // Membership Templates
  { id: "gym_membership_renewal", name: "Membership Renewal", language: "en_US", category: "Marketing" },
  { id: "gym_payment_confirmation", name: "Payment Confirmation", language: "en_US", category: "Marketing" },

  // Engagement Templates
  { id: "gym_workout_tip", name: "Workout Tip", language: "en_US", category: "Marketing" },
  { id: "gym_progress_check", name: "Progress Check-In", language: "en_US", category: "Marketing" },

  // Marketing Templates
  { id: "gym_special_offer", name: "Special Offer", language: "en_US", category: "Marketing" },
  { id: "gym_new_class", name: "New Class Announcement", language: "en_US", category: "Marketing" },

  // Authentication Templates
  { id: "gym_account_verification", name: "Account Verification", language: "en_US", category: "Marketing" },
  { id: "gym_password_reset", name: "Password Reset", language: "en_US", category: "Marketing" },

  // Feedback Templates
  { id: "gym_class_feedback", name: "Class Feedback", language: "en_US", category: "Marketing" },
  { id: "gym_experience_survey", name: "Experience Survey", language: "en_US", category: "Marketing" },

  // Other
  { id: "hello_world", name: "Hello World", language: "en_US", category: "Utility" },
]

// Group templates by category
const templatesByCategory = TEMPLATES.reduce(
  (acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  },
  {} as Record<string, typeof TEMPLATES>,
)

// Template parameter configurations
const TEMPLATE_PARAMS = {
  gym_class_reminder: [
    { name: "Member name", placeholder: "John" },
    { name: "Class type", placeholder: "Spin" },
    { name: "Date and time", placeholder: "tomorrow at 6:00 PM" },
    { name: "Required items", placeholder: "water and a towel" },
  ],
  gym_booking_confirmation: [
    { name: "Member name", placeholder: "Sarah" },
    { name: "Session type", placeholder: "Personal Training" },
    { name: "Date and time", placeholder: "Monday, June 10 at 3:00 PM" },
    { name: "Trainer name", placeholder: "Mike" },
    { name: "Location", placeholder: "Main Gym Floor" },
  ],
  gym_membership_renewal: [
    { name: "Member name", placeholder: "Alex" },
    { name: "Expiration date", placeholder: "June 30, 2023" },
    { name: "Renewal deadline", placeholder: "June 25, 2023" },
    { name: "Current plan", placeholder: "Premium Membership" },
    { name: "Fee amount", placeholder: "$49.99" },
  ],
  gym_payment_confirmation: [
    { name: "Member name", placeholder: "Lisa" },
    { name: "Amount paid", placeholder: "$49.99" },
    { name: "Membership type", placeholder: "Monthly Premium" },
    { name: "New expiration date", placeholder: "July 31, 2023" },
    { name: "Receipt number", placeholder: "GYM-12345" },
  ],
  gym_workout_tip: [
    { name: "Member name", placeholder: "David" },
    { name: "Workout tip", placeholder: "Always warm up for at least 5 minutes before intense exercise" },
    { name: "Additional advice", placeholder: "Proper form is more important than heavy weights" },
  ],
  gym_progress_check: [
    { name: "Member name", placeholder: "Emma" },
    { name: "Time period", placeholder: "3 months" },
    { name: "Fitness goal", placeholder: "weight loss" },
  ],
  gym_special_offer: [
    { name: "Member name", placeholder: "Michael" },
    { name: "Discount/offer", placeholder: "50% off" },
    { name: "Service", placeholder: "personal training sessions" },
    { name: "Expiration date", placeholder: "June 15, 2023" },
  ],
  gym_new_class: [
    { name: "Member name", placeholder: "Jessica" },
    { name: "Class name", placeholder: "Kickboxing Cardio" },
    { name: "Start date", placeholder: "next Monday" },
    { name: "Instructor name", placeholder: "Coach Ryan" },
    { name: "Benefits", placeholder: "improved cardio, stress relief, and full-body workout" },
  ],
  gym_account_verification: [{ name: "Verification code", placeholder: "123456" }],
  gym_password_reset: [{ name: "Reset code", placeholder: "987654" }],
  gym_class_feedback: [
    { name: "Member name", placeholder: "Robert" },
    { name: "Class name", placeholder: "Yoga" },
    { name: "Instructor name", placeholder: "Instructor Jane" },
  ],
  gym_experience_survey: [{ name: "Member name", placeholder: "Thomas" }],
  hello_world: [],
}

export function WhatsAppTemplateForm({ recipientPhone = "", onSent }: WhatsAppTemplateFormProps) {
  const [phone, setPhone] = useState(recipientPhone)
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id)
  const [sending, setSending] = useState(false)
  const [paramValues, setParamValues] = useState<string[]>([])

  // Get the selected template
  const selectedTemplate = TEMPLATES.find((t) => t.id === templateId)

  // Get parameters for the selected template
  const templateParams = TEMPLATE_PARAMS[templateId as keyof typeof TEMPLATE_PARAMS] || []

  // Update parameter values when template changes
  const handleTemplateChange = (newTemplateId: string) => {
    setTemplateId(newTemplateId)
    // Reset parameter values with placeholders
    const newParams = TEMPLATE_PARAMS[newTemplateId as keyof typeof TEMPLATE_PARAMS] || []
    setParamValues(newParams.map((p) => ""))
  }

  // Update a specific parameter value
  const handleParamChange = (index: number, value: string) => {
    const newValues = [...paramValues]
    newValues[index] = value
    setParamValues(newValues)
  }

  const handleSend = async () => {
    if (!phone || !templateId) {
      toast.error("Please provide both phone number and template")
      return
    }

    try {
      setSending(true)

      // Prepare components if there are parameters
      let components = undefined

      if (templateParams.length > 0) {
        // Create parameters array for the body component
        const parameters = templateParams.map((param, index) => ({
          type: "text" as const,
          text: paramValues[index] || param.placeholder,
        }))

        // Only add components if we have parameters
        if (parameters.length > 0) {
          components = [
            {
              type: "body",
              parameters,
            },
          ]
        }
      }

      const result = await sendWhatsAppTemplate({
        to: phone,
        templateName: templateId,
        language: selectedTemplate?.language || "en_US",
        components,
      })

      if (result.success) {
        toast.success("WhatsApp message sent successfully!")
      } else {
        toast.error(`Failed to send WhatsApp message: ${result.message}`)
      }

      if (onSent) {
        onSent(result)
      }
    } catch (error: any) {
      console.error("Error sending WhatsApp message:", error)
      toast.error(`Error: ${error.message || "Unknown error"}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Send WhatsApp Template</CardTitle>
        <CardDescription>Send pre-approved WhatsApp templates to your gym members</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Recipient WhatsApp Number
          </label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+972xxxxxxxxx"
            disabled={sending}
          />
          <p className="text-xs text-muted-foreground">Include country code (e.g., +972 for Israel)</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="template" className="text-sm font-medium">
            Message Template
          </label>
          <Select value={templateId} onValueChange={handleTemplateChange} disabled={sending}>
            <SelectTrigger id="template">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(templatesByCategory).map(([category, templates]) => (
                <SelectGroup key={category}>
                  <SelectLabel>{category}</SelectLabel>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Only approved templates can be sent to users</p>
        </div>

        {/* Dynamic template parameters */}
        {templateParams.length > 0 && (
          <div className="space-y-3 border rounded-md p-3 bg-muted/20">
            <h3 className="font-medium text-sm">Template Parameters</h3>
            {templateParams.map((param, index) => (
              <div key={index} className="space-y-1">
                <label className="text-xs font-medium">{param.name}</label>
                <Input
                  value={paramValues[index] || ""}
                  onChange={(e) => handleParamChange(index, e.target.value)}
                  placeholder={param.placeholder}
                  disabled={sending}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSend} disabled={sending} className="w-full">
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Template
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
