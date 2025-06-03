
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  subscription_status: 'trial' | 'active' | 'canceled' | 'past_due';
  subscription_tier: 'basic' | 'premium' | 'enterprise';
  trial_ends_at: string;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  userOrganizations: Organization[];
  switchOrganization: (orgId: string) => void;
  createOrganization: (name: string, slug: string) => Promise<string>;
  updateOrganization: (updates: Partial<Organization>) => Promise<void>;
  loading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadUserOrganizations();
    } else {
      setCurrentOrganization(null);
      setUserOrganizations([]);
      setLoading(false);
    }
  }, [session]);

  const loadUserOrganizations = async () => {
    try {
      setLoading(true);
      
      // Get user's organizations
      const { data: orgUsers, error } = await supabase
        .from('organization_users')
        .select(`
          organization_id,
          role,
          organizations (
            id,
            name,
            slug,
            logo_url,
            subscription_status,
            subscription_tier,
            trial_ends_at
          )
        `)
        .eq('user_id', session?.user.id);

      if (error) throw error;

      const organizations = orgUsers?.map(ou => ou.organizations).filter(Boolean) as Organization[] || [];
      setUserOrganizations(organizations);

      // Set current organization (first one or from localStorage)
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      const currentOrg = savedOrgId 
        ? organizations.find(org => org.id === savedOrgId) 
        : organizations[0];
      
      if (currentOrg) {
        setCurrentOrganization(currentOrg);
        localStorage.setItem('currentOrganizationId', currentOrg.id);
      }
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = (orgId: string) => {
    const org = userOrganizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem('currentOrganizationId', orgId);
    }
  };

  const createOrganization = async (name: string, slug: string): Promise<string> => {
    if (!session?.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('create_organization_with_owner', {
        org_name: name,
        org_slug: slug,
        user_id: session.user.id
      });

    if (error) throw error;

    await loadUserOrganizations();
    return data;
  };

  const updateOrganization = async (updates: Partial<Organization>) => {
    if (!currentOrganization) return;

    const { error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', currentOrganization.id);

    if (error) throw error;

    setCurrentOrganization({ ...currentOrganization, ...updates });
    await loadUserOrganizations();
  };

  return (
    <OrganizationContext.Provider value={{
      currentOrganization,
      userOrganizations,
      switchOrganization,
      createOrganization,
      updateOrganization,
      loading
    }}>
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider');
  }
  return context;
};
