
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Loader2,
  Send,
  MessageSquare,
  LayoutTemplateIcon as Template,
  CheckCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Filter,
  Users,
  UserCheck,
  UserX,
  UserIcon as Male,
  UserIcon as Female,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { WhatsAppService } from "@/services/WhatsAppService"
import { useOrganization } from "@/contexts/OrganizationContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Member {
  id: string
  name: string
  phone: string
  email?: string
  gender?: "גברים" | "נשים" | "other" | null
  group?: string
  last_visit?: string
  membership?: {
    group_name: string
    start_date: string
    end_date: string
    is_active: boolean
  }
}

interface TemplateMessage {
  id: string
  name: string
  status: "approved" | "pending" | "rejected"
  category: string
  components: any[]
  language: string
}

interface FilterOptions {
  status: "all" | "active" | "inactive"
  gender: "all" | "גברים" | "נשים"
  group: string
}

export default function WhatsAppMessaging() {
  const { toast } = useToast()
  const { currentOrganization } = useOrganization()
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [messageType, setMessageType] = useState<"direct" | "template">("direct")
  const [directMessage, setDirectMessage] = useState("")
  const [templates, setTemplates] = useState<TemplateMessage[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [messageStatus, setMessageStatus] = useState<Record<string, "pending" | "sent" | "failed">>({})
  const [activeTab, setActiveTab] = useState("compose")
  const [availableGroups, setAvailableGroups] = useState<string[]>([])
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: "all",
    gender: "all",
    group: "all",
  })

  // Fetch members and templates on component mount
  useEffect(() => {
    if (currentOrganization) {
      fetchMembers()
      fetchTemplates()
    }
  }, [currentOrganization])

  // Apply filters and search to members
  useEffect(() => {
    let filtered = [...members]

    // Apply gender filter
    if (filterOptions.gender !== "all") {
      filtered = filtered.filter((member) => member.gender === filterOptions.gender)
    }

    // Apply group filter
    if (filterOptions.group !== "all") {
      filtered = filtered.filter((member) => member.group === filterOptions.group)
    }

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.phone.includes(searchQuery) ||
          (member.email && member.email.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredMembers(filtered)

    // Update selectAll state based on filtered members
    if (filtered.length > 0 && selectedMembers.length > 0) {
      const allFilteredSelected = filtered.every((member) => selectedMembers.includes(member.id))
      setSelectAll(allFilteredSelected)
    } else {
      setSelectAll(false)
    }
  }, [searchQuery, members, filterOptions, selectedMembers])

  // Handle select all checkbox
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredIds = filteredMembers.map((member) => member.id)
      setSelectedMembers((prev) => {
        const combined = [...prev]
        filteredIds.forEach((id) => {
          if (!combined.includes(id)) {
            combined.push(id)
          }
        })
        return combined
      })
      setSelectAll(true)
    } else {
      const filteredIds = filteredMembers.map((member) => member.id)
      setSelectedMembers((prev) => prev.filter((id) => !filteredIds.includes(id)))
      setSelectAll(false)
    }
  }

  // Fetch members from database
  const fetchMembers = async () => {
    if (!currentOrganization) return;
    
    try {
      setIsLoading(true)
      const { data: membersData, error: membersError } = await supabase
        .from("custom_members")
        .select("id, name, phone, last_name")
        .eq("organization_id", currentOrganization.id)
        .order("name")

      if (membersError) {
        throw membersError
      }

      const { data: membershipsData, error: membershipsError } = await supabase
        .from("custom_memberships")
        .select("member_id, membership_type, start_date, end_date")
        .eq("organization_id", currentOrganization.id)

      if (membershipsError) {
        throw membershipsError
      }

      const membershipsByMemberId = membershipsData.reduce((acc, membership) => {
        acc[membership.member_id] = {
          group_name: membership.membership_type,
          start_date: membership.start_date,
          end_date: membership.end_date,
          is_active: new Date(membership.end_date) >= new Date(),
        }
        return acc
      }, {})

      const validMembers = membersData
        .filter((member) => member.phone && member.phone.trim() !== "")
        .map((member) => ({
          ...member,
          group: membershipsByMemberId[member.id]?.group_name || null,
          membership: membershipsByMemberId[member.id] || null,
        }))

      const groups = Array.from(new Set(validMembers.map((member) => member.group).filter(Boolean))) as string[]
      setAvailableGroups(groups)

      setMembers(validMembers)
      setFilteredMembers(validMembers)
    } catch (error) {
      console.error("Error fetching members:", error)
      toast({
        title: "שגיאה בטעינת חברים",
        description: "לא ניתן לטעון את רשימת החברים. נסה שנית מאוחר יותר.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch WhatsApp templates
  const fetchTemplates = async () => {
    if (!currentOrganization) return;
    
    try {
      const templates = await WhatsAppService.getTemplates(currentOrganization.id)
      setTemplates(templates)
      if (templates.length > 0) {
        setSelectedTemplate(templates[0].id)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast({
        title: "שגיאה בטעינת תבניות",
        description: "לא ניתן לטעון את תבניות ההודעות. נסה שנית מאוחר יותר.",
        variant: "destructive",
      })
    }
  }

  // Toggle member selection
  const toggleMemberSelection = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId))
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    setTemplateVariables({})
  }

  // Update template variable
  const updateTemplateVariable = (key: string, value: string) => {
    setTemplateVariables({
      ...templateVariables,
      [key]: value,
    })
  }

  // Reset all filters
  const resetFilters = () => {
    setFilterOptions({
      status: "all",
      gender: "all",
      group: "all",
    })
    setSearchQuery("")
  }

  // Get template variable fields based on selected template
  const getTemplateVariableFields = () => {
    const template = templates.find((t) => t.id === selectedTemplate)
    if (!template) return null

    const variables: { key: string; example: string }[] = []
    template.components?.forEach((component) => {
      if (component.type === "BODY" || component.type === "HEADER") {
        component.example?.variables?.forEach((variable: string, index: number) => {
          variables.push({
            key: `${component.type.toLowerCase()}_${index}`,
            example: variable,
          })
        })
      }
    })

    if (variables.length === 0) return <p className="text-sm text-gray-500">תבנית זו אינה מכילה משתנים.</p>

    return (
      <div className="space-y-4 mt-4">
        <h3 className="text-sm font-medium">משתני תבנית:</h3>
        {variables.map((variable) => (
          <div key={variable.key} className="space-y-2">
            <Label htmlFor={variable.key}>
              משתנה {variable.key} <span className="text-gray-500 text-xs">(לדוגמה: {variable.example})</span>
            </Label>
            <Input
              id={variable.key}
              value={templateVariables[variable.key] || ""}
              onChange={(e) => updateTemplateVariable(variable.key, e.target.value)}
              placeholder={variable.example}
            />
          </div>
        ))}
      </div>
    )
  }

  // Send messages to selected members
  const sendMessages = async () => {
    if (!currentOrganization) return;
    
    if (selectedMembers.length === 0) {
      toast({
        title: "לא נבחרו חברים",
        description: "אנא בחר לפחות חבר אחד לשליחת ההודעה.",
        variant: "destructive",
      })
      return
    }

    if (messageType === "direct" && !directMessage.trim()) {
      toast({
        title: "הודעה ריקה",
        description: "אנא הזן הודעה לשליחה.",
        variant: "destructive",
      })
      return
    }

    if (messageType === "template" && !selectedTemplate) {
      toast({
        title: "לא נבחרה תבנית",
        description: "אנא בחר תבנית הודעה.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSending(true)
      const selectedMembersList = members.filter((member) => selectedMembers.includes(member.id))

      const initialStatus: Record<string, "pending" | "sent" | "failed"> = {}
      selectedMembersList.forEach((member) => {
        initialStatus[member.id] = "pending"
      })
      setMessageStatus(initialStatus)

      setActiveTab("status")

      for (const member of selectedMembersList) {
        try {
          if (messageType === "direct") {
            await WhatsAppService.sendDirectMessage(currentOrganization.id, member.phone, directMessage)
          } else {
            await WhatsAppService.sendTemplateMessage(currentOrganization.id, member.phone, selectedTemplate, templateVariables)
          }

          setMessageStatus((prev) => ({
            ...prev,
            [member.id]: "sent",
          }))
        } catch (error) {
          console.error(`Error sending message to ${member.name}:`, error)

          setMessageStatus((prev) => ({
            ...prev,
            [member.id]: "failed",
          }))
        }

        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      toast({
        title: "הודעות נשלחו",
        description: `נשלחו הודעות ל-${selectedMembersList.length} חברים.`,
      })
    } catch (error) {
      console.error("Error sending messages:", error)
      toast({
        title: "שגיאה בשליחת הודעות",
        description: "אירעה שגיאה בעת שליחת ההודעות. נסה שנית מאוחר יותר.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Get status icon based on message status
  const getStatusIcon = (status: "pending" | "sent" | "failed") => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
    }
  }

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0
    if (filterOptions.status !== "all") count++
    if (filterOptions.gender !== "all") count++
    if (filterOptions.group !== "all") count++
    return count
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>שליחת הודעות WhatsApp</CardTitle>
          <CardDescription>שלח הודעות WhatsApp לחברי המועדון</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose">חיבור הודעה</TabsTrigger>
              <TabsTrigger value="status">סטטוס שליחה</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-6">
              {/* Member Selection Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">בחירת נמענים</h3>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Filter className="h-4 w-4 mr-2" />
                          סינון
                          {getActiveFilterCount() > 0 && (
                            <Badge className="ml-2 bg-primary text-primary-foreground">{getActiveFilterCount()}</Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>סינון חברים</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                            סטטוס
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setFilterOptions({ ...filterOptions, status: "all" })}
                            className={filterOptions.status === "all" ? "bg-accent" : ""}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            הכל
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterOptions({ ...filterOptions, status: "active" })}
                            className={filterOptions.status === "active" ? "bg-accent" : ""}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            פעילים
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterOptions({ ...filterOptions, status: "inactive" })}
                            className={filterOptions.status === "inactive" ? "bg-accent" : ""}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            לא פעילים
                          </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                            מגדר
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setFilterOptions({ ...filterOptions, gender: "all" })}
                            className={filterOptions.gender === "all" ? "bg-accent" : ""}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            הכל
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterOptions({ ...filterOptions, gender: "גברים" })}
                            className={filterOptions.gender === "גברים" ? "bg-accent" : ""}
                          >
                            <Male className="h-4 w-4 mr-2" />
                            גברים
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setFilterOptions({ ...filterOptions, gender: "נשים" })}
                            className={filterOptions.gender === "נשים" ? "bg-accent" : ""}
                          >
                            <Female className="h-4 w-4 mr-2" />
                            נשים
                          </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                            קבוצה
                          </DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => setFilterOptions({ ...filterOptions, group: "all" })}
                            className={filterOptions.group === "all" ? "bg-accent" : ""}
                          >
                            <Users className="h-4 w-4 mr-2" />
                            כל הקבוצות
                          </DropdownMenuItem>

                          {availableGroups.map((group) => (
                            <DropdownMenuItem
                              key={group}
                              onClick={() => setFilterOptions({ ...filterOptions, group })}
                              className={filterOptions.group === group ? "bg-accent" : ""}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              {group}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <Button variant="ghost" size="sm" className="w-full justify-center" onClick={resetFilters}>
                          נקה סינון
                        </Button>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" size="sm" onClick={fetchMembers} disabled={isLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                      רענן
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="חפש לפי שם, טלפון או אימייל..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {getActiveFilterCount() > 0 && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm text-muted-foreground">מסננים פעילים:</span>

                    {filterOptions.status !== "all" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {filterOptions.status === "active" ? "פעילים" : "לא פעילים"}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => setFilterOptions({ ...filterOptions, status: "all" })}
                        >
                          ✕
                        </Button>
                      </Badge>
                    )}

                    {filterOptions.gender !== "all" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {filterOptions.gender === "גברים" ? "גברים" : "נשים"}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => setFilterOptions({ ...filterOptions, gender: "all" })}
                        >
                          ✕
                        </Button>
                      </Badge>
                    )}

                    {filterOptions.group !== "all" && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        {filterOptions.group}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => setFilterOptions({ ...filterOptions, group: "all" })}
                        >
                          ✕
                        </Button>
                      </Badge>
                    )}

                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={resetFilters}>
                      נקה הכל
                    </Button>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox id="select-all" checked={selectAll} onCheckedChange={handleSelectAll} />
                  <Label htmlFor="select-all">בחר הכל ({filteredMembers.length})</Label>
                  <Badge variant="outline" className="mr-auto">
                    {selectedMembers.length} נבחרו
                  </Badge>
                </div>

                <Card>
                  <ScrollArea className="h-[300px] rounded-md border">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-4">
                        <p className="text-gray-500">לא נמצאו חברים</p>
                      </div>
                    ) : (
                      <div className="p-4 space-y-2">
                        {filteredMembers.map((member) => (
                          <div key={member.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md">
                            <Checkbox
                              id={`member-${member.id}`}
                              checked={selectedMembers.includes(member.id)}
                              onCheckedChange={() => toggleMemberSelection(member.id)}
                            />
                            <div className="flex-1">
                              <Label htmlFor={`member-${member.id}`} className="font-medium cursor-pointer">
                                {member.name}
                              </Label>
                              <div className="flex items-center gap-2">
                                <div className="text-sm text-gray-500">{member.phone}</div>
                                {member.gender && (
                                  <Badge variant="outline" className="text-xs">
                                    {member.gender === "גברים" ? "גבר" : member.gender === "נשים" ? "אישה" : "אחר"}
                                  </Badge>
                                )}
                                {member.group && (
                                  <Badge variant="outline" className="text-xs">
                                    {member.group}
                                  </Badge>
                                )}
                                {member.membership && (
                                  <Badge
                                    variant={member.membership.is_active ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {member.membership.is_active ? "מנוי פעיל" : "מנוי לא פעיל"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </Card>
              </div>

              {/* Message Composition Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">סוג הודעה</h3>

                <RadioGroup
                  value={messageType}
                  onValueChange={(value) => setMessageType(value as "direct" | "template")}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="direct" />
                    <Label htmlFor="direct" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      הודעה ישירה
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="template" id="template" />
                    <Label htmlFor="template" className="flex items-center">
                      <Template className="h-4 w-4 mr-2" />
                      תבנית הודעה
                    </Label>
                  </div>
                </RadioGroup>

                {messageType === "direct" ? (
                  <div className="space-y-2">
                    <Label htmlFor="direct-message">הודעה</Label>
                    <Textarea
                      id="direct-message"
                      placeholder="הזן את ההודעה שברצונך לשלוח..."
                      value={directMessage}
                      onChange={(e) => setDirectMessage(e.target.value)}
                      rows={5}
                    />
                    <p className="text-sm text-gray-500">
                      הערה: הודעות ישירות יכולות להישלח רק אם הלקוח כבר יצר קשר עם המספר העסקי שלך ב-24 השעות האחרונות,
                      או אם הלקוח הוסיף את המספר העסקי שלך לאנשי הקשר שלו.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-select">בחר תבנית</Label>
                      <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                        <SelectTrigger id="template-select">
                          <SelectValue placeholder="בחר תבנית הודעה" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name} ({template.language})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {getTemplateVariableFields()}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="status">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">סטטוס שליחת הודעות</h3>

                {Object.keys(messageStatus).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">לא נשלחו הודעות עדיין</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] rounded-md border">
                    <div className="p-4 space-y-2">
                      {members
                        .filter((member) => messageStatus[member.id])
                        .map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.phone}</div>
                            </div>
                            <div className="flex items-center">
                              {getStatusIcon(messageStatus[member.id])}
                              <span className="ml-2">
                                {messageStatus[member.id] === "sent"
                                  ? "נשלח"
                                  : messageStatus[member.id] === "failed"
                                    ? "נכשל"
                                    : "בתהליך"}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setSelectedMembers([])}>
            נקה בחירה
          </Button>
          <Button onClick={sendMessages} disabled={isSending || selectedMembers.length === 0}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            שלח הודעות ({selectedMembers.length})
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
