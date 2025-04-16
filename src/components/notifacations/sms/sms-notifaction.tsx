import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { sendSms } from '@/services/SMS-Serivce';
import { Loader2, Send } from 'lucide-react';

interface SmsNotificationProps {
  recipientPhone?: string;
  defaultMessage?: string;
  onSent?: (result: { success: boolean; message: string }) => void;
}

export function SmsNotification({ recipientPhone = '', defaultMessage = '', onSent }: SmsNotificationProps) {
  const [phone, setPhone] = useState(recipientPhone);
  const [message, setMessage] = useState(defaultMessage);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!phone || !message) {
      toast.error('Please provide both phone number and message');
      return;
    }

    try {
      setSending(true);
      const result = await sendSms({
        to: phone,
        message: message
      });

      if (result.success) {
        toast.success('SMS sent successfully!');
      } else {
        toast.error(`Failed to send SMS: ${result.message}`);
      }

      if (onSent) {
        onSent(result);
      }
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      toast.error(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Recipient Phone Number
        </label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+972xxxxxxxxx"
          disabled={sending}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message here..."
          rows={4}
          disabled={sending}
        />
      </div>
      
      <Button onClick={handleSend} disabled={sending} className="w-full">
        {sending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send SMS
          </>
        )}
      </Button>
    </div>
  );
}