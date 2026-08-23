import { useEffect, useState } from "react";

import { Activity, CheckCircle2, Flame, Loader2, Shield } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getDashboardStats } from "@/api/dashboard.api";

interface DashboardStats {
  totalCreated: number;
  totalBurned: number;
  totalExpired: number;
  currentlyAlive: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboardStats();

      setStats(response.data);
    } catch (error) {
      console.error("Dashboard fetch failed:", error);

      setError("Unable to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDashboard();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#080808] text-white">
      {/* Background glow */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/[0.025] blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-16">
        {/* Header */}

        <div className="mb-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]">
              <Shield className="h-5 w-5 text-zinc-300" strokeWidth={1.5} />
            </div>

            <span className="text-sm font-medium tracking-widest text-zinc-500">
              VANISH
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Overview of your secret note activity.
          </p>
        </div>

        {/* Loading */}

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin" />

              <span>Loading statistics...</span>
            </div>
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <Card className="border-red-500/20 bg-red-500/[0.03] text-white">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <Activity className="h-6 w-6 text-red-400" />
              </div>

              <p className="text-sm text-red-400">{error}</p>

              <button
                onClick={fetchDashboard}
                className="mt-4 text-sm text-zinc-400 underline underline-offset-4 hover:text-white"
              >
                Try again
              </button>
            </CardContent>
          </Card>
        )}

        {/* Dashboard */}

        {!loading && !error && stats && (
          <>
            {/* Main statistics */}

            <div className="grid gap-4 md:grid-cols-3">
              {/* Created */}

              <Card className="border-white/10 bg-[#111111] text-white shadow-xl shadow-black/20">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-500">
                    Total Created
                  </CardTitle>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05]">
                    <Activity className="h-4 w-4 text-zinc-400" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-4xl font-semibold tracking-tight">
                    {stats.totalCreated}
                  </div>

                  <p className="mt-2 text-xs text-zinc-600">Notes created</p>
                </CardContent>
              </Card>

              {/* Burned */}

              <Card className="border-white/10 bg-[#111111] text-white shadow-xl shadow-black/20">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-500">
                    Total Burned
                  </CardTitle>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
                    <Flame className="h-4 w-4 text-orange-400" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-4xl font-semibold tracking-tight">
                    {stats.totalBurned}
                  </div>

                  <p className="mt-2 text-xs text-zinc-600">
                    Notes revealed and destroyed
                  </p>
                </CardContent>
              </Card>

              {/* Alive */}

              <Card className="border-white/10 bg-[#111111] text-white shadow-xl shadow-black/20">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-500">
                    Currently Alive
                  </CardTitle>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-4xl font-semibold tracking-tight">
                    {stats.currentlyAlive}
                  </div>

                  <p className="mt-2 text-xs text-zinc-600">
                    Notes waiting to be revealed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Secondary information */}

            <Card className="mt-6 border-white/10 bg-[#111111] text-white">
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Activity Overview
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-zinc-600">Created</p>

                    <p className="mt-1 text-lg font-medium">
                      {stats.totalCreated}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-600">Burned</p>

                    <p className="mt-1 text-lg font-medium">
                      {stats.totalBurned}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-600">Expired</p>

                    <p className="mt-1 text-lg font-medium">
                      {stats.totalExpired}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer */}

        <footer className="mt-12 text-center">
          <p className="text-xs tracking-widest text-zinc-700">
            VANISH • ONE-TIME SECRET SHARING
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
