import  { useState, useEffect } from 'react';
import axios from 'axios';
import './ForumTest.css';

const API_BASE = 'http://localhost:8000/api/forum';

const ForumTest = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ title: '', body: '', subject: '' });
  const [newAnswer, setNewAnswer] = useState({ body: '' });
  const [newComment, setNewComment] = useState({ body: '', content_type: 'question', object_id: '' });
  const [activeTab, setActiveTab] = useState('questions');
  const [statusMessage, setStatusMessage] = useState('');

  // Fetch all questions
  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_BASE}/questions/`);
      setQuestions(response.data);
      setStatusMessage('Questions loaded successfully');
    } catch (error) {
      setStatusMessage('Error loading questions: ' + error.message);
    }
  };

  // Fetch all subjects
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE}/subjects/`);
      setSubjects(response.data);
      setStatusMessage('Subjects loaded successfully');
    } catch (error) {
      setStatusMessage('Error loading subjects: ' + error.message);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_BASE}/notifications/`);
      setNotifications(response.data);
      setStatusMessage('Notifications loaded successfully');
    } catch (error) {
      setStatusMessage('Error loading notifications: ' + error.message);
    }
  };

  // Fetch answers for a specific question
  const fetchAnswers = async (questionId) => {
    try {
      const response = await axios.get(`${API_BASE}/questions/${questionId}/answers/`);
      setAnswers(response.data);
      setStatusMessage('Answers loaded successfully');
    } catch (error) {
      setStatusMessage('Error loading answers: ' + error.message);
    }
  };

  // Create a new question
  const createQuestion = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/questions/`, newQuestion);
      setNewQuestion({ title: '', body: '', subject: '' });
      fetchQuestions();
      setStatusMessage('Question created successfully');
    } catch (error) {
      setStatusMessage('Error creating question: ' + error.message);
    }
  };

  // Create a new answer
  const createAnswer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/answers/`, {
        ...newAnswer,
        question: selectedQuestion.id
      });
      setNewAnswer({ body: '' });
      fetchAnswers(selectedQuestion.id);
      setStatusMessage('Answer created successfully');
    } catch (error) {
      setStatusMessage('Error creating answer: ' + error.message);
    }
  };

  // Create a new comment
  const createComment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/comments/`, newComment);
      setNewComment({ body: '', content_type: 'question', object_id: '' });
      setStatusMessage('Comment created successfully');
    } catch (error) {
      setStatusMessage('Error creating comment: ' + error.message);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchQuestions();
    fetchSubjects();
  }, []);

  return (
    <div className="forum-test">
      <h1>Hikma Learn Forum API Tester</h1>
      
      {statusMessage && <div className="status-message">{statusMessage}</div>}
      
      <div className="tabs">
        <button 
          className={activeTab === 'questions' ? 'active' : ''} 
          onClick={() => setActiveTab('questions')}
        >
          Questions
        </button>
        <button 
          className={activeTab === 'subjects' ? 'active' : ''} 
          onClick={() => setActiveTab('subjects')}
        >
          Subjects
        </button>
        <button 
          className={activeTab === 'notifications' ? 'active' : ''} 
          onClick={() => {
            setActiveTab('notifications');
            fetchNotifications();
          }}
        >
          Notifications
        </button>
        <button 
          className={activeTab === 'create' ? 'active' : ''} 
          onClick={() => setActiveTab('create')}
        >
          Create Content
        </button>
      </div>

      {activeTab === 'questions' && (
        <div className="tab-content">
          <h2>Questions</h2>
          <button onClick={fetchQuestions}>Refresh Questions</button>
          <div className="questions-list">
            {questions.map(question => (
              <div key={question.id} className="question-item">
                <h3>{question.title}</h3>
                <p>{question.body}</p>
                <p><strong>Author:</strong> {question.author?.username}</p>
                <p><strong>Status:</strong> {question.status}</p>
                <button onClick={() => {
                  setSelectedQuestion(question);
                  fetchAnswers(question.id);
                }}>
                  View Answers
                </button>
                
                {selectedQuestion && selectedQuestion.id === question.id && (
                  <div className="answers-section">
                    <h4>Answers:</h4>
                    {answers.map(answer => (
                      <div key={answer.id} className="answer-item">
                        <p>{answer.body}</p>
                        <p><strong>By:</strong> {answer.author?.username}</p>
                        {answer.pinned && <span className="pinned-badge">Pinned</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'subjects' && (
        <div className="tab-content">
          <h2>Subjects</h2>
          <button onClick={fetchSubjects}>Refresh Subjects</button>
          <div className="subjects-list">
            {subjects.map(subject => (
              <div key={subject.id} className="subject-item">
                <h3>{subject.name}</h3>
                <p>{subject.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="tab-content">
          <h2>Notifications</h2>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div key={notification.id} className="notification-item">
                <p>{notification.message}</p>
                <p><strong>Type:</strong> {notification.notification_type}</p>
                <p><strong>Read:</strong> {notification.is_read ? 'Yes' : 'No'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="tab-content">
          <h2>Create New Content</h2>
          
          <div className="create-forms">
            <form onSubmit={createQuestion} className="create-form">
              <h3>Create Question</h3>
              <input
                type="text"
                placeholder="Title"
                value={newQuestion.title}
                onChange={(e) => setNewQuestion({...newQuestion, title: e.target.value})}
                required
              />
              <textarea
                placeholder="Body"
                value={newQuestion.body}
                onChange={(e) => setNewQuestion({...newQuestion, body: e.target.value})}
                required
              />
              <select
                value={newQuestion.subject}
                onChange={(e) => setNewQuestion({...newQuestion, subject: e.target.value})}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              <button type="submit">Create Question</button>
            </form>

            <form onSubmit={createAnswer} className="create-form">
              <h3>Create Answer</h3>
              <select
                value={selectedQuestion?.id || ''}
                onChange={(e) => setSelectedQuestion(questions.find(q => q.id == e.target.value))}
                required
              >
                <option value="">Select Question</option>
                {questions.map(question => (
                  <option key={question.id} value={question.id}>{question.title}</option>
                ))}
              </select>
              <textarea
                placeholder="Answer Body"
                value={newAnswer.body}
                onChange={(e) => setNewAnswer({...newAnswer, body: e.target.value})}
                required
              />
              <button type="submit" disabled={!selectedQuestion}>Create Answer</button>
            </form>

            <form onSubmit={createComment} className="create-form">
              <h3>Create Comment</h3>
              <select
                value={newComment.content_type}
                onChange={(e) => setNewComment({...newComment, content_type: e.target.value})}
              >
                <option value="question">On Question</option>
                <option value="answer">On Answer</option>
              </select>
              <input
                type="number"
                placeholder="Object ID"
                value={newComment.object_id}
                onChange={(e) => setNewComment({...newComment, object_id: e.target.value})}
                required
              />
              <textarea
                placeholder="Comment Body"
                value={newComment.body}
                onChange={(e) => setNewComment({...newComment, body: e.target.value})}
                required
              />
              <button type="submit">Create Comment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumTest;