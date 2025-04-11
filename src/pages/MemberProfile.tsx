
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Edit, 
  Search, 
  Plus, 
  Trash, 
  Play, 
  Pause, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  Phone, 
  CalendarCheck,
  CreditCard,
  History,
  FileText,
  MessageCircle,
  Settings,
  Archive,
  ChevronDown
} from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { t } from "@/utils/translations";

export default function MemberProfile() {
  const { memberId } = useParams();
  const { members } = useAppSelector(state => state.members);
  const member = members.find(m => m.id === memberId);
  
  const [activeTab, setActiveTab] = useState("details");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // If member not found, show error state
  if (!member) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center p-12">
          <h2 className="text-2xl font-bold mb-4">לקוח לא נמצא</h2>
          <p className="text-muted-foreground mb-6">המזהה שביקשת לא נמצא במערכת</p>
          <Button asChild>
            <Link to="/members">חזרה לרשימת הלקוחות</Link>
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const lastCheckInDate = member.lastCheckIn === "טרם נרשם" 
    ? null 
    : member.lastCheckIn.startsWith("היום") 
      ? new Date().toISOString() 
      : new Date().toISOString();
  
  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/members" className="text-muted-foreground hover:text-foreground mr-2">
            ראשי / 
          </Link>
          <span>פרופיל לקוח</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar with member info */}
        <div className="col-span-1">
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="w-28 h-28 mb-4">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xl">{member.initials}</AvatarFallback>
                </Avatar>
                
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-2xl font-bold">{member.name}</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 w-full mt-2">
                  <div className="flex items-center">
                    <span className="text-muted-foreground">גיל:</span>
                    <span className="mr-2">30</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                    <span className="text-primary" dir="ltr">{member.phone || "052-3939093"}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-muted-foreground">יתרה:</span>
                    <span className="mr-2 text-emerald-500 font-medium">20000 ₪</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-muted-foreground">כניסה אחרונה:</span>
                    <span className="mr-2">12:05, 11/04/2025</span>
                  </div>
                </div>
                
                <Button className="mt-6 w-full">
                  שלח הודעה
                </Button>
                
                <div className="grid grid-cols-2 gap-3 mt-4 w-full">
                  <Button variant="outline" className="flex gap-2">
                    <MessageCircle className="h-4 w-4" />
                    הוספת פרטים
                  </Button>
                  
                  <Button variant="outline" className="flex gap-2">
                    <CreditCard className="h-4 w-4" />
                    טיפול בחיוב
                  </Button>
                  
                  <Button variant="outline" className="w-full col-span-2 flex gap-2">
                    <History className="h-4 w-4" />
                    טיפול בלקוח
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Sidebar navigation */}
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="#" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>הגדרות</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="#" className="flex items-center">
                <MessageCircle className="mr-2 h-4 w-4" />
                <span>הודעות</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="#" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span>קבוצת מנויים</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="#" className="flex items-center">
                <History className="mr-2 h-4 w-4" />
                <span>חזרות</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="#" className="flex items-center">
                <Archive className="mr-2 h-4 w-4" />
                <span>ארכיון</span>
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="#" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>הגדרות</span>
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="col-span-1 md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start mb-6 overflow-x-auto">
              <TabsTrigger value="details" className="flex gap-2">
                <FileText className="h-4 w-4" />
                פרטים
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex gap-2">
                <CalendarCheck className="h-4 w-4" />
                נוכחות
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex gap-2">
                <CreditCard className="h-4 w-4" />
                תשלומים
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex gap-2">
                <MessageCircle className="h-4 w-4" />
                הודעות
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex gap-2">
                <FileText className="h-4 w-4" />
                מסמכים
              </TabsTrigger>
              <TabsTrigger value="history" className="flex gap-2">
                <History className="h-4 w-4" />
                היסטוריית פניות
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between mb-6">
                    <div className="flex gap-2">
                      <Button variant="default" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        מנוי חדש
                      </Button>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="חיפוש במנויים..."
                        className="pl-10 w-[250px]"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-full">
                        מנויים פעילים
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        מנויים לא פעילים
                      </Button>
                    </div>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>כניסות</TableHead>
                        <TableHead>עד תאריך</TableHead>
                        <TableHead>מתאריך</TableHead>
                        <TableHead>קבוצה</TableHead>
                        <TableHead>סטטוס</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>פעיל</TableCell>
                        <TableCell>22/12/2024</TableCell>
                        <TableCell>22/12/2025</TableCell>
                        <TableCell>תשלומים</TableCell>
                        <TableCell>
                          <span className="text-emerald-500 font-medium">פעיל</span>
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      סך הכל שורות: 1-1 מתוך 1
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 min-w-[2rem] px-2"
                      >
                        {page}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(p => p + 1)}
                        disabled={true}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPage(10)}
                        disabled={true}
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                      
                      <select
                        className="h-8 rounded-md border border-input bg-background px-3"
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                      >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="30">30</option>
                        <option value="40">40</option>
                        <option value="50">50</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="attendance">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">רשימת נוכחות</h3>
                  <p className="text-muted-foreground">כאן יוצגו נתוני הנוכחות של הלקוח</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">היסטוריית תשלומים</h3>
                  <p className="text-muted-foreground">כאן יוצגו נתוני התשלומים של הלקוח</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">הודעות</h3>
                  <p className="text-muted-foreground">כאן יוצגו ההודעות שנשלחו ללקוח</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">מסמכים</h3>
                  <p className="text-muted-foreground">כאן יוצגו המסמכים של הלקוח</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium mb-4">היסטוריית פניות</h3>
                  <p className="text-muted-foreground">כאן תוצג היסטוריית הפניות של הלקוח</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardShell>
  );
}
