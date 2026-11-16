import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/useAuth";
import { Button } from "@/components/ui/button";

export default function AccountRecovery() {
  const { initializationError, retryInitialization } = useAuth();
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#060a12] px-4 text-white">
      <section className="w-full max-w-md border border-white/20 p-6" aria-labelledby="account-recovery-title">
        <h1 id="account-recovery-title" className="text-xl font-semibold">Account temporarily unavailable</h1>
        <p role="alert" className="mt-3 text-sm leading-6 text-white/80">{initializationError}</p>
        <p className="mt-2 text-sm leading-6 text-white/70">Your work has not been changed. Retry to restore access to your workspace.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={retryInitialization}>Retry account loading</Button>
          <Button variant="outline" asChild><Link to="/">Return to home</Link></Button>
        </div>
      </section>
    </main>
  );
}
