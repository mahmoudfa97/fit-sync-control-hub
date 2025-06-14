
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MemberService } from '@/services/MemberService';
import { MemberProfileActions } from './MemberProfileActions';
import { MemberProfileTabs } from './MemberProfileTabs';
import { ArrowLeft, Phone, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  created_at?: string;
  last_name?: string;
}

export function MemberProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMember(id);
    }
  }, [id]);

  const fetchMember = async (memberId: string) => {
    try {
      setIsLoading(true);
      const memberData = await MemberService.getMemberById(memberId);
      setMember(memberData);
    } catch (error) {
      console.error('Error fetching member:', error);
      toast.error('שגיאה בטעינת פרטי החבר');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (id) {
      fetchMember(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p>חבר לא נמצא</p>
          <Button onClick={() => navigate('/members')} className="mt-4">
            חזור לרשימת החברים
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/members')}
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          חזור
        </Button>
        <h1 className="text-2xl font-bold">פרופיל חבר</h1>
      </div>

      {/* Member Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {member.name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{member.name} {member.last_name}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {member.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {member.phone}
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {member.email}
                  </div>
                )}
                {member.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    הצטרף ב-{new Date(member.created_at).toLocaleDateString('he-IL')}
                  </div>
                )}
              </div>
            </div>
          </div>
          <MemberProfileActions
            memberId={member.id}
            memberName={member.name}
            memberEmail={member.email}
            memberPhone={member.phone}
            onRefresh={handleRefresh}
          />
        </CardHeader>
      </Card>

      {/* Tabs */}
      <MemberProfileTabs memberId={member.id} />
    </div>
  );
}

export default MemberProfile;
