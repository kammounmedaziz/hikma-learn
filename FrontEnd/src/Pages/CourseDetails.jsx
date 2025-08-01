import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import axios from 'axios';
import "../App.css";

const CourseDetails = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterDescription, setNewChapterDescription] = useState('');
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  const isTeacher = userType === 'teacher';
  const [showContentPopup, setShowContentPopup] = useState(false);
  const [contentType, setContentType] = useState('TEXT');
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [contentForm, setContentForm] = useState({
    title: '',
    text: '',
    url: '',
    file: null,
  });
  const [editingContentId, setEditingContentId] = useState(null);
  const [editContentData, setEditContentData] = useState({
    title: '',
    content_kind: 'TEXT',
    text: '',
    url: '',
    file: null,
  });
  const [chapterContents, setChapterContents] = useState({});
  const [showReorderPopup, setShowReorderPopup] = useState(false);
  const [reorderedChapters, setReorderedChapters] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [subtitleError, setSubtitleError] = useState(null);
  const [subtitleSuccess, setSubtitleSuccess] = useState(null);

  const MAX_LENGTH = 100;

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchCourse = axios.get(`http://127.0.0.1:8000/courses/${courseId}/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const fetchChapters = axios.get(`http://127.0.0.1:8000/courses/${courseId}/chapters/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Promise.all([fetchCourse, fetchChapters])
      .then(([courseRes, chaptersRes]) => {
        setCourse(courseRes.data);
        setChapters(chaptersRes.data);
        setReorderedChapters(chaptersRes.data);
      })
      .catch(err => {
        console.error(err);
        setError("Erreur lors du chargement des données.");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const toggleChapter = (id) => {
    if (expandedChapterId === id) {
      setExpandedChapterId(null);
    } else {
      setExpandedChapterId(id);
      fetchContentsForChapter(id);
    }
  };

  const fetchContentsForChapter = async (chapterId) => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setChapterContents(prev => ({ ...prev, [chapterId]: res.data }));
    } catch (error) {
      console.error("Erreur fetch contenus :", error);
      setChapterContents(prev => ({ ...prev, [chapterId]: [] }));
    }
  };

  const handleAddChapter = () => {
    setShowPopup(true);
  };

  const handleEditChapter = (chapter) => {
    setEditingChapterId(chapter.id);
    setEditData({ title: chapter.title, description: chapter.description });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (chapterId) => {
    try {
      const csrfToken = getCookie('csrftoken');
      const res = await axios.put(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/`,
        editData,
        {
          headers: {
            'X-CSRFToken': csrfToken,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updated = chapters.map(chap =>
        chap.id === chapterId ? res.data : chap
      );
      setChapters(updated);
      setReorderedChapters(updated);
      setEditingChapterId(null);
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
      alert("Échec de la mise à jour");
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm("Confirm deletion of this chapter ?")) return;
    try {
      const csrfToken = getCookie('csrftoken');
      await axios.delete(`http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/`, {
        headers: {
          'X-CSRFToken': csrfToken,
          Authorization: `Bearer ${token}`,
        },
      });
      setChapters(prev => prev.filter(c => c.id !== chapterId));
      setReorderedChapters(prev => prev.filter(c => c.id !== chapterId));
    } catch (err) {
      console.error("Erreur de suppression :", err);
      alert("Échec de la suppression");
    }
  };

  const handleAddContent = (chapterId) => {
    setSelectedChapterId(chapterId);
    setShowContentPopup(true);
    setContentType('TEXT');
    setContentForm({ title: '', text: '', url: '', file: null });
  };

  const submitNewChapter = async () => {
    if (!newChapterTitle || !newChapterDescription) {
      alert("Title and description are required.");
      return;
    }

    try {
      const csrfToken = getCookie('csrftoken');
      const res = await axios.post(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/`,
        {
          title: newChapterTitle,
          description: newChapterDescription,
        },
        {
          headers: {
            'X-CSRFToken': csrfToken,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChapters([...chapters, res.data]);
      setReorderedChapters([...chapters, res.data]);
      setShowPopup(false);
      setNewChapterTitle('');
      setNewChapterDescription('');
    } catch (err) {
      console.error("Erreur d'ajout :", err);
      alert("Erreur lors de l'ajout du chapitre");
    }
  };

  const handleEditContent = (content) => {
    setEditingContentId(content.id);
    setEditContentData({
      title: content.title,
      content_kind: content.content_kind,
      text: content.content_kind === 'TEXT' ? content.text : '',
      url: content.content_kind === 'LINK' ? content.url : '',
      file: null,
    });
  };

  const handleEditContentChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setEditContentData(prev => ({ ...prev, file: files[0] }));
    } else {
      setEditContentData(prev => ({ ...prev, [name]: value }));
    }
  };

  const submitContent = async () => {
    if (!contentForm.title) {
      alert("Title is required.");
      return;
    }

    if (contentType === 'TEXT' && !contentForm.text) {
      alert("Text content is required.");
      return;
    }

    if (contentType === 'LINK' && !contentForm.url) {
      alert("URL is required.");
      return;
    }

    if (contentType === 'FILE' && !contentForm.file) {
      alert("File is required.");
      return;
    }

    if (contentType === 'QUIZ') {
      alert("Quiz creation is not yet implemented.");
      return;
    }

    try {
      const csrfToken = getCookie('csrftoken');
      const formData = new FormData();
      formData.append('title', contentForm.title);
      formData.append('content_kind', contentType);

      if (contentType === 'TEXT') {
        formData.append('text', contentForm.text);
      } else if (contentType === 'LINK') {
        formData.append('url', contentForm.url);
      } else if (contentType === 'FILE') {
        formData.append('file', contentForm.file);
      }

      const res = await axios.post(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${selectedChapterId}/contents/`,
        formData,
        {
          headers: {
            'X-CSRFToken': csrfToken,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setChapterContents((prev) => ({
        ...prev,
        [selectedChapterId]: [...(prev[selectedChapterId] || []), res.data],
      }));

      setShowContentPopup(false);
      setContentForm({ title: '', text: '', url: '', file: null });
      setContentType('TEXT');
    } catch (err) {
      console.error("Error adding content:", err);
      alert("Failed to add content.");
    }
  };

  const submitEditContent = async (chapterId, contentId) => {
    try {
      const csrfToken = getCookie('csrftoken');
      const formData = new FormData();
      formData.append('title', editContentData.title);
      formData.append('content_kind', editContentData.content_kind);

      if (editContentData.content_kind === 'TEXT') {
        formData.append('text', editContentData.text);
      } else if (editContentData.content_kind === 'LINK') {
        formData.append('url', editContentData.url);
      } else if (editContentData.content_kind === 'FILE') {
        if (editContentData.file) formData.append('file', editContentData.file);
        else {
          alert("Please select a file.");
          return;
        }
      }

      const res = await axios.put(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/`,
        formData,
        {
          headers: {
            'X-CSRFToken': csrfToken,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setChapterContents(prev => ({
        ...prev,
        [chapterId]: prev[chapterId].map(c =>
          c.id === contentId ? res.data : c
        ),
      }));

      setEditingContentId(null);
    } catch (err) {
      console.error("Erreur de mise à jour du contenu :", err);
      alert("Erreur lors de la mise à jour.");
    }
  };

  const handleDeleteContent = async (chapterId, contentId) => {
    if (!window.confirm('Confirm deletion of this content?')) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChapterContents(prev => ({
        ...prev,
        [chapterId]: prev[chapterId].filter(c => c.id !== contentId),
      }));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('La suppression a échoué. Veuillez réessayer.');
    }
  };

  const handleUploadSubtitle = async (chapterId, contentId, file) => {
    if (!file) {
      setSubtitleError('No file selected.');
      return;
    }
    if (!file.name.toLowerCase().endswith('.vtt')) {
      setSubtitleError('Please upload a valid .vtt file.');
      return;
    }

    const formData = new FormData();
    formData.append('subtitle_file', file);

    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/subtitles/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setChapterContents(prev => ({
        ...prev,
        [chapterId]: prev[chapterId].map(c =>
          c.id === contentId ? res.data : c
        ),
      }));
      setSubtitleSuccess('Subtitle uploaded successfully!');
      setSubtitleError(null);
    } catch (err) {
      setSubtitleError(err.response?.data?.error || 'Failed to upload subtitle.');
      setSubtitleSuccess(null);
    }
  };

  const handleDeleteSubtitle = async (chapterId, contentId) => {
    if (!window.confirm('Confirm deletion of subtitle?')) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/subtitles/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setChapterContents(prev => ({
        ...prev,
        [chapterId]: prev[chapterId].map(c =>
          c.id === contentId ? { ...c, subtitle_file: null, transcript_text: '' } : c
        ),
      }));
      setSubtitleSuccess('Subtitle deleted successfully!');
      setSubtitleError(null);
    } catch (err) {
      setSubtitleError(err.response?.data?.error || 'Failed to delete subtitle.');
      setSubtitleSuccess(null);
    }
  };

  const handleDragStart = (e, chapter) => {
    setDraggedItem(chapter);
    e.dataTransfer.setData('text/plain', chapter.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetChapter) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetChapter.id) return;

    const newOrder = [...reorderedChapters];
    const draggedIndex = newOrder.findIndex(c => c.id === draggedItem.id);
    const targetIndex = newOrder.findIndex(c => c.id === targetChapter.id);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setReorderedChapters(newOrder);
    setDraggedItem(null);
  };

  const handleToggleReordering = () => {
    setShowReorderPopup(true);
    setReorderedChapters(chapters);
  };

  const handleSaveOrder = async () => {
    try {
      const csrfToken = getCookie('csrftoken');
      const item_ids = reorderedChapters.map(chapter => chapter.id);

      const response = await axios.post(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/reorder/`,
        { item_ids },
        {
          headers: {
            'X-CSRFToken': csrfToken,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setChapters(reorderedChapters);
      setShowReorderPopup(false);
      alert(response.data.detail);
    } catch (err) {
      console.error("Erreur lors de la réorganisation :", err);
      alert(err.response?.data?.detail || "Échec de l'enregistrement de l'ordre");
    }
  };

  const handleCancelReordering = () => {
    setShowReorderPopup(false);
    setReorderedChapters(chapters);
  };

  const filteredChapters = chapters.filter(chap =>
    chap.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chap.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="text-white max-w-4xl mx-auto space-y-8 p-6">
      <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-gray-400 text-transparent bg-clip-text mb-2">
        {course?.title || "Titre indisponible"}
      </h1>

      <h3 className="text-xl font-semibold mb-4 text-gray-300 flex justify-between items-center">
        <span style={{ color: '#d1d5db' }}>Course content</span>
        <div className="relative text-gray-400">
          <input
            type="text"
            placeholder="Search for a chapter..."
            className="rounded-md bg-black/30 text-white placeholder-gray-500 pl-3 pr-9 py-1 border border-transparent focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </h3>

      {isTeacher && (
        <div className="flex justify-end mb-6 space-x-2">
          <button
            onClick={handleAddChapter}
            className="btn-gradient-red flex items-center space-x-2 px-4 py-2 rounded font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#f3f4f6" strokeWidth={3} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add a chapter</span>
          </button>
          <button
            onClick={handleToggleReordering}
            className="btn-gradient-blue flex items-center space-x-2 px-4 py-2 rounded font-semibold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#f3f4f6" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m-12 6h12m-12 0l4 4m-4-4l4-4" />
            </svg>
            <span>Reorder Chapters</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filteredChapters.length > 0 ? (
          filteredChapters.map((chap) => (
            <div
              key={chap.id}
              className="p-4 rounded-lg border border-white/20 bg-black/30"
            >
              <div className="flex justify-between items-center">
                <div className="cursor-pointer flex items-center space-x-3" onClick={() => toggleChapter(chap.id)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-6 h-6 text-blue-400">
                    <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                    <line x1="7" y1="9" x2="17" y2="9" />
                    <line x1="7" y1="13" x2="17" y2="13" />
                    <line x1="7" y1="17" x2="13" y2="17" />
                  </svg>

                  {editingChapterId === chap.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        name="title"
                        value={editData.title}
                        onChange={handleEditChange}
                        className="bg-white/10 rounded px-2 py-1 text-white placeholder-gray-300"
                      />
                      <input
                        name="description"
                        value={editData.description}
                        onChange={handleEditChange}
                        className="bg-white/10 rounded px-2 py-1 text-white placeholder-gray-300"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSubmit(chap.id)}
                          className="btn-gradient-green text-sm px-3 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingChapterId(null)}
                          className="btn-gradient-gray text-sm px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-semibold">{chap.title}</h2>
                      <p className="text-gray-300">{chap.description}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <button onClick={() => toggleChapter(chap.id)} aria-label="Toggle chapitre" className="text-white hover:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 transition-transform duration-300 ${expandedChapterId === chap.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isTeacher && (
                    <>
                      <button onClick={() => handleEditChapter(chap)} title="Edit chapter" aria-label="Modifier" className="hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDeleteChapter(chap.id)} title="Delete chapter" aria-label="Supprimer" className="hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
                        </svg>
                      </button>
                      <button onClick={() => handleAddContent(chap.id)} title="Add content" aria-label="Ajouter contenu" className="hover:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {expandedChapterId === chap.id && (
                <div className="mt-4 space-y-2 text-left text-gray-300">
                  {chapterContents[chap.id] && chapterContents[chap.id].length > 0 ? (
                    chapterContents[chap.id].map(content => (
                      <div key={content.id} className="border border-white/20 p-4 rounded-lg bg-black/20 flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="#3b82f6"
                              strokeWidth={2}
                              className="w-6 h-6"
                            >
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                            <h4 className="font-semibold text-white">{content.title}</h4>
                          </div>
                          {isTeacher && (
                            <div className="flex flex-col items-end space-y-1">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditContent(content)}
                                  title="Edit content"
                                  className="text-yellow-400 hover:text-yellow-300 text-lg"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteContent(chap.id, content.id)}
                                  title="Delete content"
                                  className="text-red-500 hover:text-red-400 text-lg"
                                >
                                  🗑️
                                </button>
                                {content.content_kind === 'FILE' && content.file_mime_type?.startsWith('video/') && (
                                  <>
                                    <button
                                      title="Upload subtitle"
                                      className="text-blue-400 hover:text-blue-300 text-lg"
                                    >
                                      <label htmlFor={`subtitle-upload-${content.id}`} style={{ cursor: 'pointer' }}>
                                        📜
                                      </label>
                                      <input
                                        id={`subtitle-upload-${content.id}`}
                                        type="file"
                                        accept=".vtt"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleUploadSubtitle(chap.id, content.id, e.target.files[0])}
                                      />
                                    </button>
                                    {content.subtitle_file && (
                                      <button
                                        onClick={() => handleDeleteSubtitle(chap.id, content.id)}
                                        title="Delete subtitle"
                                        className="text-red-400 hover:text-red-300 text-lg"
                                      >
                                        🗑️
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                              <Link
                                to={`/courses/${courseId}/chapters/${chap.id}/contents/${content.id}`}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                              >
                                View More
                              </Link>
                            </div>
                          )}
                        </div>

                        {editingContentId === content.id ? (
                          <div className="space-y-2">
                            <input
                              name="title"
                              value={editContentData.title}
                              onChange={handleEditContentChange}
                              className="w-full px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                              placeholder="Title"
                            />
                            {editContentData.content_kind === 'TEXT' && (
                              <textarea
                                name="text"
                                value={editContentData.text}
                                onChange={handleEditContentChange}
                                className="w-full px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                                placeholder="Text content"
                              />
                            )}
                            {editContentData.content_kind === 'LINK' && (
                              <input
                                name="url"
                                type="url"
                                value={editContentData.url}
                                onChange={handleEditContentChange}
                                className="w-full px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                                placeholder="URL"
                              />
                            )}
                            {editContentData.content_kind === 'FILE' && (
                              <input
                                name="file"
                                type="file"
                                onChange={handleEditContentChange}
                                className="w-full text-white"
                              />
                            )}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => submitEditContent(chap.id, content.id)}
                                className="btn-gradient-green text-sm px-3 py-1 rounded"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingContentId(null)}
                                className="btn-gradient-gray text-sm px-3 py-1 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-base leading-relaxed mt-2">
                            {(content.content_kind === 'LINK' && content.url) || (content.content_kind === 'FILE' && content.file) ? (
                              <div className="flex flex-col space-y-2">
                                {(() => {
                                  const url =
                                    content.content_kind === 'LINK'
                                      ? content.url
                                      : content.content_kind === 'FILE'
                                      ? content.file
                                      : null;

                                  if (!url) {
                                    return <p className="text-gray-400">No content available.</p>;
                                  }

                                  const lowerUrl = url.toLowerCase();
                                  const getFileName = (fullUrl) => fullUrl.split('/').pop();
                                  const isImage = (u) => u.match(/\.(jpeg|jpg|gif|png|svg)$/i) !== null;
                                  const isYouTube = lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be');
                                  const isPdf = lowerUrl.endsWith('.pdf');
                                  const isVideo = lowerUrl.match(/\.(mp4)$/i);

                                  const YouTubeIcon = () => (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" stroke="none" className="inline w-6 h-6" aria-hidden="true">
                                      <path d="M23.499 6.203a2.97 2.97 0 00-2.09-2.095C19.706 3.5 12 3.5 12 3.5s-7.706 0-9.41.608a2.97 2.97 0 00-2.09 2.095A31.14 31.14 0 000 12a31.14 31.14 0 00.5 5.797 2.97 2.97 0 002.09 2.095c1.704.608 9.41.608 9.41.608s7.706 0 9.41-.608a2.97 2.97 0 002.09-2.095A31.14 31.14 0 0024 12a31.14 31.14 0 00-.501-5.797zM9.75 15.021V8.979l6 3.02-6 3.022z" />
                                    </svg>
                                  );

                                  const PdfIcon = () => (
                                    <span role="img" aria-label="PDF file" className="inline text-blue-600 text-lg">📄</span>
                                  );

                                  const ImageIcon = () => (
                                    <span role="img" aria-label="Image file" className="inline text-blue-600 text-lg">🖼️</span>
                                  );

                                  const VideoIcon = () => (
                                    <span role="img" aria-label="Video file" className="inline text-blue-600 text-lg">🎥</span>
                                  );

                                  let icon = null;
                                  let linkComponent = null;
                                  let preview = null;
                                  if (isYouTube) {
                                    icon = <YouTubeIcon />;
                                    linkComponent = (
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        {getFileName(url)}
                                      </a>
                                    );
                                    let embedUrl = url;
                                    if (url.includes('watch?v=')) {
                                      embedUrl = url.replace('watch?v=', 'embed/');
                                    } else if (url.includes('youtu.be/')) {
                                      embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/');
                                    }
                                    preview = (
                                      <div className="aspect-w-16 aspect-h-9">
                                        <iframe
                                          src={embedUrl}
                                          title="YouTube video player"
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          className="w-full h-64 rounded"
                                        />
                                      </div>
                                    );
                                  } else if (isPdf) {
                                    icon = <PdfIcon />;
                                    linkComponent = (
                                      <Link
                                        to={`/courses/${courseId}/chapters/${chap.id}/contents/${content.id}`}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        {getFileName(url)}
                                      </Link>
                                    );
                                  } else if (isImage(lowerUrl)) {
                                    icon = <ImageIcon />;
                                    linkComponent = (
                                      <Link
                                        to={`/courses/${courseId}/chapters/${chap.id}/contents/${content.id}`}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        {getFileName(url)}
                                      </Link>
                                    );
                                    preview = (
                                      <div className="flex justify-center">
                                        <img
                                          src={url}
                                          alt={getFileName(url)}
                                          className="max-w-full h-64 rounded shadow"
                                        />
                                      </div>
                                    );
                                  } else if (isVideo) {
                                    icon = <VideoIcon />;
                                    linkComponent = (
                                      <Link
                                        to={`/courses/${courseId}/chapters/${chap.id}/contents/${content.id}`}
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        {getFileName(url)}
                                      </Link>
                                    );
                                  } else {
                                    icon = <span className="text-blue-600">🔗</span>;
                                    linkComponent = (
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                      >
                                        {getFileName(url)}
                                      </a>
                                    );
                                  }

                                  return (
                                    <>
                                      <div className="flex items-center space-x-1">
                                        {icon}
                                        {linkComponent}
                                      </div>
                                      {!isTeacher && (
                                        <div className="flex justify-end">
                                          <Link
                                            to={`/courses/${courseId}/chapters/${chap.id}/contents/${content.id}`}
                                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                                          >
                                            View More
                                          </Link>
                                        </div>
                                      )}
                                      {preview}
                                    </>
                                  );
                                })()}
                              </div>
                            ) : content.text ? (
                              <div className="flex flex-col space-y-2">
                                <p className="text-base leading-relaxed whitespace-pre-line text-gray-100 font-medium">
                                  {content.text.length > MAX_LENGTH
                                    ? content.text.slice(0, MAX_LENGTH) + "..."
                                    : content.text}
                                </p>
                                {!isTeacher && content.text.length > MAX_LENGTH && (
                                  <div className="flex justify-end">
                                    <Link
                                      to={`/courses/${courseId}/chapters/${chap.id}/contents/${content.id}`}
                                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                                      >
                                      View More
                                    </Link>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-400">No content available.</p>
                            )}
                          </div>
                        )}
                        {subtitleError && <Alert color="danger" className="mt-2">{subtitleError}</Alert>}
                        {subtitleSuccess && <Alert color="success" className="mt-2">{subtitleSuccess}</Alert>}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 italic">This folder is empty.</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic text-center">No chapters available.</p>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">New Chapter</h2>
            <input
              type="text"
              placeholder="Chapter title *"
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
            />
            <textarea
              placeholder="Description *"
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white"
              value={newChapterDescription}
              onChange={(e) => setNewChapterDescription(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPopup(false)}
                className="btn-gradient-gray px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitNewChapter}
                className="btn-gradient-green px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showContentPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-center">Add New Content</h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'TEXT', label: 'Text', icon: '📝' },
                { type: 'LINK', label: 'Link', icon: '🔗' },
                { type: 'FILE', label: 'File', icon: '📁' },
                { type: 'QUIZ', label: 'Quiz', icon: '❓' },
              ].map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => setContentType(type)}
                  className={`flex flex-col items-center justify-center py-2 px-1 text-sm font-medium rounded transition text-white ${
                    contentType === type
                      ? 'btn-gradient-red'
                      : 'bg-gray-800 border border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="text-2xl">{icon}</div>
                  <div>{label}</div>
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Title *"
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white"
              value={contentForm.title}
              onChange={(e) =>
                setContentForm((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            {contentType === 'TEXT' && (
              <textarea
                placeholder="Enter text"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white"
                value={contentForm.text}
                onChange={(e) =>
                  setContentForm((prev) => ({ ...prev, text: e.target.value }))
                }
              />
            )}
            {contentType === 'LINK' && (
              <input
                type="url"
                placeholder="Enter URL"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white"
                value={contentForm.url}
                onChange={(e) =>
                  setContentForm((prev) => ({ ...prev, url: e.target.value }))
                }
              />
            )}
            {contentType === 'FILE' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Upload a file</label>
                <div className="relative w-full">
                  <input
                    type="file"
                    id="fileUpload"
                    className="absolute left-0 top-0 opacity-0 w-full h-full cursor-pointer"
                    onChange={(e) =>
                      setContentForm((prev) => ({
                        ...prev,
                        file: e.target.files[0],
                      }))
                    }
                  />
                  <label
                    htmlFor="fileUpload"
                    className="btn-gradient-red inline-block text-sm px-4 py-2 text-center cursor-pointer"
                  >
                    Choose file
                  </label>
                  {contentForm.file && (
                    <p className="mt-1 text-sm text-gray-400">
                      Selected: {contentForm.file.name}
                    </p>
                  )}
                </div>
              </div>
            )}
            {contentType === 'QUIZ' && (
              <p className="text-sm text-gray-400">Quiz creation coming soon...</p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowContentPopup(false)}
                className="btn-gradient-gray px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitContent}
                className="btn-gradient-green px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {showReorderPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Reorder Chapters</h2>
            <div className="space-y-2 max-h-[50vh] overflow-auto">
              {reorderedChapters.map((chapter) => (
                <div
                  key={chapter.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, chapter)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, chapter)}
                  className="p-2 bg-gray-700 rounded cursor-move text-white"
                >
                  {chapter.title}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelReordering}
                className="btn-gradient-gray px-4 py-2 rounded font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrder}
                className="btn-gradient-green px-4 py-2 rounded font-semibold"
              >
                Save Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;