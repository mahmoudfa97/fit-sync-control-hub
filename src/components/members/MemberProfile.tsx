import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, CreditCard, Edit, User, UserPlus } from "lucide-react";
import { MemberProfileActions } from "./MemberProfileActions";
import { MemberSubscriptions } from "./MemberSubscriptions";
import { MemberPayments } from "./MemberPayments";
import { MemberCheckins } from "./MemberCheckins";
import { MemberEditForm } from "./MemberEditForm";
import { useToast } from "@/hooks/use-toast";
import { MemberService } from "@/services/MemberService";

interface Member {
  id: string;
  name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  created_at?: string;
  status?: string;
  membership_status?: string;
  membership_type?: string;
  membership_end_date?: string;
  last_checkin?: string;
  [key: string]: any;
}

interface MemberProfileProps {
  member: Member;
}

export function MemberProfile({ member }: MemberProfileProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState(member);
  const [activeTab, setActiveTab] = useState("profile");

  // Handle member update
  const handleUpdateMember = async (updatedData: Partial<Member>) => {
    try {
      await MemberService.updateMember(member.id, updatedData);
      setEditedMember({ ...editedMember, ...updatedData });
      setIsEditing(false);
      toast({
        title: "פרטי חבר עודכנו",
        description: "פרטי החבר עודכנו בהצלחה",
      });
    } catch (error) {
      console.error('Error updating member:', error);
      toast({
        title: "שגיאה בעדכון פרטי חבר",
        description: "לא ניתן לעדכן את פרטי החבר. נסה שנית.",
        variant: "destructive",
      });
    }
  };

  // Get membership status badge color
  const getMembershipStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "לא זמין";
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/members")}>
            <ArrowLeft className="h-4 w-4" />
            חזור לרשימת החברים
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{member.name} {member.last_name}</h1>
            <p className="text-muted-foreground">
              חבר מאז {new Date(member.created_at || Date.now()).toLocaleDateString('he-IL')}
            </p>
          </div>
        </div>
        <MemberProfileActions
          member={member}
          onEdit={() => setIsEditing(true)}
          onAddSubscription={() => {/* handler */}}
          onAddPayment={() => {/* handler */}}
          onCheckIn={() => {/* handler */}}
        />
      </div>

      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>עריכת פרטי חבר</CardTitle>
          </CardHeader>
          <CardContent>
            <MemberEditForm 
              member={member} 
              onSubmit={handleUpdateMember} 
              onCancel={() => setIsEditing(false)} 
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">פרופיל</TabsTrigger>
            <TabsTrigger value="subscriptions">מנויים</TabsTrigger>
            <TabsTrigger value="payments">תשלומים</TabsTrigger>
            <TabsTrigger value="checkins">כניסות</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  פרטי חבר
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">שם מלא</h3>
                      <p>{member.name} {member.last_name}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">אימייל</h3>
                      <p>{member.email || "לא הוזן"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">טלפון</h3>
                      <p>{member.phone || "לא הוזן"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">מגדר</h3>
                      <p>{member.gender || "לא הוזן"}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">סטטוס מנוי</h3>
                      <div className="mt-1">
                        <Badge className={getMembershipStatusColor(member.membership_status)}>
                          {member.membership_status || "לא ידוע"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">סוג מנוי</h3>
                      <p>{member.membership_type || "אין מנוי פעיל"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">תאריך סיום מנוי</h3>
                      <p>{formatDate(member.membership_end_date)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">כניסה אחרונה</h3>
                      <p>{formatDate(member.last_checkin)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Additional member details can be added here */}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <MemberSubscriptions memberId={member.id} />
          </TabsContent>
          
          <TabsContent value="payments">
            <MemberPayments memberId={member.id} />
          </TabsContent>
          
          <TabsContent value="checkins">
            <MemberCheckins memberId={member.id} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
