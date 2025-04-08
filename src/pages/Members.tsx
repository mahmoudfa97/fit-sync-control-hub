
import { useState } from "react";
import { 
  CalendarClock,
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search,
  UserPlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Badge
} from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  id: string;
  name: string;
  email: string;
  membershipType: string;
  status: "active" | "inactive" | "pending" | "expired";
  joinDate: string;
  lastCheckIn: string;
  paymentStatus: "paid" | "overdue" | "pending";
  initials: string;
  avatar?: string;
}

const members: Member[] = [
  {
    id: "1",
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    membershipType: "Premium",
    status: "active",
    joinDate: "Jan 5, 2024",
    lastCheckIn: "Today at 8:45 AM",
    paymentStatus: "paid",
    initials: "EW"
  },
  {
    id: "2",
    name: "Marcus Johnson",
    email: "marcus.j@example.com",
    membershipType: "Standard",
    status: "active",
    joinDate: "Feb 12, 2024",
    lastCheckIn: "Today at 7:30 AM",
    paymentStatus: "paid",
    initials: "MJ"
  },
  {
    id: "3",
    name: "Sophie Chen",
    email: "sophie.c@example.com",
    membershipType: "Premium",
    status: "active",
    joinDate: "Nov 8, 2023",
    lastCheckIn: "Yesterday at 6:15 PM",
    paymentStatus: "paid",
    initials: "SC"
  },
  {
    id: "4",
    name: "David Miller",
    email: "david.m@example.com",
    membershipType: "Standard",
    status: "inactive",
    joinDate: "Mar 21, 2023",
    lastCheckIn: "Apr 2, 2025",
    paymentStatus: "overdue",
    initials: "DM"
  },
  {
    id: "5",
    name: "Jessica Thompson",
    email: "jessica.t@example.com",
    membershipType: "Premium Plus",
    status: "active",
    joinDate: "Dec 3, 2023",
    lastCheckIn: "Today at 10:20 AM",
    paymentStatus: "paid",
    initials: "JT"
  },
  {
    id: "6",
    name: "Michael Wong",
    email: "michael.w@example.com",
    membershipType: "Monthly",
    status: "active",
    joinDate: "Feb 18, 2024",
    lastCheckIn: "Yesterday at 8:00 PM",
    paymentStatus: "pending",
    initials: "MW"
  },
  {
    id: "7",
    name: "Sarah Davis",
    email: "sarah.d@example.com",
    membershipType: "Annual",
    status: "expired",
    joinDate: "Apr 5, 2023",
    lastCheckIn: "Mar 20, 2024",
    paymentStatus: "overdue",
    initials: "SD"
  },
];

const statusStyles = {
  active: "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500",
  expired: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500",
};

const paymentStatusStyles = {
  paid: "text-green-600",
  overdue: "text-red-600",
  pending: "text-amber-600",
};

export default function Members() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            Manage and track your gym members.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem>Active members</DropdownMenuItem>
                <DropdownMenuItem>Inactive members</DropdownMenuItem>
                <DropdownMenuItem>Expired memberships</DropdownMenuItem>
                <DropdownMenuItem>Payments overdue</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Member Directory</CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  All Members
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Members</DropdownMenuItem>
                <DropdownMenuItem>Active Members</DropdownMenuItem>
                <DropdownMenuItem>Inactive Members</DropdownMenuItem>
                <DropdownMenuItem>Expired Memberships</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
              <span className="sr-only">Download CSV</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Member</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Check-in</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{member.membershipType}</span>
                        <span className="text-xs text-muted-foreground">Since {member.joinDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[member.status]}>
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{member.lastCheckIn}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${paymentStatusStyles[member.paymentStatus]}`}>
                        {member.paymentStatus.charAt(0).toUpperCase() + member.paymentStatus.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Actions <ChevronDown className="ml-1 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Member</DropdownMenuItem>
                          <DropdownMenuItem>Check In</DropdownMenuItem>
                          <DropdownMenuItem>Manage Plan</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
