"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, Trash2, CreditCard, Banknote, Building, CheckSquare, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

// Document types
const DOCUMENT_TYPES = [
  { value: "320", label: "קבלה (Receipt)" },
  { value: "305", label: "חשבונית מס (Tax Invoice)" },
  { value: "330", label: "חשבונית מס/קבלה (Tax Invoice/Receipt)" },
  { value: "400", label: "חשבונית זיכוי (Credit Invoice)" },
  { value: "405", label: "חשבונית מס/קבלה זיכוי (Credit Tax Invoice/Receipt)" },
]

// Payment types
const PAYMENT_TYPES = [
  { value: "1", label: "מזומן (Cash)" },
  { value: "2", label: "המחאה (Check)" },
  { value: "3", label: "כרטיס אשראי (Credit Card)" },
  { value: "4", label: "העברה בנקאית (Bank Transfer)" },
  { value: "5", label: "הוראת קבע (Standing Order)" },
  { value: "9", label: "אחר (Other)" },
]

// Credit card types
const CREDIT_CARD_TYPES = [
  { value: "1", label: "ישראכרט (Isracard)" },
  { value: "2", label: "ויזה (Visa)" },
  { value: "3", label: "דיינרס (Diners)" },
  { value: "4", label: "אמריקן אקספרס (American Express)" },
  { value: "5", label: "מאסטרקארד (Mastercard)" },
  { value: "6", label: "לאומי קארד (Leumi Card)" },
  { value: "7", label: "אחר (Other)" },
]

// Credit card deal types
const CREDIT_CARD_DEAL_TYPES = [
  { value: "1", label: "רגיל (Regular)" },
  { value: "2", label: "תשלומים (Installments)" },
  { value: "3", label: "קרדיט (Credit)" },
  { value: "4", label: "חיוב נדחה (Delayed Charge)" },
]

// VAT types
const VAT_TYPES = [
  { value: "INC", label: 'כולל מע"מ (Including VAT)' },
  { value: "EXC", label: 'לא כולל מע"מ (Excluding VAT)' },
  { value: "FREE", label: 'פטור ממע"מ (VAT Free)' },
]

interface Item {
  catalog_number: string
  details: string
  price: number
  amount: number
  vat_type: string
}

interface Payment {
  payment_type: string
  payment_sum: number
  cc_type?: string
  cc_type_name?: string
  cc_number?: string
  cc_deal_type?: string
  cc_num_of_payments?: number
  cc_payment_num?: number
  check_number?: string
  check_date?: string
  bank_name?: string
  bank_branch?: string
  bank_account?: string
}

interface DocumentData {
  developer_email: string
  api_key: string
  type: string
  transaction_id: string
  customer_name: string
  customer_email: string
  customer_address: string
  customer_phone: string
  forceItems: number
  show_items_including_vat: number
  item: Item[]
  payment: Payment[]
  price_total: number
  comment: string
  send_email: boolean
  email_to_client: string
  lang: string
  paper_type: string
}

