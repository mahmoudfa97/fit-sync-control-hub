
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
import { t } from "@/utils/translations";

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
      toast.error(t("fillRequired"));
      return;
    }
    
    const member = members.find((m) => m.id === newCard.memberId);
    if (!member) {
      toast.error(t("memberNotFound"));
      return;
    }
    
    const cardExists = accessCards.some(
      (card) => card.cardNumber === newCard.cardNumber
    );
    if (cardExists) {
      toast.error(t("cardAlreadyExists"));
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
    
    toast.success(t("accessCardAdded"));
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
    return member ? member.name : t("memberNotFound");
  };
  
  const handleRevokeAccess = (cardId: string) => {
    dispatch(revokeAccess(cardId));
    toast.success(t("accessRevoked"));
  };
  
  const handleReactivateAccess = (cardId: string) => {
    dispatch(reactivateAccess(cardId));
    toast.success(t("accessReactivated"));
  };
  
  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("accessControl")}</h1>
          <p className="text-muted-foreground">
            {t("accessControlDesc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchCardOrMember")}
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddCardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addAccessCard")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("accessCards")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("cardNumber")}</TableHead>
                <TableHead>{t("memberName")}</TableHead>
                <TableHead>{t("accessLevel")}</TableHead>
                <TableHead>{t("issueDate")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCards.length > 0 ? (
                filteredCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-medium">{card.cardNumber}</TableCell>
                    <TableCell>{getMemberName(card.memberId)}</TableCell>
                    <TableCell>
                      {t(card.accessLevel)}
                    </TableCell>
                    <TableCell>
                      {new Date(card.issueDate).toLocaleDateString("he-IL")}
                    </TableCell>
                    <TableCell>
                      {card.isActive ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500">
                          {t("active")}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500">
                          {t("inactive")}
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
                          {t("revokeAccess")}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReactivateAccess(card.id)}
                        >
                          {t("reactivate")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {t("noCheckIns")}
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
            <DialogTitle>{t("newAccessCard")}</DialogTitle>
            <DialogDescription>
              {t("newAccessCardDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="memberId">{t("memberName")}</Label>
              <Select
                value={newCard.memberId}
                onValueChange={(value) => setNewCard({ ...newCard, memberId: value })}
              >
                <SelectTrigger id="memberId">
                  <SelectValue placeholder={t("chooseMember")} />
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
              <Label htmlFor="cardNumber">{t("cardNumber")}</Label>
              <Input
                id="cardNumber"
                placeholder={t("cardNumber")}
                value={newCard.cardNumber}
                onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accessLevel">{t("accessLevel")}</Label>
              <Select
                value={newCard.accessLevel}
                onValueChange={(value: "standard" | "premium" | "vip" | "staff") => 
                  setNewCard({ ...newCard, accessLevel: value })}
              >
                <SelectTrigger id="accessLevel">
                  <SelectValue placeholder={t("chooseLevel")} />
                </SelectTrigger>
                <SelectContent>
                  {accessLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {t(level.value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">{t("isActive")}</Label>
              <Switch
                id="isActive"
                checked={newCard.isActive}
                onCheckedChange={(checked) => setNewCard({ ...newCard, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCardOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleAddCard}>{t("addCard")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
