import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { MdPerson, MdMoreVert, MdSearch } from 'react-icons/md';
import api from '../services/api';
import './Users.css';
import '../components/Skeleton.css';

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [openMenuUserId, setOpenMenuUserId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ show: false, userId: null, userEmail: '' });
  const menuRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applySearch();
  }, [users, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuUserId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      const userList = response.data.users || [];
      setUsers(userList);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const applySearch = () => {
    const currentUserId = currentUser.id || currentUser._id;
    
    let filtered = users.filter(u => {
      const userId = u.id || u._id;
      return userId !== currentUserId;
    });
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser.id || userId === currentUser._id) {
      alert("You cannot change your own role");
      return;
    }

    setUpdatingUserId(userId);
    setError('');

    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      
      setUsers(users.map(u => 
        u.id === userId || u._id === userId ? { ...u, role: newRole } : u
      ));
      
      setUpdatingUserId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
      setUpdatingUserId(null);
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      'admin': { label: 'Admin', class: 'role-admin' },
      'editor': { label: 'Editor', class: 'role-editor' },
      'viewer': { label: 'Viewer', class: 'role-viewer' },
    };
    return badges[role] || badges.viewer;
  };

  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const handleRemoveUser = (user) => {
    const userId = user.id || user._id;
    const currentUserId = currentUser.id || currentUser._id;
    
    if (userId === currentUserId) {
      alert("You cannot remove yourself");
      return;
    }

    setDeleteConfirmModal({ show: true, userId, userEmail: user.email });
    setOpenMenuUserId(null);
  };

  const confirmDelete = async () => {
    const userId = deleteConfirmModal.userId;
    setDeleteConfirmModal({ show: false, userId: null, userEmail: '' });
    
    setError('');
    try {
      await api.delete(`/auth/users/${userId}`);
      
      setUsers(users.filter(u => u.id !== userId && u._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove user');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmModal({ show: false, userId: null, userEmail: '' });
  };

  const toggleMenu = (userId, event) => {
    if (openMenuUserId === userId) {
      setOpenMenuUserId(null);
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const menuHeight = 300;
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
      setOpenMenuUserId(userId);
    }
  };

  if (loading) {
    return (
      <div className="users-page">
        <div className="search-section">
          <div className="search-bar">
            <MdSearch className="search-icon" />
            <input type="text" placeholder="Search users..." disabled />
          </div>
        </div>
        <div className="skeleton-table skeleton-users-table">
          <div className="skeleton-table-header">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="skeleton"></div>
            ))}
          </div>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton-table-row">
              <div className="skeleton skeleton-table-cell"></div>
              <div className="skeleton skeleton-table-cell"></div>
              <div className="skeleton skeleton-table-cell"></div>
              <div className="skeleton skeleton-table-cell"></div>
              <div className="skeleton skeleton-table-cell"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div className="search-section">
        <div className="search-bar">
          <MdSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>No users found</p>
        </div>
      ) : (
        <div className="users-table">
          <div className="table-header">
            <div className="col-email">Email</div>
            <div className="col-role">Role</div>
            <div className="col-joined">Joined</div>
            <div className="col-videos">Videos</div>
            <div className="col-actions">Actions</div>
          </div>

          <div className="table-body">
            {filteredUsers.map((user) => {
              const userId = user.id || user._id;
              const currentUserId = currentUser.id || currentUser._id;
              const isCurrentUser = userId === currentUserId;
              
              return (
              <div key={userId} className="table-row">
                <div className="col-email">
                  {user.email}
                </div>
                <div className="col-role">
                  <div className="role-selector">
                    <span className={`role-badge ${getRoleBadge(user.role).class}`}>
                      {getRoleBadge(user.role).label}
                    </span>
                    {!isCurrentUser && (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(userId, e.target.value)}
                        disabled={updatingUserId === userId}
                        className="role-dropdown"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    )}
                  </div>
                </div>
                <div className="col-joined">{formatDate(user.createdAt)}</div>
                <div className="col-videos">{user.videoCount || 0}</div>
                <div className="col-actions">
                  {isCurrentUser && (
                    <span className="current-user-tag">(You)</span>
                  )}
                  {!isCurrentUser && (
                    <div className="actions-menu-container" ref={openMenuUserId === userId ? menuRef : null}>
                      <button 
                        className="more-btn"
                        onClick={(e) => toggleMenu(userId, e)}
                      >
                        <MdMoreVert />
                      </button>
                      {openMenuUserId === userId && (
                        <div 
                          className="dropdown-menu" 
                          style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`
                          }}
                        >
                          <div className="dropdown-section">
                            <div className="dropdown-label">Change Role</div>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                handleRoleChange(userId, 'admin');
                                setOpenMenuUserId(null);
                              }}
                              disabled={user.role === 'admin'}
                            >
                              Admin
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                handleRoleChange(userId, 'editor');
                                setOpenMenuUserId(null);
                              }}
                              disabled={user.role === 'editor'}
                            >
                              Editor
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                handleRoleChange(userId, 'viewer');
                                setOpenMenuUserId(null);
                              }}
                              disabled={user.role === 'viewer'}
                            >
                              Viewer
                            </button>
                          </div>
                          <div className="dropdown-divider"></div>
                          <button
                            className="dropdown-item danger"
                            onClick={() => handleRemoveUser(user)}
                          >
                            Remove User
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>
      )}

      {deleteConfirmModal.show && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Remove User</h3>
            <p className="modal-message">
              Are you sure you want to remove <strong>{deleteConfirmModal.userEmail}</strong>?
              <br />
              This will also delete all videos uploaded by this user.
              <br />
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="modal-btn delete" onClick={confirmDelete}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;