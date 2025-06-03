
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { format } from 'date-fns';

export function SubscriptionStatus() {
  const { currentOrganization } = useOrganization();

  if (!currentOrganization) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'trial': return 'bg-blue-500';
      case 'past_due': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-gray-500';
      case 'premium': return 'bg-purple-500';
      case 'enterprise': return 'bg-gold-500';
      default: return 'bg-gray-500';
    }
  };

  const isTrialExpiringSoon = () => {
    if (currentOrganization.subscription_status !== 'trial') return false;
    const trialEnd = new Date(currentOrganization.trial_ends_at);
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 3;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Subscription</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(currentOrganization.subscription_status)}>
              {currentOrganization.subscription_status.charAt(0).toUpperCase() + 
               currentOrganization.subscription_status.slice(1)}
            </Badge>
            <Badge variant="outline" className={getTierColor(currentOrganization.subscription_tier)}>
              {currentOrganization.subscription_tier.charAt(0).toUpperCase() + 
               currentOrganization.subscription_tier.slice(1)}
            </Badge>
          </div>

          {currentOrganization.subscription_status === 'trial' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Trial ends: {format(new Date(currentOrganization.trial_ends_at), 'MMM dd, yyyy')}</span>
              </div>
              
              {isTrialExpiringSoon() && (
                <div className="flex items-center gap-2 text-sm text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Trial expiring soon!</span>
                </div>
              )}
              
              <Button size="sm" className="w-full">
                Upgrade to Pro
              </Button>
            </div>
          )}

          {currentOrganization.subscription_status === 'active' && (
            <div className="text-sm text-green-600">
              ✓ Active subscription
            </div>
          )}

          {(currentOrganization.subscription_status === 'past_due' || 
            currentOrganization.subscription_status === 'canceled') && (
            <div className="space-y-2">
              <div className="text-sm text-red-600">
                ⚠ Payment required
              </div>
              <Button size="sm" variant="destructive" className="w-full">
                Update Payment
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
