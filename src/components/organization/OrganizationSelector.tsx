
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';

export function OrganizationSelector() {
  const { currentOrganization, userOrganizations, switchOrganization, loading } = useOrganization();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (userOrganizations.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm font-medium">{currentOrganization?.name}</span>
      </div>
    );
  }

  return (
    <Select
      value={currentOrganization?.id || ''}
      onValueChange={switchOrganization}
    >
      <SelectTrigger className="w-[200px]">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <SelectValue placeholder="Select organization" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {userOrganizations.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            <div className="flex flex-col">
              <span className="font-medium">{org.name}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {org.subscription_tier} • {org.subscription_status}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
