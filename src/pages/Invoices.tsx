
import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { t } from '@/utils/translations';
import { useAppSelector } from '@/hooks/redux';
import { generateInvoicePdf, generateReportPdf } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

const InvoiceCard = ({ title, onClick }: { title: string; onClick: () => void }) => {
  return (
    <Card className="h-40 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="flex items-center justify-center h-full">
        <span className="text-center font-medium text-lg">{title}</span>
      </CardContent>
    </Card>
  );
};

const Invoices = () => {
  const { toast } = useToast();
  const invoices = useAppSelector((state) => state.invoices.invoices);
  const members = useAppSelector((state) => state.members.members);
  const checkIns = useAppSelector((state) => state.checkIns.checkIns);
  const payments = useAppSelector((state) => state.payments.payments);
  
  // Helper function for PDF generation
  const handleGenerateReport = (reportType: string) => {
    try {
      switch (reportType) {
        case 'salaries':
          // Sample salary data
          const salaryData = [
            { id: '1', name: 'אחמד כהן', position: 'מאמן אישי', salary: '₪8,500', hours: '160' },
            { id: '2', name: 'שירה לוי', position: 'מנהלת', salary: '₪12,000', hours: '180' },
            { id: '3', name: 'יוסף אברהם', position: 'מאמן', salary: '₪7,200', hours: '140' },
          ];
          generateReportPdf(salaryData, ['id', 'name', 'position', 'salary', 'hours'], t('invoice_salaries_report'));
          break;
          
        case 'members':
          const memberData = members.map(m => ({
            id: m.id,
            name: m.name,
            membershipType: m.membershipType,
            status: m.status,
            joinDate: m.joinDate
          }));
          generateReportPdf(memberData, ['id', 'name', 'membershipType', 'status', 'joinDate'], t('invoice_members_heads'));
          break;
          
        case 'renewals':
          // Filter members who are close to renewal
          const renewalMembers = members
            .filter(m => new Date(m.membershipEndDate || '') < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
            .map(m => ({
              id: m.id,
              name: m.name,
              endDate: m.membershipEndDate || 'N/A',
              membershipType: m.membershipType,
              status: m.status
            }));
          generateReportPdf(renewalMembers, ['id', 'name', 'endDate', 'membershipType', 'status'], t('invoice_membership_renewal'));
          break;
          
        case 'income':
          const incomeData = payments.map(p => ({
            id: p.id,
            memberName: p.memberName,
            amount: `₪${p.amount}`,
            date: p.paymentDate,
            method: p.paymentMethod,
            status: p.status
          }));
          generateReportPdf(incomeData, ['id', 'memberName', 'amount', 'date', 'method', 'status'], t('invoice_member_income'));
          break;
          
        case 'checkins':
          const checkinData = checkIns.map(c => ({
            id: c.id,
            memberName: c.memberName,
            time: new Date(c.checkInTime).toLocaleString('he-IL'),
            notes: c.notes || ''
          }));
          generateReportPdf(checkinData, ['id', 'memberName', 'time', 'notes'], t('invoice_income_center'));
          break;
          
        case 'newMembers':
          // Filter members who joined recently (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          
          const newMembers = members
            .filter(m => {
              const joinDate = new Date(m.joinDate);
              return joinDate > thirtyDaysAgo;
            })
            .map(m => ({
              id: m.id,
              name: m.name,
              joinDate: m.joinDate,
              membershipType: m.membershipType,
              status: m.status
            }));
          generateReportPdf(newMembers, ['id', 'name', 'joinDate', 'membershipType', 'status'], t('invoice_new_members'));
          break;
          
        case 'announcements':
          // Sample announcements data
          const announcementsData = [
            { id: '1', title: 'שינוי בשעות פעילות', date: '15/04/2024', content: 'המרכז יפעל בשעות 06:00-22:00 בימי שישי' },
            { id: '2', title: 'הרצאה על תזונה', date: '20/04/2024', content: 'הרצאה בנושא תזונה ספורטיבית בשעה 18:00' },
            { id: '3', title: 'תחרות הרמת משקולות', date: '01/05/2024', content: 'פרטים נוספים בהמשך' },
          ];
          generateReportPdf(announcementsData, ['id', 'title', 'date', 'content'], t('invoice_announcements'));
          break;
          
        case 'inactiveMembers':
          // Sample inactive members data
          const inactiveMembers = members
            .filter(m => m.status === 'inactive')
            .map(m => ({
              id: m.id,
              name: m.name,
              lastSeen: m.lastCheckIn || 'N/A',
              membershipType: m.membershipType,
              joinDate: m.joinDate
            }));
          generateReportPdf(inactiveMembers, ['id', 'name', 'lastSeen', 'membershipType', 'joinDate'], t('invoice_no_payments'));
          break;
          
        case 'birthdays':
          // Sample birthday data
          const currentMonth = new Date().getMonth() + 1;
          const birthdaysData = [
            { id: '1', name: 'יעקב כהן', birthdate: '12/04/1985', age: '39', phone: '054-1234567' },
            { id: '2', name: 'רוני לוי', birthdate: '18/04/1990', age: '34', phone: '052-7654321' },
            { id: '3', name: 'מיכל דוד', birthdate: '25/04/1992', age: '32', phone: '053-9876543' },
          ];
          generateReportPdf(birthdaysData, ['id', 'name', 'birthdate', 'age', 'phone'], t('invoice_birth_date'));
          break;
          
        default:
          // Generate invoice PDF for the first invoice if none selected
          if (invoices.length > 0) {
            generateInvoicePdf(invoices[0], 'חשבונית');
          }
      }
      
      toast({
        title: "PDF נוצר בהצלחה",
        description: "הקובץ הורד למחשב שלך",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "שגיאה ביצירת ה-PDF",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardShell>
      <div className="container px-4 py-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t('invoices_title')}</h1>
          <Button onClick={() => handleGenerateReport('default')}>
            <Download className="mr-2 h-4 w-4" />
            {t('export_pdf')}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* General Reports Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">{t('invoices_general')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <InvoiceCard 
                title={t('invoice_salaries_report')} 
                onClick={() => handleGenerateReport('salaries')} 
              />
              <InvoiceCard 
                title={t('invoice_announcements')} 
                onClick={() => handleGenerateReport('announcements')} 
              />
              <InvoiceCard 
                title={t('invoice_no_payments')} 
                onClick={() => handleGenerateReport('inactiveMembers')} 
              />
              <InvoiceCard 
                title={t('invoice_birth_date')} 
                onClick={() => handleGenerateReport('birthdays')} 
              />
            </CardContent>
          </Card>

          {/* Member Reports Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-right">{t('invoices_members')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <InvoiceCard 
                title={t('invoice_members_heads')} 
                onClick={() => handleGenerateReport('members')} 
              />
              <InvoiceCard 
                title={t('invoice_membership_renewal')} 
                onClick={() => handleGenerateReport('renewals')} 
              />
              <InvoiceCard 
                title={t('invoice_member_income')} 
                onClick={() => handleGenerateReport('income')} 
              />
              <InvoiceCard 
                title={t('invoice_income_center')} 
                onClick={() => handleGenerateReport('checkins')} 
              />
              <InvoiceCard 
                title={t('invoice_new_members')} 
                onClick={() => handleGenerateReport('newMembers')} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
};

export default Invoices;
