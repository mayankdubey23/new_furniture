import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import CushionBackdrop from '@/components/decor/CushionBackdrop';

export const metadata = {
  title: 'Login | Luxe Decor',
  description: 'Sign in to your Luxe Decor account or create a new one.',
};

function LoginSkeleton() {
  return (
    <div className="relative z-10 mx-auto max-w-md">
      <div className="mb-8 text-center">
        <div className="inline-block font-display text-[2.2rem] font-semibold tracking-[0.18em] text-theme-ink dark:text-theme-ivory">
          LUXE
        </div>
        <div className="mt-4 h-10 w-48 mx-auto rounded bg-theme-ivory/20 animate-pulse" />
      </div>

      <div className="rounded-[2rem] border border-theme-line/50 bg-white/80 p-8 dark:bg-white/5">
        <div className="h-32 rounded-lg bg-theme-ivory/20 animate-pulse" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-transparent px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <CushionBackdrop variant="auth" className="-z-10" />


      <div className="pointer-events-none absolute left-[-8rem] top-[4rem] h-[28rem] w-[28rem] rounded-full bg-theme-bronze/18 blur-[130px]" />
      <div className="pointer-events-none absolute right-[-6rem] top-[10rem] h-[24rem] w-[24rem] rounded-full bg-theme-olive/12 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[16rem] w-[32rem] -translate-x-1/2 rounded-full bg-theme-sand/30 blur-[100px]" />

      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
