import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI } from '../services/api';
import { MdUpload, MdClose } from 'react-icons/md';
import './Upload.css';

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    setError('');

    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload MP4, MOV, AVI, or WebM files only.');
      return;
    }

    const maxSize = 5 * 1024 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size exceeds 5GB limit.');
      return;
    }

    setFile(selectedFile);
    setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setFile(null);
    setTitle('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for your video');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);

    try {
      await videoAPI.upload(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      setTimeout(() => {
        navigate('/videos');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="upload-page">
      <div className="upload-section">
        {!file ? (
          <div
            className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-icon">
              <MdUpload />
            </div>
            <h2 className="upload-title">Drag & drop your video here</h2>
            <p className="upload-subtitle">or choose a file from your computer</p>
            
            <button onClick={handleBrowseClick} className="browse-btn">
              Browse Files
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            
            <p className="upload-format">Supported formats: MP4, MOV, AVI, WebM (Max 5GB)</p>
          </div>
        ) : (
          <div className="file-selected">
            <div className="file-info">
              <div className="file-details">
                <MdUpload className="file-icon" />
                <div className="file-text">
                  <h3 className="file-name">{file.name}</h3>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                </div>
              </div>
              {!uploading && (
                <button onClick={handleRemoveFile} className="remove-btn">
                  <MdClose />
                </button>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="title">Video Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter video title"
                disabled={uploading}
              />
            </div>

            {uploading && (
              <div className="upload-progress">
                <div className="progress-info">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}

            <button 
              onClick={handleUpload} 
              className="upload-btn"
              disabled={uploading || !title.trim()}
            >
              {uploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        )}
      </div>

      <div className="tips-section">
        <h3 className="tips-title">Upload Tips</h3>
        <ul className="tips-list">
          <li>Ensure your video meets our format requirements (H.264 codec recommended)</li>
          <li>Processing time depends on file size and resolution</li>
          <li>Large files (1GB+) may take 10-30 minutes to process</li>
          <li>You'll receive a notification when processing is complete</li>
        </ul>
        <div className="storage-warning">
          <strong>Storage Notice:</strong> This deployment uses local filesystem storage on Render's free tier, 
          which features ephemeral storage. Videos may be automatically removed when the server restarts due to 
          inactivity (typically after 15 minutes).
        </div>
      </div>
    </div>
  );
};

export default Upload;