'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ApplicationStatus } from '@prisma/client';
import { format } from 'date-fns';
import { Mail, RefreshCw, Loader2 } from 'lucide-react';

interface Application {
  id: string;
  createdAt: Date;
  projectSlug: string;
  companyName: string;
  companyEmail: string;
  status: ApplicationStatus;
  confirmedAt: Date | null;
  forwardedAt: Date | null;
}

interface AdminApplicationsClientProps {
  applications: Application[];
  adminKey: string;
}

export function AdminApplicationsClient({
  applications,
  adminKey,
}: AdminApplicationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get('status') || 'all'
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get('search') || ''
  );

  const updateFilters = () => {
    const params = new URLSearchParams();
    params.set('key', adminKey);
    if (statusFilter && statusFilter !== 'all') {
      params.set('status', statusFilter);
    }
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    startTransition(() => {
      router.push(`/admin/applications?${params.toString()}`);
    });
  };

  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResendConfirmation = async (applicationId: string) => {
    setResendingId(applicationId);
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/resend-confirmation?key=${adminKey}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        alert('Confirmation email sent successfully');
        router.refresh();
      } else {
        alert(`Error: ${data.error || 'Failed to send email'}`);
      }
    } catch (error) {
      alert('Error sending confirmation email');
    } finally {
      setResendingId(null);
    }
  };

  const handleResendForward = async (applicationId: string) => {
    setResendingId(applicationId);
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/resend-forward?key=${adminKey}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        alert('Forward email sent successfully');
        router.refresh();
      } else {
        alert(`Error: ${data.error || 'Failed to send email'}`);
      }
    } catch (error) {
      alert('Error sending forward email');
    } finally {
      setResendingId(null);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const variants: Record<ApplicationStatus, 'default' | 'secondary' | 'outline'> = {
      pending_confirmation: 'outline',
      confirmed: 'secondary',
      forwarded: 'default',
    };
    return (
      <Badge variant={variants[status]}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin: Project Applications</h1>
        <p className="text-muted-foreground">
          View and manage project applications ({applications.length} shown)
        </p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by email or project slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateFilters();
              }
            }}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_confirmation">Pending Confirmation</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="forwarded">Forwarded</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={updateFilters} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            'Apply Filters'
          )}
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Confirmed</TableHead>
              <TableHead>Forwarded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No applications found
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    {format(new Date(app.createdAt), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium">{app.projectSlug}</TableCell>
                  <TableCell>{app.companyName}</TableCell>
                  <TableCell>{app.companyEmail}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell>
                    {app.confirmedAt
                      ? format(new Date(app.confirmedAt), 'MMM d, yyyy HH:mm')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {app.forwardedAt
                      ? format(new Date(app.forwardedAt), 'MMM d, yyyy HH:mm')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {app.status === 'pending_confirmation' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendConfirmation(app.id)}
                          disabled={resendingId === app.id}
                        >
                          {resendingId === app.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-1" />
                              Resend Confirmation
                            </>
                          )}
                        </Button>
                      )}
                      {app.status === 'confirmed' && !app.forwardedAt && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendForward(app.id)}
                          disabled={resendingId === app.id}
                        >
                          {resendingId === app.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Resend Forward
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