export default function HypDocumentCreator() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("document")
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)

  // Initialize document data with default values
  const [documentData, setDocumentData] = useState<DocumentData>({
    developer_email: "",
    api_key: "",
    type: "320", // Default to receipt
    transaction_id: "",
    customer_name: "",
    customer_email: "",
    customer_address: "",
    customer_phone: "",
    forceItems: 1,
    show_items_including_vat: 1,
    item: [
      {
        catalog_number: "",
        details: "",
        price: 0,
        amount: 1,
        vat_type: "INC",
      },
    ],
    payment: [
      {
        payment_type: "3", // Default to credit card
        payment_sum: 0,
        cc_type: "2", // Default to Visa
        cc_type_name: "Visa",
        cc_number: "",
        cc_deal_type: "1", // Default to regular
        cc_num_of_payments: 1,
        cc_payment_num: 1,
      },
    ],
    price_total: 0,
    comment: "",
    send_email: true,
    email_to_client: "",
    lang: "he", // Default to Hebrew
    paper_type: "A4",
  })

  // Load API credentials from environment or local storage
  useEffect(() => {
    const loadCredentials = async () => {
      try {
        // Try to get from environment variables first
        let developerEmail = import.meta.env.VITE_HYP_DEVELOPER_EMAIL
        let apiKey = import.meta.env.VITE_HYP_API_KEY

        // If not available, try local storage
        if (!developerEmail) {
          developerEmail = localStorage.getItem("hyp_developer_email") || ""
        }
        if (!apiKey) {
          apiKey = localStorage.getItem("hyp_api_key") || ""
        }

        // Update state
        setDocumentData((prev) => ({
          ...prev,
          developer_email: developerEmail,
          api_key: apiKey,
        }))
      } catch (error) {
        console.error("Error loading credentials:", error)
      }
    }

    loadCredentials()
  }, [])

  // Calculate total price whenever items change
  useEffect(() => {
    const total = documentData.item.reduce((sum, item) => sum + item.price * item.amount, 0)
    
    setDocumentData((prev) => ({
      ...prev,
      price_total: total,
      payment: prev.payment.map((p, index) => 
        index === 0 ? { ...p, payment_sum: total } : p
      )
    }))
  }, [documentData.item])

  // Update customer email for sending
  useEffect(() => {
    if (documentData.send_email && documentData.customer_email) {
      setDocumentData((prev) => ({
        ...prev,
        email_to_client: prev.customer_email,
      }))
    }
  }, [documentData.send_email, documentData.customer_email])

  // Handle input change for document fields
  const handleDocumentChange = (field: string, value: any) => {
    setDocumentData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Handle item change
  const handleItemChange = (index: number, field: string, value: any) => {
    setDocumentData((prev) => {
      const updatedItems = [...prev.item]
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === "price" || field === "amount" ? Number(value) : value,
      }
      return {
        ...prev,
        item: updatedItems,
      }
    })
  }

  // Add new item
  const addItem = () => {
    setDocumentData((prev) => ({
      ...prev,
      item: [
        ...prev.item,
        {
          catalog_number: "",
          details: "",
          price: 0,
          amount: 1,
          vat_type: "INC",
        },
      ],
    }))
  }

  // Remove item
  const removeItem = (index: number) => {
    if (documentData.item.length <= 1) {
      toast({
        title: "שגיאה",
        description: "חייב להיות לפחות פריט אחד",
        variant: "destructive",
      })
      return
    }

    setDocumentData((prev) => ({
      ...prev,
      item: prev.item.filter((_, i) => i !== index),
    }))
  }

  // Handle payment change
  const handlePaymentChange = (index: number, field: string, value: any) => {
    setDocumentData((prev) => {
      const updatedPayments = [...prev.payment]
      updatedPayments[index] = {
        ...updatedPayments[index],
        [field]: 
          field === "payment_sum" || 
          field === "cc_num_of_payments" || 
          field === "cc_payment_num" 
            ? Number(value) 
            : value,
      }
      return {
        ...prev,
        payment: updatedPayments,
      }
    })
  }

  // Add new payment
  const addPayment = () => {
    setDocumentData((prev) => ({
      ...prev,
      payment: [
        ...prev.payment,
        {
          payment_type: "1", // Default to cash
          payment_sum: 0,
        },
      ],
    }))
  }

  // Remove payment
  const removePayment = (index: number) => {
    if (documentData.payment.length <= 1) {
      toast({
        title: "שגיאה",
        description: "חייב להיות לפחות אמצעי תשלום אחד",
        variant: "destructive",
      })
      return
    }

    setDocumentData((prev) => ({
      ...prev,
      payment: prev.payment.filter((_, i) => i !== index),
    }))
  }

  // Save credentials to local storage
  const saveCredentials = () => {
    try {
      localStorage.setItem("hyp_developer_email", documentData.developer_email)
      localStorage.setItem("hyp_api_key", documentData.api_key)
      
      toast({
        title: "נשמר בהצלחה",
        description: "פרטי ההתחברות נשמרו בהצלחה",
      })
    } catch (error) {
      console.error("Error saving credentials:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת פרטי ההתחברות",
        variant: "destructive",
      })
    }
  }

  // Create document
  const createDocument = async () => {
    try {
      setIsLoading(true)
      
      // Validate required fields
      if (!documentData.developer_email || !documentData.api_key) {
        toast({
          title: "שגיאה",
          description: "יש להזין פרטי התחברות",
          variant: "destructive",
        })
        setActiveTab("settings")
        return
      }

      if (!documentData.customer_name) {
        toast({
          title: "שגיאה",
          description: "יש להזין שם לקוח",
          variant: "destructive",
        })
        return
      }

      if (documentData.item.some(item => !item.details || item.price <= 0)) {
        toast({
          title: "שגיאה",
          description: "יש להזין פרטים ומחיר לכל הפריטים",
          variant: "destructive",
        })
        setActiveTab("items")
        return
      }

      // Prepare data for API
      const apiData = {
        ...documentData,
        forceItems: Number(documentData.forceItems),
        show_items_including_vat: Number(documentData.show_items_including_vat),
        send_email: documentData.send_email ? 1 : 0,
        created_by_api_key: 'f1c85d16fc1acd369a93f0489f4615d93371632d97a9b0a197de6d4dc0da51bf',
      }

      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke("hyp-create-document", {
        body: apiData,
      })

      if (error) {
        throw error
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to create document")
      }

      // Set document URL and ID
      setDocumentUrl(data.doc_url)
      setDocumentId(data.doc_id)

      toast({
        title: "מסמך נוצר בהצלחה",
        description: `מספר מסמך: ${data.doc_number}`,
      })

      // Switch to preview tab
      setActiveTab("preview")
    } catch (error) {
      console.error("Error creating document:", error)
      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "אירעה שגיאה ביצירת המסמך",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Render payment fields based on payment type
  const renderPaymentFields = (payment: Payment, index: number) => {
    switch (payment.payment_type) {
      case "3": // Credit Card
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>סוג כרטיס</Label>
                <Select
                  value={payment.cc_type || "2"}
                  onValueChange={(value) => {
                    const cardName = CREDIT_CARD_TYPES.find(card => card.value === value)?.label.split(" ")[0] || "Visa"
                    handlePaymentChange(index, "cc_type", value)
                    handlePaymentChange(index, "cc_type_name", cardName)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג כרטיס" />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDIT_CARD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>4 ספרות אחרונות</Label>
                <Input
                  value={payment.cc_number || ""}
                  onChange={(e) => handlePaymentChange(index, "cc_number", e.target.value)}
                  maxLength={4}
                  placeholder="1234"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>סוג עסקה</Label>
                <Select
                  value={payment.cc_deal_type || "1"}
                  onValueChange={(value) => handlePaymentChange(index, "cc_deal_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג עסקה" />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDIT_CARD_DEAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>מספר תשלומים</Label>
                <Input
                  type="number"
                  min="1"
                  value={payment.cc_num_of_payments || 1}
                  onChange={(e) => handlePaymentChange(index, "cc_num_of_payments", e.target.value)}
                />
              </div>
            </div>
          </div>
        )
      case "2": // Check
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>מספר המחאה</Label>
                <Input
                  value={payment.check_number || ""}
                  onChange={(e) => handlePaymentChange(index, "check_number", e.target.value)}
                  placeholder="123456"
                />
              </div>
              <div className="space-y-2">
                <Label>תאריך המחאה</Label>
                <Input
                  type="date"
                  value={payment.check_date || ""}
                  onChange={(e) => handlePaymentChange(index, "check_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>בנק</Label>
                <Input
                  value={payment.bank_name || ""}
                  onChange={(e) => handlePaymentChange(index, "bank_name", e.target.value)}
                  placeholder="לאומי"
                />
              </div>
            </div>
          </div>
        )
      case "4": // Bank Transfer
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>בנק</Label>
                <Input
                  value={payment.bank_name || ""}
                  onChange={(e) => handlePaymentChange(index, "bank_name", e.target.value)}
                  placeholder="לאומי"
                />
              </div>
              <div className="space-y-2">
                <Label>סניף</Label>
                <Input
                  value={payment.bank_branch || ""}
                  onChange={(e) => handlePaymentChange(index, "bank_branch", e.target.value)}
                  placeholder="123"
                />
              </div>
              <div className="space-y-2">
                <Label>מספר חשבון</Label>
                <Input
                  value={payment.bank_account || ""}
                  onChange={(e) => handlePaymentChange(index, "bank_account", e.target.value)}
                  placeholder="12345678"
                />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Render payment icon based on payment type
  const renderPaymentIcon = (paymentType: string) => {
    switch (paymentType) {
      case "1": // Cash
        return <Banknote className="h-4 w-4" />
      case "2": // Check
        return <CheckSquare className="h-4 w-4" />
      case "3": // Credit Card
        return <CreditCard className="h-4 w-4" />
      case "4": // Bank Transfer
        return <Building className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>יצירת מסמך HYP</CardTitle>
          <CardDescription>צור חשבוניות, קבלות ומסמכים אחרים באמצעות מערכת HYP</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="document">פרטי מסמך</TabsTrigger>
              <TabsTrigger value="items">פריטים</TabsTrigger>
              <TabsTrigger value="payments">תשלומים</TabsTrigger>
              <TabsTrigger value="settings">הגדרות</TabsTrigger>
              {documentUrl && <TabsTrigger value="preview">תצוגה מקדימה</TabsTrigger>}
            </TabsList>

            {/* Document Details Tab */}
            <TabsContent value="document" className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="document-type">סוג מסמך</Label>
                    <Select
                      value={documentData.type}
                      onValueChange={(value) => handleDocumentChange("type", value)}
                    >
                      <SelectTrigger id="document-type">
                        <SelectValue placeholder="בחר סוג מסמך" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction-id">מספר עסקה (אופציונלי)</Label>
                    <Input
                      id="transaction-id"
                      value={documentData.transaction_id}
                      onChange={(e) => handleDocumentChange("transaction_id", e.target.value)}
                      placeholder="מספר עסקה או אסמכתא"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-name" className="text-red-500 after:content-['*'] after:mr-1">
                    שם לקוח
                  </Label>
                  <Input
                    id="customer-name"
                    value={documentData.customer_name}
                    onChange={(e) => handleDocumentChange("customer_name", e.target.value)}
                    placeholder="שם הלקוח"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-email">אימייל לקוח</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={documentData.customer_email}
                      onChange={(e) => handleDocumentChange("customer_email", e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">טלפון לקוח</Label>
                    <Input
                      id="customer-phone"
                      value={documentData.customer_phone}
                      onChange={(e) => handleDocumentChange("customer_phone", e.target.value)}
                      placeholder="050-1234567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customer-address">כתובת לקוח</Label>
                  <Input
                    id="customer-address"
                    value={documentData.customer_address}
                    onChange={(e) => handleDocumentChange("customer_address", e.target.value)}
                    placeholder="כתובת מלאה"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">הערות למסמך</Label>
                  <Textarea
                    id="comment"
                    value={documentData.comment}
                    onChange={(e) => handleDocumentChange("comment", e.target.value)}
                    placeholder="הערות שיופיעו במסמך"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    id="send-email"
                    checked={documentData.send_email}
                    onCheckedChange={(checked) => handleDocumentChange("send_email", checked)}
                  />
                  <Label htmlFor="send-email">שלח מסמך במייל ללקוח</Label>
                </div>
              </div>
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">פריטים</h3>
                  <Button onClick={addItem} size="sm" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    הוסף פריט
                  </Button>
                </div>

                {documentData.item.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">פריט {index + 1}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-500 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>מק"ט (אופציונלי)</Label>
                        <Input
                          value={item.catalog_number}
                          onChange={(e) => handleItemChange(index, "catalog_number", e.target.value)}
                          placeholder="מספר קטלוגי"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>סוג מע"מ</Label>
                        <Select
                          value={item.vat_type}
                          onValueChange={(value) => handleItemChange(index, "vat_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`בחר סוג מע"מ`} />
                          </SelectTrigger>
                          <SelectContent>
                            {VAT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <Label className="text-red-500 after:content-['*'] after:mr-1">תיאור הפריט</Label>
                      <Input
                        value={item.details}
                        onChange={(e) => handleItemChange(index, "details", e.target.value)}
                        placeholder="תיאור הפריט"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-red-500 after:content-['*'] after:mr-1">מחיר</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, "price", e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>כמות</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.amount}
                          onChange={(e) => handleItemChange(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-4 text-right">
                      <div className="text-sm text-gray-500">סה"כ: ₪{(item.price * item.amount).toFixed(2)}</div>
                    </div>
                  </Card>
                ))}

                <div className="flex justify-end">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-lg font-bold">סה"כ לתשלום: ₪{documentData.price_total.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">אמצעי תשלום</h3>
                  <Button onClick={addPayment} size="sm" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    הוסף אמצעי תשלום
                  </Button>
                </div>

                {documentData.payment.map((payment, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium flex items-center">
                        {renderPaymentIcon(payment.payment_type)}
                        <span className="mr-2">אמצעי תשלום {index + 1}</span>
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePayment(index)}
                        className="text-red-500 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>סוג תשלום</Label>
                        <Select
                          value={payment.payment_type}
                          onValueChange={(value) => handlePaymentChange(index, "payment_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="בחר סוג תשלום" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>סכום</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={payment.payment_sum}
                          onChange={(e) => handlePaymentChange(index, "payment_sum", e.target.value)}
                        />
                      </div>
                    </div>

                    {renderPaymentFields(payment, index)}
                  </Card>
                ))}

                <div className="flex justify-end">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-lg font-bold">
                      סה"כ שולם: ₪
                      {documentData.payment.reduce((sum, payment) => sum + (payment.payment_sum || 0), 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">הגדרות API</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="developer-email" className="text-red-500 after:content-['*'] after:mr-1">
                    אימייל מפתח
                  </Label>
                  <Input
                    id="developer-email"
                    value={documentData.developer_email}
                    onChange={(e) => handleDocumentChange("developer_email", e.target.value)}
                    placeholder="developer@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-key" className="text-red-500 after:content-['*'] after:mr-1">
                    מפתח API
                  </Label>
                  <Input
                    id="api-key"
                    type="password"
                    value={documentData.api_key}
                    onChange={(e) => handleDocumentChange("api_key", e.target.value)}
                    placeholder="מפתח API של HYP"
                    required
                  />
                </div>

                <Button onClick={saveCredentials} variant="outline" className="mt-2">
                  שמור פרטי התחברות
                </Button>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-4">הגדרות מסמך</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lang">שפה</Label>
                      <Select
                        value={documentData.lang}
                        onValueChange={(value) => handleDocumentChange("lang", value)}
                      >
                        <SelectTrigger id="lang">
                          <SelectValue placeholder="בחר שפה" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="he">עברית</SelectItem>
                          <SelectItem value="en">אנגלית</SelectItem>
                          <SelectItem value="ar">ערבית</SelectItem>
                          <SelectItem value="ru">רוסית</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paper-type">סוג נייר</Label>
                      <Select
                        value={documentData.paper_type}
                        onValueChange={(value) => handleDocumentChange("paper_type", value)}
                      >
                        <SelectTrigger id="paper-type">
                          <SelectValue placeholder="בחר סוג נייר" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="A5">A5</SelectItem>
                          <SelectItem value="Letter">Letter</SelectItem>
                          <SelectItem value="A4-2">A4 (2 per page)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse mt-4">
                    <Switch
                      id="force-items"
                      checked={documentData.forceItems === 1}
                      onCheckedChange={(checked) => handleDocumentChange("forceItems", checked ? 1 : 0)}
                    />
                    <Label htmlFor="force-items">הכרח פריטים</Label>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse mt-2">
                    <Switch
                      id="show-items-including-vat"
                      checked={documentData.show_items_including_vat === 1}
                      onCheckedChange={(checked) => handleDocumentChange("show_items_including_vat", checked ? 1 : 0)}
                    />
                    <Label htmlFor="show-items-including-vat">הצג פריטים כולל מע"מ</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            {documentUrl && (
              <TabsContent value="preview" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">תצוגה מקדימה של המסמך</h3>
                    <Button onClick={() => window.open(documentUrl, "_blank")} className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      פתח בחלון חדש
                    </Button>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <iframe src={documentUrl} width="100%" height="600" frameBorder="0" />
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            חזור
          </Button>
          <Button onClick={createDocument} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            צור מסמך
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
