import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { useGetAllBroadcasts, useSendBroadcastNotification } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Bell, Send, Loader2, Megaphone } from 'lucide-react';
import { formatDate } from '../lib/appUtils';

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'All Users' },
  { value: 'customers', label: 'Customers Only' },
  { value: 'shop_owners', label: 'Shop Owners Only' },
];

const AUDIENCE_COLORS: Record<string, string> = {
  all: 'bg-blue-100 text-blue-700 border-blue-200',
  customers: 'bg-violet-100 text-violet-700 border-violet-200',
  shop_owners: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

function NotificationsContent() {
  const { data: broadcasts, isLoading } = useGetAllBroadcasts();
  const sendBroadcast = useSendBroadcastNotification();

  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');

  const sorted = broadcasts
    ? [...broadcasts].sort((a, b) => Number(b.sentAt) - Number(a.sentAt))
    : [];

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    try {
      await sendBroadcast.mutateAsync({ message: message.trim(), targetAudience: audience });
      toast.success('Notification sent successfully');
      setMessage('');
    } catch {
      toast.error('Failed to send notification');
    }
  };

  const truncateMsg = (msg: string, maxLen = 80) =>
    msg.length > maxLen ? `${msg.slice(0, maxLen)}…` : msg;

  const getAudienceLabel = (val: string) =>
    AUDIENCE_OPTIONS.find((o) => o.value === val)?.label ?? val;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Notifications</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Send broadcast messages to your users</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            Send Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs mb-1.5 block">Target Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUDIENCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1.5 block">
              Message{' '}
              <span className="text-muted-foreground">({message.length}/500)</span>
            </Label>
            <Textarea
              placeholder="Type your broadcast message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              className="resize-none min-h-[100px]"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={sendBroadcast.isPending || !message.trim()}
            className="gap-2"
          >
            {sendBroadcast.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {sendBroadcast.isPending ? 'Sending...' : 'Send Notification'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Broadcast History ({broadcasts?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No broadcasts sent yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead className="hidden md:table-cell">Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((b) => (
                  <TableRow key={b.id.toString()} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="text-sm max-w-xs">
                      <span title={b.message}>{truncateMsg(b.message)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${AUDIENCE_COLORS[b.targetAudience] ?? 'bg-muted text-muted-foreground'}`}
                      >
                        {getAudienceLabel(b.targetAudience)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {formatDate(b.sentAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminNotificationsPage() {
  return (
    <AdminLayout>
      <NotificationsContent />
    </AdminLayout>
  );
}
