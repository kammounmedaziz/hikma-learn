import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';


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
  const isTeacher = userType == 'teacher';

  // Fonction pour récupérer le cookie CSRF
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

  const fetchCourse = axios.get(`http://127.0.0.1:8000/courses/${courseId}/`, { headers: { Authorization: `Bearer ${token}` } });
  const fetchChapters = axios.get(`http://127.0.0.1:8000/courses/${courseId}/chapters/`, { headers: { Authorization: `Bearer ${token}` } });
  Promise.all([fetchCourse, fetchChapters, ])
    .then(([courseRes, chaptersRes]) => {
      setCourse(courseRes.data);
      setChapters(chaptersRes.data);
    })
    .catch(err => {
      console.error(err);
      setError("Erreur lors du chargement des données.");
    })
    .finally(() => setLoading(false));
  }, [courseId]);


  const toggleChapter = (id) => {
    setExpandedChapterId(prev => (prev === id ? null : id));
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
            'X-CSRFToken': csrfToken, Authorization: `Bearer ${token}`
          },
        }
      );

      const updated = chapters.map(chap =>
        chap.id === chapterId ? res.data : chap
      );
      setChapters(updated);
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
            'X-CSRFToken': csrfToken, Authorization: `Bearer ${token}`
        },
      });
      setChapters(prev => prev.filter(c => c.id !== chapterId));
    } catch (err) {
      console.error("Erreur de suppression :", err);
      alert("Échec de la suppression");
    }
  };

  const handleAddContent = (chapterId) => {
    alert("Ajouter un contenu - fonction à implémenter");
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
            'X-CSRFToken': csrfToken, Authorization: `Bearer ${token}`
          },
        }
      );
      setChapters([...chapters, res.data]);
      setShowPopup(false);
      setNewChapterTitle('');
      setNewChapterDescription('');
    } catch (err) {
      console.error("Erreur d'ajout :", err);
      alert("Erreur lors de l'ajout du chapitre");
    }
  };

  // Filtrer les chapitres selon searchTerm
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
        <span>Course content</span>
        <div className="relative text-gray-400">
          <input
            type="text"
            placeholder="Search for a chapter..."
            className="rounded-md bg-black/30 text-white placeholder-gray-500 pl-3 pr-9 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
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
      <div className="flex justify-end mb-6">
        <button
          onClick={handleAddChapter}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#f3f4f6" strokeWidth={3} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add a chapter</span>
        </button>
      </div>
      )}

      <div className="space-y-4">
        {filteredChapters.length > 0 ? (
          filteredChapters.map((chap, index) => (
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
                      <button
                        onClick={() => handleEditSubmit(chap.id)}
                        className="text-sm text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
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
                    <button onClick={() => handleEditChapter(chap)} title="Edit chapter" aria-label="Modifier" className="hover:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                  )}

                  {isTeacher && (
                    <button onClick={() => handleDeleteChapter(chap.id)} title="Delete chapter" aria-label="Supprimer" className="hover:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
                      </svg>
                    </button>
                  )}

                  {isTeacher && (
                    <button onClick={() => handleAddContent(chap.id)} title="Add content" aria-label="Ajouter contenu" className="hover:text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {expandedChapterId === chap.id && (
                <div className="mt-4 text-center text-gray-400 italic">
                  This folder is empty.
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
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitNewChapter}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
