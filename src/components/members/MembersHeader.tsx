
import React from "react";
import { 
  UserPlus, 
  Filter, 
  Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MembersHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onFilterChange: (status: string | null) => void;
  onAddMemberClick: () => void;
}

export const MembersHeader = ({
  searchTerm,
  onSearchChange,
  onFilterChange,
  onAddMemberClick,
}: MembersHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">الأعضاء</h1>
        <p className="text-muted-foreground">
          إدارة ومتابعة أعضاء صالتك الرياضية.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="البحث في الأعضاء..."
            className="pl-8 w-full md:w-[300px]"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">فلترة</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
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
              <DropdownMenuItem onClick={() => onFilterChange("pending")}>
                العضويات المعلقة
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onAddMemberClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          إضافة عضو
        </Button>
      </div>
    </div>
  );
};
