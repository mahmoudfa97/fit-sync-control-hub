
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { WhatsAppConfigService, WhatsAppConfig } from '@/services/WhatsAppConfigService';
import { toast } from 'sonner';

export function WhatsAppSettings() {
  const { currentOrganization } = useOrganization();
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [formData, setFormData] = useState({
    phone_number_id: '',
    access_token: '',
    business_account_id: '',
    webhook_verify_token: '',
    is_active: false
  });

  useEffect(() => {
    if (currentOrganization) {
      loadConfig();
    }
  }, [currentOrganization]);

  const loadConfig = async () => {
    if (!currentOrganization) return;
    
    try {
      setLoading(true);
      const configData = await WhatsAppConfigService.getConfig(currentOrganization.id);
      
      if (configData) {
        setConfig(configData);
        setFormData({
          phone_number_id: configData.phone_number_id || '',
          access_token: configData.access_token || '',
          business_account_id: configData.business_account_id || '',
          webhook_verify_token: configData.webhook_verify_token || '',
          is_active: configData.is_active
        });
      }
    } catch (error) {
      console.error('Error loading WhatsApp config:', error);
      toast.error('Failed to load WhatsApp configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentOrganization) return;

    try {
      setSaving(true);
      await WhatsAppConfigService.saveConfig(currentOrganization.id, formData);
      toast.success('WhatsApp configuration saved successfully');
      await loadConfig();
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      toast.error('Failed to save WhatsApp configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!currentOrganization) return;

    try {
      setTesting(true);
      const success = await WhatsAppConfigService.testConnection(currentOrganization.id);
      
      if (success) {
        toast.success('WhatsApp connection test successful');
      } else {
        toast.error('WhatsApp connection test failed');
      }
    } catch (error) {
      console.error('Error testing WhatsApp connection:', error);
      toast.error('Failed to test WhatsApp connection');
    } finally {
      setTesting(false);
    }
  };

  const handleToggleActive = async (active: boolean) => {
    if (!currentOrganization) return;

    try {
      if (active) {
        await WhatsAppConfigService.activateConfig(currentOrganization.id);
      } else {
        await WhatsAppConfigService.deactivateConfig(currentOrganization.id);
      }
      
      setFormData(prev => ({ ...prev, is_active: active }));
      toast.success(`WhatsApp integration ${active ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling WhatsApp config:', error);
      toast.error('Failed to update WhatsApp integration status');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          WhatsApp Configuration
          {config?.is_active ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary">
              <XCircle className="h-3 w-3 mr-1" />
              Inactive
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone-number-id">Phone Number ID</Label>
            <Input
              id="phone-number-id"
              value={formData.phone_number_id}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_number_id: e.target.value }))}
              placeholder="Enter your WhatsApp Phone Number ID"
            />
          </div>

          <div>
            <Label htmlFor="access-token">Access Token</Label>
            <Input
              id="access-token"
              type="password"
              value={formData.access_token}
              onChange={(e) => setFormData(prev => ({ ...prev, access_token: e.target.value }))}
              placeholder="Enter your WhatsApp Access Token"
            />
          </div>

          <div>
            <Label htmlFor="business-account-id">Business Account ID</Label>
            <Input
              id="business-account-id"
              value={formData.business_account_id}
              onChange={(e) => setFormData(prev => ({ ...prev, business_account_id: e.target.value }))}
              placeholder="Enter your WhatsApp Business Account ID"
            />
          </div>

          <div>
            <Label htmlFor="webhook-verify-token">Webhook Verify Token</Label>
            <Input
              id="webhook-verify-token"
              value={formData.webhook_verify_token}
              onChange={(e) => setFormData(prev => ({ ...prev, webhook_verify_token: e.target.value }))}
              placeholder="Enter your Webhook Verify Token"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is-active"
              checked={formData.is_active}
              onCheckedChange={handleToggleActive}
            />
            <Label htmlFor="is-active">Enable WhatsApp Integration</Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Configuration
          </Button>
          
          <Button variant="outline" onClick={handleTest} disabled={testing || !formData.access_token}>
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Test Connection
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>To set up WhatsApp Business API:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Create a WhatsApp Business Account</li>
            <li>Get your Phone Number ID from Meta Business</li>
            <li>Generate an Access Token</li>
            <li>Configure webhook settings</li>
            <li>Test the connection above</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
