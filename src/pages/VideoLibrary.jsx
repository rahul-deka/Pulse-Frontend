import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { MdSearch, MdFilterList, MdVideocam, MdMoreVert } from 'react-icons/md';
import './VideoLibrary.css';

const VideoLibrary = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [openMenuVideoId, setOpenMenuVideoId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [error, setError] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [videos, searchQuery, activeFilter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuVideoId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadVideos = async () => {
    try {
      const response = await videoAPI.getAll();
      const videoList = response.data.videos || [];
      setVideos(videoList);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load videos:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...videos];

    if (activeFilter !== 'all') {
      if (activeFilter === 'safe') {
        filtered = filtered.filter(v => v.sensitivityStatus === 'safe');
      } else if (activeFilter === 'flagged') {
        filtered = filtered.filter(v => v.sensitivityStatus === 'flagged');
      } else if (activeFilter === 'processing') {
        filtered = filtered.filter(v => 
          v.processingStatus === 'processing' || v.processingStatus === 'pending'
        );
      }
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVideos(filtered);
  };

  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--';
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

  const handleView = (videoId) => {
    navigate(`/videos/${videoId}`);
  };

  const toggleMenu = (videoId, event) => {
    if (openMenuVideoId === videoId) {
      setOpenMenuVideoId(null);
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const menuHeight = 150;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      let top, left;
      left = rect.right - 180;
      
      if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        top = rect.top - menuHeight;
      } else {
        top = rect.bottom;
      }
      
      setMenuPosition({ top, left });
      setOpenMenuVideoId(videoId);
    }
  };

  const handleEditTitle = (video) => {
    setEditingVideoId(video._id);
    setEditTitle(video.title);
    setOpenMenuVideoId(null);
  };

  const handleSaveTitle = async (videoId) => {
    if (!editTitle.trim()) {
      setError('Title cannot be empty');
      return;
    }

    setError('');
    try {
      await videoAPI.update(videoId, { title: editTitle });
      
      setVideos(videos.map(v => 
        v._id === videoId ? { ...v, title: editTitle } : v
      ));
      
      setEditingVideoId(null);
      setEditTitle('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update title');
    }
  };

  const handleCancelEdit = () => {
    setEditingVideoId(null);
    setEditTitle('');
    setError('');
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }

    setError('');
    try {
      await videoAPI.delete(videoId);
      
      setVideos(videos.filter(v => v._id !== videoId));
      setOpenMenuVideoId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete video');
    }
  };

  if (loading) {
    return <div className="loading">Loading videos...</div>;
  }

  return (
    <div className="video-library">
      {/* Search and Filters */}
      <div className="library-header">
        <div className="search-bar">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filter-btn">
          <MdFilterList />
          <span>Filter</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-tab ${activeFilter === 'safe' ? 'active' : ''}`}
          onClick={() => setActiveFilter('safe')}
        >
          Safe
        </button>
        <button
          className={`filter-tab ${activeFilter === 'flagged' ? 'active' : ''}`}
          onClick={() => setActiveFilter('flagged')}
        >
          Flagged
        </button>
        <button
          className={`filter-tab ${activeFilter === 'processing' ? 'active' : ''}`}
          onClick={() => setActiveFilter('processing')}
        >
          Processing
        </button>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Videos Table */}
      {filteredVideos.length === 0 ? (
        <div className="empty-state">
          <p>No videos found</p>
        </div>
      ) : (
        <div className="videos-table">
          <div className="table-header">
            <div className="col-title">Title</div>
            <div className="col-duration">Duration</div>
            <div className="col-date">Upload Date</div>
            <div className="col-status">Status</div>
            <div className="col-actions">Actions</div>
          </div>

          <div className="table-body">
            {filteredVideos.map((video) => (
              <div key={video._id} className="table-row">
                <div className="col-title">
                  <div className="video-info">
                    <div className="video-thumbnail-small">
                      <MdVideocam />
                    </div>
                    {editingVideoId === video._id ? (
                      <div className="edit-title-container">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="edit-title-input"
                          autoFocus
                        />
                        <div className="edit-title-actions">
                          <button 
                            className="save-btn"
                            onClick={() => handleSaveTitle(video._id)}
                          >
                            Save
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={handleCancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="video-title">{video.title}</span>
                    )}
                  </div>
                </div>
                <div className="col-duration">{formatDuration(video.duration)}</div>
                <div className="col-date">{formatDate(video.uploadedAt)}</div>
                <div className="col-status">
                  <span className={`status-badge ${getStatusBadge(video.processingStatus === 'completed' ? video.sensitivityStatus : video.processingStatus).class}`}>
                    {getStatusBadge(video.processingStatus === 'completed' ? video.sensitivityStatus : video.processingStatus).label}
                  </span>
                </div>
                <div className="col-actions">
                  <button 
                    className="action-btn"
                    onClick={() => handleView(video._id)}
                  >
                    View
                  </button>
                  <div className="actions-menu-container" ref={openMenuVideoId === video._id ? menuRef : null}>
                    <button 
                      className="more-btn"
                      onClick={(e) => toggleMenu(video._id, e)}
                    >
                      <MdMoreVert />
                    </button>
                    {openMenuVideoId === video._id && (
                      <div 
                        className="dropdown-menu" 
                        style={{
                          top: `${menuPosition.top}px`,
                          left: `${menuPosition.left}px`
                        }}
                      >
                        <button
                          className="dropdown-item"
                          onClick={() => handleEditTitle(video)}
                        >
                          Edit Title
                        </button>
                        <div className="dropdown-divider"></div>
                        <button
                          className="dropdown-item danger"
                          onClick={() => handleDeleteVideo(video._id)}
                        >
                          Delete Video
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLibrary;
