import { Dashboard } from "@/components/dashboard/Dashboard";
import { getDashboardData } from "@/lib/queries";

// The dashboard's data depends on a live DB read on every request, so it
// must never be statically generated at build time.
export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const initialData = await getDashboardData();
    return <Dashboard initialData={initialData} />;
  } catch (error) {
    console.error("Failed to load initial dashboard data:", error);
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md rounded-xl border border-card-border bg-card p-6 text-center">
          <h1 className="text-lg font-semibold text-text-primary">
            Could not connect to the database
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Check that{" "}
            <code className="rounded bg-white/5 px-1 py-0.5 text-accent-amber">
              DATABASE_URL
            </code>{" "}
            is set correctly in your environment variables.
          </p>
          {process.env.NODE_ENV !== "production" && error instanceof Error && (
            <p className="mt-3 rounded-md bg-black/40 p-2 text-left text-xs text-accent-red">
              {error.message}
            </p>
          )}
        </div>
      </div>
    );
  }
}
