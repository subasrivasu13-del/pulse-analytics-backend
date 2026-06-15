import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import KpiCard from '../components/KpiCard';
import { 
  Users, 
  UserCheck, 
  Eye, 
  Activity, 
  Clock, 
  CalendarDays, 
  RefreshCw, 
  TrendingUp,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [visitorsData, setVisitorsData] = useState([]);
  const [pageviewsData, setPageviewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setError(null);
    try {
      const [overviewRes, visitorsRes, pageviewsRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/visitors'),
        api.get('/analytics/pageviews')
      ]);

      setOverview(overviewRes.data);
      setVisitorsData(visitorsRes.data);
      setPageviewsData(pageviewsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError('Failed to fetch analytics metrics. Please ensure backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Color palette for Route Bar Chart
  const BAR_COLORS = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6'];

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <main className="app-main flex-center">
          <div className="spinner-large"></div>
          <p className="mt-4 text-muted">Retrieving real-time aggregate metrics...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="app-main">
        <header className="main-header">
          <div className="header-title">
            <h2 className="page-heading">Analytics Dashboard</h2>
            <p className="sub-heading">Real-time visitor counts, traffic metrics, and activity logs</p>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
            title="Refresh Metrics"
          >
            <RefreshCw size={16} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </header>

        {error && (
          <div className="error-banner">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {overview && (
          <section className="kpi-grid">
            <KpiCard 
              title="Total Visitors" 
              value={overview.totalVisitors} 
              icon={Users} 
              trend="+4.2% from last week" 
              trendType="up"
              colorClass="kpi-primary"
            />
            <KpiCard 
              title="Unique Visitors" 
              value={overview.uniqueVisitors} 
              icon={UserCheck} 
              trend="+8.5% from last week" 
              trendType="up"
              colorClass="kpi-success"
            />
            <KpiCard 
              title="Page Views" 
              value={overview.pageViews} 
              icon={Eye} 
              trend="+14.3% from last week" 
              trendType="up"
              colorClass="kpi-info"
            />
            <KpiCard 
              title="Sessions" 
              value={overview.sessions} 
              icon={Activity} 
              trend="+3.1% from last week" 
              trendType="up"
              colorClass="kpi-warning"
            />
            <KpiCard 
              title="Active Users Today" 
              value={overview.activeUsersToday} 
              icon={Clock} 
              trend="Current 24h window" 
              trendType="neutral"
              colorClass="kpi-danger"
            />
            <KpiCard 
              title="Active Users This Week" 
              value={overview.activeUsersThisWeek} 
              icon={CalendarDays} 
              trend="Current 7-day window" 
              trendType="neutral"
              colorClass="kpi-purple"
            />
          </section>
        )}

        <section className="charts-grid">
          {/* Visitors Over Time Line Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title-group">
                <TrendingUp size={18} className="text-primary" />
                <h4>Visitors Over Time</h4>
              </div>
              <span className="chart-subtitle">Daily unique visitors over the last 7 days</span>
            </div>
            <div className="chart-body">
              {visitorsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={visitorsData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: '#94a3b8', fontSize: 11 }} 
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 11 }} 
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        fontSize: '12px',
                        color: '#1e293b'
                      }}
                      itemStyle={{ color: '#6366f1', fontWeight: 600 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorVisitors)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart-fallback">
                  <p>No visitor history logs recorded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Page Views Per Route Bar Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title-group">
                <BarChart3 size={18} className="text-success" />
                <h4>Page Views Per Route</h4>
              </div>
              <span className="chart-subtitle">Aggregated distribution across client routes</span>
            </div>
            <div className="chart-body">
              {pageviewsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={pageviewsData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="route" 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        fontSize: '12px',
                        color: '#1e293b'
                      }}
                      itemStyle={{ fontWeight: 600 }}
                    />
                    <Bar 
                      dataKey="views" 
                      radius={[6, 6, 0, 0]} 
                      maxBarSize={40}
                    >
                      {pageviewsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart-fallback">
                  <p>No page view logs recorded yet</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
