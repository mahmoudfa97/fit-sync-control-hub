
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Plus, Search, Send, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

interface Message {
  id: string;
  member_id: string;
  subject: string;
  content: string;
  message_type: string;
  is_read: boolean;
  sent_at: string;
  sent_by: string;
  organization_id: string;
}

interface Member {
  id: string;
  name: string;
  last_name?: string;
  email?: string;
}

export default function MessagesCenter() {
  const { currentOrganization, loading: orgLoading } = useOrganization();
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    member_id: "",
    subject: "",
    content: "",
    message_type: "notification"
  });

  useEffect(() => {
    if (currentOrganization && !orgLoading) {
      loadMessages();
      loadMembers();
    }
  }, [currentOrganization, orgLoading]);

  const loadMessages = async () => {
    if (!currentOrganization) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("שגיאה בטעינת ההודעות");
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from("custom_members")
        .select("id, name, last_name, email")
        .eq("organization_id", currentOrganization.id)
        .order("name");

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error loading members:", error);
      toast.error("שגיאה בטעינת החברים");
    }
  };

  const handleSendMessage = async () => {
    if (!currentOrganization || !newMessage.member_id || !newMessage.content) {
      toast.error("יש למלא את כל השדות הנדרשים");
      return;
    }

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          ...newMessage,
          organization_id: currentOrganization.id,
          sent_by: "admin" // This should be replaced with actual user ID
        });

      if (error) throw error;

      toast.success("ההודעה נשלחה בהצלחה");
      setIsNewMessageOpen(false);
      setNewMessage({
        member_id: "",
        subject: "",
        content: "",
        message_type: "notification"
      });
      loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("שגיאה בשליחת ההודעה");
    }
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? `${member.name} ${member.last_name || ""}` : "לא ידוע";
  };

  const filteredMessages = messages.filter(message =>
    getMemberName(message.member_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (orgLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">טוען ארגון...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!currentOrganization) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">לא נבחר ארגון</h3>
            <p className="text-muted-foreground">יש לבחור ארגון כדי לצפות בהודעות</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">מרכז הודעות</h1>
            <p className="text-muted-foreground">נהל הודעות לחברים</p>
          </div>
          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                הודעה חדשה
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>הודעה חדשה</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="member">חבר</Label>
                  <Select value={newMessage.member_id} onValueChange={(value) => setNewMessage({...newMessage, member_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="בחר חבר" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {`${member.name} ${member.last_name || ""}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">נושא</Label>
                  <Input
                    id="subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    placeholder="נושא ההודעה"
                  />
                </div>
                <div>
                  <Label htmlFor="content">תוכן</Label>
                  <Textarea
                    id="content"
                    value={newMessage.content}
                    onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                    placeholder="תוכן ההודעה"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="type">סוג הודעה</Label>
                  <Select value={newMessage.message_type} onValueChange={(value) => setNewMessage({...newMessage, message_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="notification">הודעה</SelectItem>
                      <SelectItem value="reminder">תזכורת</SelectItem>
                      <SelectItem value="alert">אזהרה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSendMessage} className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  שלח הודעה
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="חפש הודעות..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>הודעות</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">אין הודעות להצגה</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{getMemberName(message.member_id)}</h3>
                        <Badge variant={message.is_read ? "default" : "destructive"}>
                          {message.is_read ? "נקרא" : "לא נקרא"}
                        </Badge>
                        <Badge variant="outline">{message.message_type}</Badge>
                      </div>
                      {message.subject && (
                        <p className="font-medium text-sm mb-1">{message.subject}</p>
                      )}
                      <p className="text-sm text-muted-foreground mb-2">{message.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(message.sent_at).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
