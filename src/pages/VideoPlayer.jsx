import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { MdArrowBack } from 'react-icons/md';
import './VideoPlayer.css';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = async () => {
    try {
      const response = await videoAPI.getById(id);
      setVideo(response.data.video);
      setLoading(false);
    } catch (err) {
      setError('Failed to load video');
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'safe': { label: 'Safe', class: 'status-safe' },
      'flagged': { label: 'Flagged', class: 'status-flagged' },
      'processing': { label: 'Processing', class: 'status-processing' },
      'pending': { label: 'Processing', class: 'status-processing' },
      'completed': { label: 'Safe', class: 'status-safe' },
    };
    return badges[status] || badges.processing;
  };

  if (loading) {
    return (
      <div className="video-player-page">
        <div className="loading">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-player-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  const token = localStorage.getItem('token');
  const streamUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/videos/${id}/stream?token=${token}`;

  return (
    <div className="video-player-page">
      <div className="player-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <MdArrowBack />
          <span>Back</span>
        </button>
      </div>

      <div className="player-container">
        <video
          ref={videoRef}
          controls
          className="video-element"
          src={streamUrl}
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="video-info-section">
        <div className="video-header-row">
          <div className="video-title-row">
            <h2 className="video-title">{video.title}</h2>
            <span className={`status-badge ${getStatusBadge(video.processingStatus === 'completed' ? video.sensitivityStatus : video.processingStatus).class}`}>
              {getStatusBadge(video.processingStatus === 'completed' ? video.sensitivityStatus : video.processingStatus).label}
            </span>
          </div>
        </div>
        <p className="video-meta">
          Uploaded on {formatDate(video.uploadedAt)} • {formatDuration(video.duration)} • {formatSize(video.size)}
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;