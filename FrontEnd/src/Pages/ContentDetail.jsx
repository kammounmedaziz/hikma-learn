import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'reactstrap';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import axios from 'axios';
import SubtitleEdit from './SubtitleEdit.jsx';
import { ChevronDown, Upload, Edit, Trash2, Eye } from 'lucide-react';
import "../App.css";

const ContentDetail = () => {
  const { courseId, chapterId, contentId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subtitleSuccess, setSubtitleSuccess] = useState('');
  const [subtitleError, setSubtitleError] = useState('');
  const [showSubtitleEdit, setShowSubtitleEdit] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false); // New state for transcript toggle
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  const isTeacher = userType === 'teacher';

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

  useEffect(() => {
    if (content && videoRef.current) {
      const url = content.content_kind === 'LINK' ? content.url : content.content_kind === 'FILE' ? content.file : null;
      const lowerUrl = url?.toLowerCase();
      const isVideo = (u) => u?.match(/\.(mp4)$/i) !== null;

      if (isVideo(lowerUrl) && !playerRef.current) {
        console.log('Initializing video with URL:', url, 'Ref:', videoRef.current); // Debug timing
        setTimeout(() => {
          const player = videojs(videoRef.current, {
            controls: true,
            fluid: true,
            sources: [{ src: url || 'https://www.w3schools.com/html/mov_bbb.mp4', type: 'video/mp4' }],
            textTrackSettings: true,
          }, () => {
            console.log('Player ready:', player);
            if (content.subtitle_file_url && typeof content.subtitle_file_url === 'string') {
              player.addRemoteTextTrack({
                kind: 'captions',
                src: content.subtitle_file_url,
                srcLang: 'en',
                label: 'English',
                default: true,
              }, false);
            }
          });
          playerRef.current = player;

          return () => {
            if (playerRef.current) {
              playerRef.current.dispose();
              playerRef.current = null;
            }
          };
        }, 0); // Delay to ensure DOM readiness
      }
    }
  }, [content]);

  const handleUploadSubtitle = async (file) => {
    if (!file) {
      console.log('No file provided');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.vtt')) {
      setSubtitleError('Please upload a .vtt file.');
      setSubtitleSuccess('');
      console.log('Invalid file extension:', file.name);
      return;
    }
    const formData = new FormData();
    formData.append('subtitle_file', file);

    if (!token) {
      setSubtitleError('Authentication token is missing.');
      setSubtitleSuccess('');
      console.log('Missing token');
      return;
    }
    try {
      console.log('Sending POST request to:', `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/upload-subtitles/`);
      const response = await axios.post(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/upload-subtitles/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('API response:', response.data);
      setSubtitleSuccess('Subtitle uploaded successfully!');
      setSubtitleError('');
      const fetchContent = async () => {
        try {
          const res = await axios.get(
            `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setContent(res.data);
          if (playerRef.current && res.data.subtitle_file_url) {
            playerRef.current.addRemoteTextTrack({
              kind: 'captions',
              src: res.data.subtitle_file_url,
              srcLang: 'en',
              label: 'English',
              default: true,
            }, false);
          }
        } catch (err) {
          console.error("Erreur lors du re-chargement du contenu :", err);
          setError("Erreur lors du re-chargement du contenu.");
        }
      };
      await fetchContent();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data || error.message || 'Failed to upload subtitle. Please try again.';
      setSubtitleError(`Server Error ${error.response?.status}: ${errorMessage}`);
      setSubtitleSuccess('');
      console.error('Subtitle upload error:', {
        status: error.response?.status,
        message: errorMessage,
        responseData: error.response?.data,
        stack: error.stack,
      });
    }
  };

  const handleDeleteSubtitle = async () => {
    if (!window.confirm('Confirm deletion of subtitle?')) return;
    try {
      await axios.delete(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/subtitles/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setContent({ ...content, subtitle_file_url: null, transcript_text: '' });
      if (playerRef.current) {
        const tracks = playerRef.current.remoteTextTracks();
        for (let i = tracks.length - 1; i >= 0; i--) {
          playerRef.current.removeRemoteTextTrack(tracks[i]);
        }
      }
      setSubtitleSuccess('Subtitle deleted successfully!');
      setSubtitleError(null);
    } catch (err) {
      setSubtitleError(err.response?.data?.error || 'Failed to delete subtitle.');
      setSubtitleSuccess(null);
    }
  };

  const handleSubtitleUpdate = (updatedContent) => {
    setContent(updatedContent);
    setShowSubtitleEdit(false);
    setSubtitleSuccess('Subtitle updated successfully!');
    setSubtitleError(null);
    if (playerRef.current && updatedContent.subtitle_file_url) {
      playerRef.current.addRemoteTextTrack({
        kind: 'captions',
        src: updatedContent.subtitle_file_url,
        srcLang: 'en',
        label: 'English',
        default: true,
      }, false);
    }
  };

    const renderContent = () => {
      const url = content.content_kind === 'LINK' ? content.url : content.content_kind === 'FILE' ? content.file : null;
      const lowerUrl = url?.toLowerCase();
      const isImage = (u) => u?.match(/\.(jpeg|jpg|gif|png|svg)$/i) !== null;
      const isVideo = (u) => u?.match(/\.(mp4)$/i) !== null;

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
            <img src={url} alt={content.title} className="max-w-full h-auto rounded shadow" />
          </div>
        );
      }

      if (lowerUrl?.endsWith('.pdf')) {
        return (
          <div className="p-4 border border-white/20 rounded-lg">
            <iframe src={url} title={content.title} className="w-full h-[80vh] rounded" />
          </div>
        );
      }

      if (isVideo(lowerUrl)) {
        console.log('Video URL:', url, 'Subtitle URL:', content.subtitle_file_url, 'MIME Type:', content.file_mime_type);
        return (
          <div className="p-4 border border-white/20 rounded-lg">
            <div className="aspect-w-16 aspect-h-9">
              <video
                ref={videoRef}
                className="video-js vjs-default-skin"
                controls
                preload="auto"
              >
                <source src={url || 'https://www.w3schools.com/html/mov_bbb.mp4'} type="video/mp4" />
                {content.subtitle_file_url && typeof content.subtitle_file_url === 'string' && (
                  <track kind="captions" src={content.subtitle_file_url} srcLang="en" label="English" default />
                )}
              </video>
            </div>
            <div className="mt-4 flex space-x-4 justify-center">
              {content.transcript_text && (
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="btn-gradient-red p-2 rounded flex items-center"
                  title={showTranscript ? 'Hide Transcript' : 'Show Transcript'}
                >
                  {showTranscript ? <Eye /> : <ChevronDown />}
                </button>
              )}
              {isTeacher && (
                <>
                  <label
                    htmlFor="subtitle-upload"
                    className="btn-gradient-red p-2 rounded flex items-center cursor-pointer"
                    title="Upload Subtitle"
                  >
                    <Upload />
                    <input
                      id="subtitle-upload"
                      type="file"
                      accept=".vtt"
                      style={{ display: 'none' }}
                      onChange={(e) => handleUploadSubtitle(e.target.files[0])}
                    />
                  </label>
                  {content.subtitle_file_url && (
                    <>
                      <button
            onClick={() => setShowSubtitleEdit(!showSubtitleEdit)}
            className="btn-gradient-red p-2 rounded flex items-center"
            title={showSubtitleEdit ? 'Cancel Edit' : 'Edit Subtitle'}
          >
                        <Edit />
                      </button>
                      <button
                        onClick={handleDeleteSubtitle}
                        className="btn-gradient-red p-2 rounded flex items-center"
                        title="Delete Subtitle"
                      >
                        <Trash2 />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
            {showTranscript && content.transcript_text && (
              <div className="mt-4">
                <p className="text-lg font-medium text-white">
                  {content.transcript_text}
                </p>
              </div>
            )}
            {isTeacher && showSubtitleEdit && content.subtitle_file_url && (
          <div className="mt-4">
            <SubtitleEdit
              courseId={courseId}
              chapterId={chapterId}
              contentId={contentId}
              token={token}
              subtitleUrl={content.subtitle_file_url}
              onSuccess={handleSubtitleUpdate}
              className="bg-gray-900 text-white" // Pass className to SubtitleEdit if it accepts it
            />
          </div>
        )}
            {subtitleError && (
              <Alert color="danger" className="mt-2" timeout={3000}>
                {subtitleError}
              </Alert>
            )}
            {subtitleSuccess && (
              <Alert color="success" className="mt-2" timeout={3000}>
                {subtitleSuccess}
              </Alert>
            )}
          </div>
        );
      }
      return (
        <div className="p-4 border border-white/20 rounded-lg">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline">
            {url.split('/').pop()}
          </a>
        </div>
      );
    };

    /*
  return (
        <div className="p-4 border border-white/20 rounded-lg">
          <video
            controls
            className="w-full h-auto rounded"
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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
          {url.split('/').pop()}
        </a>
      </div>
    );
*/

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