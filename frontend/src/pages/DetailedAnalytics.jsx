import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { RefreshCw, Search, ArrowUpDown, ShieldAlert, User, Compass } from 'lucide-react';

const DetailedAnalytics = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, registered, guest
  
  // Local Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  const fetchSessionLogs = async () => {
    try {
      const response = await api.get('/analytics/sessions');
      setLogs(response.data);
      setFilteredLogs(response.data);
    } catch (err) {
      console.error('Failed to load session logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessionLogs();
  }, []);

  // Handle Search and Filter transformations
  useEffect(() => {
    let result = [...logs];

    // Search filter (handles routes and user emails)
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => {
        const routeMatch = log.route.toLowerCase().includes(term);
        const emailMatch = log.userId?.email?.toLowerCase().includes(term);
        const nameMatch = log.userId?.name?.toLowerCase().includes(term);
        const ipMatch = log.ipAddress?.includes(term);
        return routeMatch || emailMatch || nameMatch || ipMatch;
      });
    }

    // Category filter
    if (filterType === 'registered') {
      result = result.filter(log => log.userId !== null);
    } else if (filterType === 'guest') {
      result = result.filter(log => log.userId === null);
    }

    setFilteredLogs(result);
    setCurrentPage(1); // Reset page to 1 on filter
  }, [searchTerm, filterType, logs]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSessionLogs();
  };

  // Pagination bounds
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const formatTimestamp = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="app-main">
        <header className="main-header">
          <div className="header-title">
            <h2 className="page-heading">Detailed Session Activity</h2>
            <p className="sub-heading">Granular session telemetry and hit records recorded by backend middleware</p>
          </div>
          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            className={`btn-refresh ${refreshing ? 'spinning' : ''}`}
            title="Refresh Logs"
          >
            <RefreshCw size={16} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </header>

        {/* Filters and Search toolbar */}
        <section className="toolbar-section">
          <div className="search-bar-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by route, user email, name or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <button 
              onClick={() => setFilterType('all')} 
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            >
              All Events
            </button>
            <button 
              onClick={() => setFilterType('registered')} 
              className={`filter-btn ${filterType === 'registered' ? 'active' : ''}`}
            >
              Registered Users
            </button>
            <button 
              onClick={() => setFilterType('guest')} 
              className={`filter-btn ${filterType === 'guest' ? 'active' : ''}`}
            >
              Guest Sessions
            </button>
          </div>
        </section>

        {/* Data Table */}
        <section className="table-card">
          {loading ? (
            <div className="table-loading flex-center">
              <div className="spinner"></div>
              <p>Loading activity logs...</p>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="table-responsive">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User Identity</th>
                    <th>Access Route</th>
                    <th>Session ID</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log, idx) => (
                    <tr key={log._id || idx} className="log-row">
                      <td className="col-time">{formatTimestamp(log.timestamp)}</td>
                      <td className="col-user">
                        {log.userId ? (
                          <div className="user-profile-cell">
                            <img 
                              src={log.userId.profilePic || 'https://api.dicebear.com/7.x/initials/svg?seed=' + log.userId.name} 
                              alt={log.userId.name} 
                              className="user-cell-avatar"
                            />
                            <div className="user-cell-meta">
                              <span className="user-cell-name">{log.userId.name}</span>
                              <span className="user-cell-email">{log.userId.email}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="user-profile-cell guest-user">
                            <div className="guest-avatar-icon">
                              <User size={16} />
                            </div>
                            <div className="user-cell-meta">
                              <span className="user-cell-name">Anonymous Visitor</span>
                              <span className="user-cell-email text-muted">Guest Session</span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="col-route">
                        <span className="route-badge">
                          <Compass size={12} />
                          {log.route}
                        </span>
                      </td>
                      <td className="col-session" title={log.sessionId}>
                        <code>{log.sessionId ? log.sessionId.substring(0, 15) : 'unknown'}...</code>
                      </td>
                      <td className="col-ip">
                        <code>{log.ipAddress}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table Pagination footer */}
              {totalPages > 1 && (
                <div className="table-pagination">
                  <span className="pagination-info">
                    Showing {indexOfFirstLog + 1} to {Math.min(indexOfLastLog, filteredLogs.length)} of {filteredLogs.length} records
                  </span>
                  <div className="pagination-buttons">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`pagination-btn number-btn ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="table-empty flex-center">
              <ShieldAlert size={48} className="text-muted mb-2" />
              <h4>No activity logs found</h4>
              <p>Try modifying your search query or login to create logs.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DetailedAnalytics;
