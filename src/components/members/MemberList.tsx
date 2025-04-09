
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Download } from "lucide-react";
import { MemberListRow } from "./MemberListRow";
import { Member } from "@/store/slices/membersSlice";

interface MemberListProps {
  members: Member[];
  onFilterChange: (status: string | null) => void;
  onCheckIn: (id: string) => void;
}

export const MemberList = ({ members, onFilterChange, onCheckIn }: MemberListProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>دليل الأعضاء</CardTitle>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                جميع الأعضاء
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onFilterChange(null)}>
                جميع الأعضاء
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("active")}>
                الأعضاء النشطين
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("inactive")}>
                الأعضاء غير النشطين
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onFilterChange("expired")}>
                العضويات المنتهية
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
            <span className="sr-only">تنزيل CSV</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">العضو</TableHead>
              <TableHead>العضوية</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>آخر تسجيل حضور</TableHead>
              <TableHead>الدفع</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length > 0 ? (
              members.map((member) => (
                <MemberListRow 
                  key={member.id} 
                  member={member} 
                  onCheckIn={onCheckIn}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  لم يتم العثور على أعضاء.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
