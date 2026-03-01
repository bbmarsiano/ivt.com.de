import { validateAdminKey } from '@/lib/env.server';
import { prisma } from '@/lib/db/prisma';
import { AdminApplicationsClient } from '@/components/admin/AdminApplicationsClient';
import { ApplicationStatus, Prisma } from '@prisma/client';

interface PageProps {
  searchParams: Promise<{
    key?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function AdminApplicationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const providedKey = params.key;

  // Validate admin key server-side
  if (!validateAdminKey(providedKey)) {
    // Return 404 to not reveal the admin page exists
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">404</h1>
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </div>
    );
  }

  // Parse filters
  const statusFilter =
    params.status && ['pending_confirmation', 'confirmed', 'forwarded'].includes(params.status)
      ? (params.status as ApplicationStatus)
      : undefined;
  const searchQuery = params.search?.trim() || '';

  // Build where clause
  const where: Prisma.ProjectApplicationWhereInput = {};

  if (statusFilter) {
    where.status = statusFilter;
  }

  if (searchQuery) {
    where.OR = [
      { companyEmail: { contains: searchQuery, mode: 'insensitive' as const } },
      { projectSlug: { contains: searchQuery, mode: 'insensitive' as const } },
    ];
  }

  // Fetch applications (last 50)
  const applications = await prisma.projectApplication.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      createdAt: true,
      projectSlug: true,
      companyName: true,
      companyEmail: true,
      status: true,
      confirmedAt: true,
      forwardedAt: true,
    },
  });

  return <AdminApplicationsClient applications={applications} adminKey={providedKey || ''} />;
}
