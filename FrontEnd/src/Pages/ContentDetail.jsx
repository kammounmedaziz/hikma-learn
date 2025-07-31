import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../App.css";

const ContentDetail = () => {
  const { courseId, chapterId, contentId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setContent(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement du contenu :", err);
        setError("Erreur lors du chargement du contenu.");
        setLoading(false);
      }
    };

    fetchContent();
  }, [courseId, chapterId, contentId, token]);

  const renderContent = () => {
    const url = content.content_kind === 'LINK' ? content.url : content.content_kind === 'FILE' ? content.file : null;
    const lowerUrl = url?.toLowerCase();
    const isImage = (u) => u?.match(/\.(jpeg|jpg|gif|png|svg)$/i) !== null;

    if (content.content_kind === 'TEXT') {
      return (
        <div className="whitespace-pre-line text-gray-100 font-medium p-4 border border-white/20 rounded-lg">
          {content.text}
        </div>
      );
    }

    if (lowerUrl?.includes('youtube.com') || lowerUrl?.includes('youtu.be')) {
      let embedUrl = url;
      if (url.includes('watch?v=')) {
        embedUrl = url.replace('watch?v=', 'embed/');
      } else if (url.includes('youtu.be/')) {
        embedUrl = url.replace('youtu.be/', 'www.youtube.com/embed/');
      }
      return (
        <div className="aspect-w-16 aspect-h-9 p-4 border border-white/20 rounded-lg">
          <iframe
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-96 rounded"
          />
        </div>
      );
    }

    if (isImage(lowerUrl)) {
      return (
        <div className="flex justify-center p-4 border border-white/20 rounded-lg">
          <img
            src={url}
            alt={content.title}
            className="max-w-full h-auto rounded shadow"
          />
        </div>
      );
    }

    if (lowerUrl?.endsWith('.pdf')) {
      return (
        <div className="p-4 border border-white/20 rounded-lg">
          <iframe
            src={url}
            title={content.title}
            className="w-full h-[80vh] rounded"
          />
        </div>
      );
    }

    return (
      <div className="p-4 border border-white/20 rounded-lg">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {url}
        </a>
      </div>
    );
  };

  if (loading) return <p className="text-gray-400">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!content) return <p className="text-gray-400">No content available.</p>;

  return (
    <div className="text-white max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          title="Back to Course"
          className="text-white hover:text-gray-300 text-2xl"
        >
          ⬅️
        </button>
        <h1 className="text-3xl font-bold">{content.title}</h1>
      </div>
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
};

export default ContentDetail;