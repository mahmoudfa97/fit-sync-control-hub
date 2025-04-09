
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addAccessCard, revokeAccess, reactivateAccess } from "@/store/slices/accessControlSlice";
import { accessLevels } from "@/components/members/MembershipTypes";

export default function AccessControl() {
  const dispatch = useAppDispatch();
  const { accessCards } = useAppSelector((state) => state.accessControl);
  const { members } = useAppSelector((state) => state.members);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    memberId: "",
    cardNumber: "",
    accessLevel: "standard" as "standard" | "premium" | "vip" | "staff",
    isActive: true,
  });
  
  const filteredCards = accessCards.filter(
    (card) =>
      card.cardNumber.includes(searchTerm) ||
      members.find((m) => m.id === card.memberId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddCard = () => {
    if (!newCard.memberId || !newCard.cardNumber) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    
    const member = members.find((m) => m.id === newCard.memberId);
    if (!member) {
      toast.error("العضو غير موجود");
      return;
    }
    
    const cardExists = accessCards.some(
      (card) => card.cardNumber === newCard.cardNumber
    );
    if (cardExists) {
      toast.error("رقم البطاقة مستخدم بالفعل");
      return;
    }
    
    dispatch(
      addAccessCard({
        id: `card-${Date.now()}`,
        memberId: newCard.memberId,
        cardNumber: newCard.cardNumber,
        accessLevel: newCard.accessLevel,
        isActive: newCard.isActive,
        issueDate: new Date().toISOString(),
      })
    );
    
    toast.success("تمت إضافة بطاقة الوصول بنجاح");
    setNewCard({
      memberId: "",
      cardNumber: "",
      accessLevel: "standard",
      isActive: true,
    });
    setAddCardOpen(false);
  };
  
  const getMemberName = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    return member ? member.name : "غير معروف";
  };
  
  const handleRevokeAccess = (cardId: string) => {
    dispatch(revokeAccess(cardId));
    toast.success("تم إلغاء الوصول بنجاح");
  };
  
  const handleReactivateAccess = (cardId: string) => {
    dispatch(reactivateAccess(cardId));
    toast.success("تم إعادة تفعيل الوصول بنجاح");
  };
  
  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">التحكم بالوصول</h1>
          <p className="text-muted-foreground">
            إدارة بطاقات الوصول وأذونات الدخول للصالة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث عن بطاقة أو عضو..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddCardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة بطاقة وصول
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بطاقات الوصول</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم البطاقة</TableHead>
                <TableHead>اسم العضو</TableHead>
                <TableHead>مستوى الوصول</TableHead>
                <TableHead>تاريخ الإصدار</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">{card.cardNumber}</TableCell>
                    <TableCell>{getMemberName(card.memberId)}</TableCell>
                    <TableCell>
                      {card.accessLevel === "standard" && "قياسي"}
                      {card.accessLevel === "premium" && "متميز"}
                      {card.accessLevel === "vip" && "كبار الشخصيات"}
                      {card.accessLevel === "staff" && "موظف"}
                    </TableCell>
                    <TableCell>
                      {new Date(card.issueDate).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      {card.isActive ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500">
                          نشط
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500">
                          ملغي
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {card.isActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleRevokeAccess(card.id)}
                        >
                          إلغاء الوصول
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReactivateAccess(card.id)}
                        >
                          إعادة تفعيل
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    لم يتم العثور على بطاقات وصول.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>إضافة بطاقة وصول جديدة</DialogTitle>
            <DialogDescription>
              أدخل معلومات بطاقة الوصول للعضو.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="memberId">العضو</Label>
              <Select
                value={newCard.memberId}
                onValueChange={(value) => setNewCard({ ...newCard, memberId: value })}
              >
                <SelectTrigger id="memberId">
                  <SelectValue placeholder="اختر العضو" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cardNumber">رقم البطاقة</Label>
              <Input
                id="cardNumber"
                placeholder="أدخل رقم البطاقة"
                value={newCard.cardNumber}
                onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accessLevel">مستوى الوصول</Label>
              <Select
                value={newCard.accessLevel}
                onValueChange={(value: "standard" | "premium" | "vip" | "staff") => 
                  setNewCard({ ...newCard, accessLevel: value })}
              >
                <SelectTrigger id="accessLevel">
                  <SelectValue placeholder="اختر مستوى الوصول" />
                </SelectTrigger>
                <SelectContent>
                  {accessLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">نشط</Label>
              <Switch
                id="isActive"
                checked={newCard.isActive}
                onCheckedChange={(checked) => setNewCard({ ...newCard, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCardOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddCard}>إضافة البطاقة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
