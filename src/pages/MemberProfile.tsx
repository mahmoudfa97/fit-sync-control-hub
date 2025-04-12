
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppSelector } from "@/hooks/redux";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  Search, 
  Plus, 
  Clock,
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  Phone,
  CreditCard,
  RefreshCw,
  Edit,
  MessageSquare,
  CalendarClock,
  FileText,
  History,
  ClipboardList
} from "lucide-react";
import { t } from "@/utils/translations";

export default function MemberProfile() {
  const { memberId } = useParams();
  const { members } = useAppSelector(state => state.members);
  const member = members.find(m => m.id === memberId);
  
  const [activeTab, setActiveTab] = useState("memberships");
  const [currentFilter, setCurrentFilter] = useState("active"); // active or inactive
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
          <Link to="/members" className="text-muted-foreground hover:text-foreground ml-2">
            ראשי
          </Link>
          <span className="text-muted-foreground mx-2">/</span>
          <span>פרופיל לקוח</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main content area - 3 columns */}
        <div className="col-span-1 md:col-span-3">
          <Card className="mb-6">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start bg-white border-b rounded-none h-14 p-0 gap-8">
                  <TabsTrigger value="memberships" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      מנויים
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      תשלומים ומעקב
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      הודעות
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="checkins" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" />
                      היסטוריית כניסות
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      הנהלת חשבונות
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      היסטוריית פניות
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <Button variant="default" className="bg-primary text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      מנוי חדש
                    </Button>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="חיפוש במנויים..."
                        className="pl-10 w-[250px]"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <Button 
                        variant={currentFilter === "active" ? "default" : "outline"} 
                        size="sm" 
                        className="rounded-full"
                        onClick={() => setCurrentFilter("active")}
                      >
                        מנויים פעילים
                      </Button>
                      <Button 
                        variant={currentFilter === "inactive" ? "default" : "outline"} 
                        size="sm" 
                        className="rounded-full"
                        onClick={() => setCurrentFilter("inactive")}
                      >
                        מנויים לא פעילים
                      </Button>
                    </div>
                  </div>
                </div>
                
                <TabsContent value="memberships" className="mt-0 border-0 p-0 px-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-center">סטטוס</TableHead>
                        <TableHead className="text-center">עד תאריך</TableHead>
                        <TableHead className="text-center">מתאריך</TableHead>
                        <TableHead className="text-center">קבוצה</TableHead>
                        <TableHead className="text-center">כניסות</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentFilter === "active" ? (
                        <TableRow>
                          <TableCell className="text-center">
                            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-green-100 text-green-800">
                              פעיל
                            </span>
                          </TableCell>
                          <TableCell className="text-center">22/12/2024</TableCell>
                          <TableCell className="text-center">22/12/2023</TableCell>
                          <TableCell className="text-center">מנוי שנתי</TableCell>
                          <TableCell className="text-center">ללא הגבלה</TableCell>
                          <TableCell className="text-left">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                            אין נתונים בטבלה
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  
                  <div className="flex items-center justify-between my-4 pb-6">
                    <div className="text-sm text-muted-foreground">
                      סך הכל שורות: 0 מתוך 0
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
                </TabsContent>
                
                <TabsContent value="payments" className="mt-0 border-0 p-6">
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p>אין נתוני תשלומים להצגה</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="messages" className="mt-0 border-0 p-6">
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p>אין הודעות להצגה</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="checkins" className="mt-0 border-0 p-6">
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p>אין נתוני כניסות להצגה</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="mt-0 border-0 p-6">
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p>אין נתוני הנהלת חשבונות להצגה</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="profile" className="mt-0 border-0 p-6">
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <p>אין היסטוריית פניות להצגה</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Right sidebar - profile info */}
        <div className="col-span-1">
          <Card className="overflow-hidden">
            <div className="flex flex-col items-center bg-blue-50 p-6">
              <Avatar className="w-28 h-28 mb-4 bg-blue-100 border-4 border-white">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xl text-blue-500 bg-blue-100">
                  {member.name.split(' ').map(part => part[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-semibold mb-2 text-center">{member.name}</h2>
              
              <Button variant="default" className="w-full mt-4" size="sm">
                שלח הודעה
              </Button>
            </div>
            
            <CardContent className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">גיל:</span>
                    <span className="font-medium">2024</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center">
                      <Phone className="h-3.5 w-3.5 mr-1" />
                    </span>
                    <span className="font-medium" dir="ltr">{member.phone || "052-5603573"}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-medium text-muted-foreground">יתרה:</span>
                    <span className="font-medium text-green-600">0 ₪</span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm font-medium text-muted-foreground">כניסה אחרונה:</span>
                    <span className="font-medium text-sm">11:40 ,29/04/2022</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    הוספת כרטיס
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    טיפול באשראי
                  </Button>
                </div>
                
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  סנכרן ללקוח
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
