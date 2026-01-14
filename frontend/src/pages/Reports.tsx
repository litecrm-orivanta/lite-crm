import { useEffect, useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { getAnalytics, getPipelineMetrics, getActivityTrends, getUserPerformance } from "@/api/reports";

export default function Reports() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [pipeline, setPipeline] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [userPerformance, setUserPerformance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [analyticsData, pipelineData, trendsData, performanceData] = await Promise.all([
        getAnalytics(),
        getPipelineMetrics(),
        getActivityTrends(30),
        getUserPerformance(),
      ]);
      setAnalytics(analyticsData);
      setPipeline(pipelineData);
      setTrends(trendsData);
      setUserPerformance(performanceData);
    } catch (err: any) {
      console.error("Failed to load reports:", err);
      alert(`Failed to load reports: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-500">Loading reports...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600 mt-1">Insights into your sales pipeline and performance</p>
        </div>

        {/* Overview Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Leads"
              value={analytics.overview?.totalLeads || 0}
              gradient="from-blue-500 to-blue-600"
            />
            <StatCard
              title="Conversion Rate"
              value={`${(analytics.overview?.conversionRate || 0).toFixed(1)}%`}
              gradient="from-green-500 to-green-600"
            />
            <StatCard
              title="Avg Days in Pipeline"
              value={Math.round(analytics.overview?.avgTimeInStage || 0)}
              gradient="from-purple-500 to-purple-600"
            />
          </div>
        )}

        {/* Pipeline Metrics */}
        {pipeline && pipeline.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Pipeline by Stage</h2>
            <div className="space-y-3">
              {pipeline.map((item: any) => (
                <div key={item.stage} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{item.stage}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(item.count / (analytics?.overview?.totalLeads || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 w-12 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leads by Source */}
        {analytics?.leadsBySource && analytics.leadsBySource.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Leads by Source</h2>
            <div className="space-y-2">
              {analytics.leadsBySource.map((item: any) => (
                <div key={item.source} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{item.source || "Unknown"}</span>
                  <span className="text-sm font-medium text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Performance */}
        {userPerformance && userPerformance.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">User Performance</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 font-semibold text-slate-700">User</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Total Leads</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Won Leads</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {userPerformance.map((user: any) => (
                    <tr key={user.userId} className="border-b border-slate-100">
                      <td className="p-3 text-slate-900 font-medium">{user.name || user.email}</td>
                      <td className="p-3 text-slate-700">{user.totalLeads}</td>
                      <td className="p-3 text-slate-700">{user.wonLeads}</td>
                      <td className="p-3 text-slate-700">{user.conversionRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Trends */}
        {trends && trends.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Activity Trends (Last 30 Days)</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trends.map((item: any) => (
                <div key={item.date} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{new Date(item.date).toLocaleDateString()}</span>
                  <span className="text-sm font-medium text-slate-900">{item.count} activities</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ title, value, gradient }: { title: string; value: string | number; gradient: string }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white shadow-lg`}>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium opacity-90">{title}</div>
    </div>
  );
}
