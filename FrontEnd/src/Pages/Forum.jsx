import  { useState, useEffect } from 'react';
import axios from 'axios';
import './Forum.css';
import { login, logout, getCurrentUser, refreshToken } from '../services/auth'; // Adjust path as needed

import { fetchWithAuth } from '../services/api'; // Adjust path as needed

const API_BASE = 'http://localhost:8000/api/forum';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    subject: '',
    attachments: []
  });
  const [newComments, setNewComments] = useState({});
  const [activeTab, setActiveTab] = useState('feed');
  const [statusMessage, setStatusMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication and set up axios interceptors
  useEffect(() => {
    checkAuthentication();
    setupAxiosInterceptors();
  }, []);

  const checkAuthentication = () => {
    const currentUser = getCurrentUser();
    const accessToken = localStorage.getItem('access_token');
    
    if (currentUser && accessToken) {
      setUser(currentUser);
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      fetchWorkspace();
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  const setupAxiosInterceptors = () => {
    // Add request interceptor to include auth token
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshToken();
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  };

  const fetchWorkspace = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/forum/workspace/');
      setUser(response.data.user);
      setPosts(response.data.posts);
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Error fetching workspace:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setPosts([]);
    setSubjects([]);
    setIsAuthenticated(false);
  };

  const createPost = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      if (newPost.subject) formData.append('subject', newPost.subject);
      
      // Add attachments
      newPost.attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post(`${API_BASE}/posts/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setNewPost({ title: '', content: '', subject: '', attachments: [] });
      setIsCreatingPost(false);
      fetchPosts();
      setStatusMessage('Post created successfully!');
    } catch (error) {
      setStatusMessage('Error creating post: ' + error.message);
    }
  };

  const createComment = async (postId, content, attachments = []) => {
    try {
      const formData = new FormData();
      formData.append('post', postId);
      formData.append('content', content);
      
      // Add attachments
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post(`${API_BASE}/comments/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setNewComments(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
      setStatusMessage('Answer posted successfully!');
    } catch (error) {
      setStatusMessage('Error posting answer: ' + error.message);
    }
  };

  const pinComment = async (commentId) => {
    try {
      await axios.post(`${API_BASE}/comments/${commentId}/pin/`);
      fetchPosts();
      setStatusMessage('Answer pinned as best!');
    } catch (error) {
      setStatusMessage('Error pinning answer: ' + error.message);
    }
  };

  const unpinComment = async (commentId) => {
    try {
      await axios.post(`${API_BASE}/comments/${commentId}/pin/`);
      fetchPosts();
      setStatusMessage('Answer unpinned!');
    } catch (error) {
      setStatusMessage('Error unpinning answer: ' + error.message);
    }
  };

  const pinPost = async (postId) => {
    try {
      await axios.post(`${API_BASE}/posts/${postId}/pin/`);
      fetchPosts();
      setStatusMessage('Post pinned!');
    } catch (error) {
      setStatusMessage('Error pinning post: ' + error.message);
    }
  };

  const handleFileUpload = (e, setAttachments) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index, setAttachments) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatContent = (content) => {
    // Simple formatting - you can enhance this with a rich text editor
    return content.split('\n').map((paragraph, index) => (
      paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
    ));
  };

   if (isLoading) {
    return (
      <div className="forum-container">
        <div className="forum-header">
          <h1>Hikma Learn Forum</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="forum-container">
        <div className="forum-header">
          <h1>Hikma Learn Forum</h1>
          <p>Please login to access the forum</p>
        </div>
        <div className="forum-login-redirect">
          <p>You need to be logged in to view the forum.</p>
          <button onClick={() => window.location.href = '/login'} className="login-redirect-btn">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="forum-container">
      <div className="forum-header">
        <h1>Hikma Learn Forum</h1>
        <div className="user-info">
          Welcome, {user.first_name || user.username}!
          {user.user_type === 'teacher' && <span className="teacher-badge">Teacher</span>}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
=

      {statusMessage && (
        <div className="status-message" onClick={() => setStatusMessage('')}>
          {statusMessage}
        </div>
      )}

      <div className="forum-tabs">
        <button 
          className={activeTab === 'feed' ? 'active' : ''}
          onClick={() => setActiveTab('feed')}
        >
          Feed
        </button>
        <button 
          className={activeTab === 'subjects' ? 'active' : ''}
          onClick={() => setActiveTab('subjects')}
        >
          Subjects
        </button>
      </div>

      {activeTab === 'feed' && (
        <div className="feed-content">
          {/* Create Post Card */}
          <div className="post-card create-post-card">
            <div className="post-input" onClick={() => setIsCreatingPost(true)}>
              What's your question, {user.first_name || user.username}?
            </div>
            
            {isCreatingPost && (
              <div className="create-post-form">
                <h3>Ask a Question</h3>
                <form onSubmit={createPost}>
                  <input
                    type="text"
                    placeholder="Question title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    required
                  />
                  <textarea
                    placeholder="Describe your question in detail..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows="4"
                    required
                  />
                  
                  <select
                    value={newPost.subject}
                    onChange={(e) => setNewPost({...newPost, subject: e.target.value})}
                  >
                    <option value="">Select Subject (optional)</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  <div className="file-uploads">
                    <label className="file-upload-btn">
                      📎 Attach Files
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFileUpload(e, (files) => 
                          setNewPost({...newPost, attachments: files})
                        )}
                      />
                    </label>
                    
                    {newPost.attachments.length > 0 && (
                      <div className="attachments-preview">
                        {newPost.attachments.map((file, index) => (
                          <div key={index} className="attachment-item">
                            <span>{file.name}</span>
                            <button 
                              type="button"
                              onClick={() => removeAttachment(index, (files) => 
                                setNewPost({...newPost, attachments: files})
                              )}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="cancel-btn"
                      onClick={() => setIsCreatingPost(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Post Question
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Posts List */}
          <div className="posts-list">
            {posts.map(post => (
              <div key={post.id} className="post-card">
                {post.is_pinned && (
                  <div className="pinned-badge">
                    📌 Pinned Question
                  </div>
                )}
                
                <div className="post-header">
                  <div className="author-info">
                    <div className="author-avatar">
                      {post.author?.first_name?.[0] || post.author?.username?.[0]}
                    </div>
                    <div>
                      <div className="author-name">
                        {post.author?.first_name} {post.author?.last_name}
                        {post.author?.user_type === 'teacher' && (
                          <span className="teacher-badge">Teacher</span>
                        )}
                      </div>
                      <div className="post-time">
                        {new Date(post.created_at).toLocaleDateString()} • 
                        {post.subject && (
                          <span className="subject-tag" style={{backgroundColor: post.subject.color}}>
                            {post.subject.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {user.user_type === 'teacher' && (
                    <button 
                      className="pin-btn"
                      onClick={() => pinPost(post.id)}
                    >
                      {post.is_pinned ? '📌 Unpin' : '📌 Pin'}
                    </button>
                  )}
                </div>

                <div className="post-content">
                  <h3>{post.title}</h3>
                  <div className="post-text">
                    {formatContent(post.content)}
                  </div>
                  
                  {post.attachments && post.attachments.length > 0 && (
                    <div className="post-attachments">
                      <h4>Attachments:</h4>
                      {post.attachments.map(attachment => (
                        <div key={attachment.id} className="attachment">
                          <a 
                            href={attachment.file} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            📄 {attachment.file_name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="post-actions">
                  <span>{post.comments_count || 0} answers</span>
                </div>

                {/* Comments/Answers Section */}
                <div className="comments-section">
                  <h4>Answers:</h4>
                  
                  {post.comments && post.comments.map(comment => (
                    <div key={comment.id} className={`comment ${comment.is_pinned ? 'pinned-answer' : ''}`}>
                      {comment.is_pinned && (
                        <div className="best-answer-badge">
                          ⭐ Best Answer
                        </div>
                      )}
                      
                      <div className="comment-header">
                        <div className="author-info">
                          <div className="author-avatar small">
                            {comment.author?.first_name?.[0] || comment.author?.username?.[0]}
                          </div>
                          <div>
                            <div className="author-name">
                              {comment.author?.first_name} {comment.author?.last_name}
                              {comment.author?.user_type === 'teacher' && (
                                <span className="teacher-badge">Teacher</span>
                              )}
                            </div>
                            <div className="comment-time">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        {user.user_type === 'teacher' && (
                          <button 
                            className="pin-answer-btn"
                            onClick={() => comment.is_pinned ? unpinComment(comment.id) : pinComment(comment.id)}
                          >
                            {comment.is_pinned ? '⭐ Unpin' : '⭐ Mark as Best'}
                          </button>
                        )}
                      </div>

                      <div className="comment-content">
                        {formatContent(comment.content)}
                      </div>

                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="comment-attachments">
                          {comment.attachments.map(attachment => (
                            <div key={attachment.id} className="attachment">
                              <a 
                                href={attachment.file} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                📄 {attachment.file_name}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Answer Form */}
                  <div className="add-comment-form">
                    <textarea
                      placeholder="Write your answer..."
                      value={newComments[post.id] || ''}
                      onChange={(e) => setNewComments({...newComments, [post.id]: e.target.value})}
                      rows="3"
                    />
                    <div className="comment-actions">
                      <label className="file-upload-btn small">
                        📎 Attach
                        <input
                          type="file"
                          multiple
                          onChange={(e) => handleFileUpload(e, (files) => {
                            // Store files for this specific post comment
                            const postFiles = newComments[`${post.id}_files`] || [];
                            setNewComments({
                              ...newComments, 
                              [`${post.id}_files`]: [...postFiles, ...files]
                            });
                          })}
                        />
                      </label>
                      <button 
                        onClick={() => createComment(
                          post.id, 
                          newComments[post.id], 
                          newComments[`${post.id}_files`] || []
                        )}
                        disabled={!newComments[post.id]}
                      >
                        Post Answer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="subjects-content">
          <h2>Subjects</h2>
          <div className="subjects-grid">
            {subjects.map(subject => (
              <div 
                key={subject.id} 
                className="subject-card"
                style={{borderLeftColor: subject.color}}
              >
                <h3>{subject.name}</h3>
                <p>{subject.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Forum;