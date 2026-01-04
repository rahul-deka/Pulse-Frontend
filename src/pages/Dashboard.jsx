import { useState, useEffect } from 'react';
import { videoAPI } from '../services/api';
import { MdVideoLibrary, MdTrendingUp, MdCheckCircle, MdAccessTime, MdVideocam } from 'react-icons/md';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    processing: 0,
    completed: 0,
    totalHours: 0,
  });
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await videoAPI.getAll();
      const videos = response.data.videos || [];

      const processing = videos.filter(v => v.processingStatus === 'processing').length;
      const completed = videos.filter(v => v.processingStatus === 'completed').length;
      
      const recent = videos.slice(0, 5);

      setStats({
        total: videos.length,
        processing,
        completed,
        totalHours: 0,
      });

      setRecentVideos(recent);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'completed': { label: 'Safe', class: 'status-safe' },
      'processing': { label: 'Processing', class: 'status-processing' },
      'pending': { label: 'Processing', class: 'status-processing' },
      'failed': { label: 'Flagged', class: 'status-flagged' },
    };
    return badges[status] || badges.processing;
  };

  const getProgressPercentage = (status) => {
    if (status === 'completed') return 100;
    if (status === 'processing') return 60;
    return 30;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const uploaded = new Date(date);
    const diffHours = Math.floor((now - uploaded) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 48) return '1 day ago';
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Videos</span>
            <MdVideoLibrary className="stat-icon" />
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Processing</span>
            <MdTrendingUp className="stat-icon" />
          </div>
          <div className="stat-value">{stats.processing}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Completed</span>
            <MdCheckCircle className="stat-icon" />
          </div>
          <div className="stat-value">{stats.completed}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Hours</span>
            <MdAccessTime className="stat-icon" />
          </div>
          <div className="stat-value">{stats.totalHours}</div>
        </div>
      </div>

      <div className="recent-section">
        <h2 className="section-title">Recent Uploads</h2>
        
        {recentVideos.length === 0 ? (
          <div className="empty-state">
            <p>No videos uploaded yet</p>
          </div>
        ) : (
          <div className="recent-videos">
            {recentVideos.map((video) => (
              <div key={video._id} className="video-item">
                <div className="video-thumbnail">
                  <MdVideocam className="thumbnail-icon" />
                </div>
                
                <div className="video-details">
                  <div className="video-header">
                    <h3 className="video-title">{video.title}</h3>
                    <span className={`status-badge ${getStatusBadge(video.processingStatus).class}`}>
                      {getStatusBadge(video.processingStatus).label}
                    </span>
                  </div>
                  
                  <p className="video-time">{formatTimeAgo(video.uploadedAt)}</p>
                  
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${getProgressPercentage(video.processingStatus)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;