import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTopNav from '@/components/admin/AdminTopNav';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ScrollToTop from '@/components/common/ScrollToTop';
import { ADMIN_LAYOUT_METADATA } from '@/constants/adminMeta';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export const metadata: Metadata = ADMIN_LAYOUT_METADATA;

async function requireAdminAccess() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) notFound();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== 'admin') notFound();
}

async function AdminContent({ children }: { children: React.ReactNode }) {
  await requireAdminAccess();

  return <>{children}</>;
}

function AdminContentLoading() {
  return <LoadingSpinner className="min-h-[calc(100vh-7rem)]" />;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-page">
      <AdminTopNav />
      <main className="flex justify-center pt-16">
        <div className="w-full max-w-7xl">
          <AdminHeader />
          <Suspense fallback={<AdminContentLoading />}>
            <AdminContent>{children}</AdminContent>
          </Suspense>
        </div>
      </main>
      <ScrollToTop />
    </div>
  );
}
