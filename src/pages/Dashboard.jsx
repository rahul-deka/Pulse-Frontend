import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { MdVideoLibrary, MdTrendingUp, MdCheckCircle, MdAccessTime, MdVideocam } from 'react-icons/md';
import './Dashboard.css';
import '../components/Skeleton.css';

const Dashboard = () => {
  const navigate = useNavigate();
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

  const formatTimeAgo = (date) => {
    const now = new Date();
    const uploaded = new Date(date);
    const diffMs = now - uploaded;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="skeleton-stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-stat-card">
              <div className="skeleton-stat-header">
                <div className="skeleton skeleton-stat-label"></div>
                <div className="skeleton skeleton-stat-icon"></div>
              </div>
              <div className="skeleton skeleton-stat-value"></div>
            </div>
          ))}
        </div>
        <div className="skeleton skeleton-section-title"></div>
        <div className="skeleton-video-list">
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-video-item">
              <div className="skeleton skeleton-thumbnail"></div>
              <div className="skeleton-video-content">
                <div className="skeleton skeleton-video-title"></div>
                <div className="skeleton skeleton-video-time"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
              <div 
                key={video._id} 
                className="video-item"
                onClick={() => navigate(`/videos/${video._id}`)}
                style={{ cursor: 'pointer' }}
              >
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