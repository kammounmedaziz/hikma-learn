import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert } from 'reactstrap';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import axios from 'axios';
import SubtitleEdit from './SubtitleEdit.jsx';
import { ChevronDown, Upload, Edit, Trash2, Eye, Sparkles, Settings } from 'lucide-react';
import '../App.css';
import DOMPurify from 'dompurify';

// Font and size options (match RichTextEditor.jsx)
const fontOptions = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'OpenDyslexic', value: 'OpenDyslexic, sans-serif' },
  { label: 'Comic Sans', value: 'Comic Sans MS, cursive' },
];
const sizeOptions = [
  { label: '12px', value: '12px' },
  { label: '16px', value: '16px' },
  { label: '20px', value: '20px' },
  { label: '24px', value: '24px' },
];

const ContentDetail = () => {
  const { courseId, chapterId, contentId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subtitleSuccess, setSubtitleSuccess] = useState('');
  const [subtitleError, setSubtitleError] = useState('');
  const [showSubtitleEdit, setShowSubtitleEdit] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontFamily, setFontFamily] = useState(localStorage.getItem('fontFamily') || '');
  const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || '');
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
    if (content && videoRef.current && !playerRef.current) {
      const url = content.content_kind === 'LINK' ? content.url : content.content_kind === 'FILE' ? content.file : null;
      const isVideoByUrl = url?.toLowerCase()?.match(/\.(mp4)$/i) !== null;
      if (content.file_kind === "VIDEO" || isVideoByUrl) {
        console.log('Initializing video with URL:', url, 'Ref:', videoRef.current);
        setTimeout(() => {
          const player = videojs(videoRef.current, {
            controls: true,
            fluid: true,
            sources: [{
              src: url || 'https://www.w3schools.com/html/mov_bbb.mp4',
              type: content.file_kind === "VIDEO" && content.file_mime_type ? content.file_mime_type : 'video/mp4'
            }],
            textTrackSettings: true,
          }, () => {
            console.log('Player ready:', player);
            if (content.subtitle_file && typeof content.subtitle_file === 'string') {
              player.addRemoteTextTrack({
                kind: 'captions',
                src: content.subtitle_file,
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
        }, 0);
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

    if (!token) {
      setSubtitleError('Authentication token is missing.');
      setSubtitleSuccess('');
      console.log('Missing token');
      return;
    }
    try {
      console.log('Sending PATCH request to:', `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/`);
      const response = await axios.patchForm(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/`,
        { subtitle_file: file },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('API response:', response.data);
      setSubtitleSuccess('Subtitle uploaded successfully!');
      setSubtitleError('');
      const fetchContent = async () => {
        try {
          const res = await axio
s.get(
            `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setContent(res.data);
          if (playerRef.current && res.data.subtitle_file) {
            playerRef.current.addRemoteTextTrack({
              kind: 'captions',
              src: res.data.subtitle_file,
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

  const handleGenerateSubtitles = async () => {
    if (!token) {
      setSubtitleError('Authentication token is missing.');
      setSubtitleSuccess('');
      console.log('Missing token');
      return;
    }
    try {
      console.log('Sending POST request to:', `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/generate-subtitles/`);
      const response = await axios.post(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/generate-subtitles/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('API response:', response.data);
      setSubtitleSuccess('AI Subtitles generated successfully!');
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
          if (playerRef.current && res.data.subtitle_file) {
            playerRef.current.addRemoteTextTrack({
              kind: 'captions',
              src: res.data.subtitle_file,
              srcLang: 'en',
              label: 'English',
              default: true,
            }, false);
          }
        } catch (err) {
          console.error('Error reloading content:', err);
          setError('Error reloading content.');
        }
      };
      await fetchContent();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data || error.message || 'Failed to generate subtitles.';
      setSubtitleError(`Server Error ${error.response?.status}: ${errorMessage}`);
      setSubtitleSuccess('');
      console.error('Subtitle generation error:', {
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
      if (playerRef.current) {
        playerRef.current.pause();
        const tracks = playerRef.current.remoteTextTracks();
        for (let i = tracks.length - 1; i >= 0; i--) {
          playerRef.current.removeRemoteTextTrack(tracks[i]);
        }
      }
      await axios.patchForm(
        `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/`,
        { subtitle_file: '' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContent((prevContent) => {
        const updatedContent = { ...prevContent, subtitle_file: null, transcript_text: '' };
        console.log('Updated content state after deletion:', updatedContent);
        return updatedContent;
      });
      setSubtitleSuccess('Subtitle deleted successfully!');
      setSubtitleError(null);
    } catch (err) {
      setSubtitleError(err.response?.data?.error || 'Failed to delete subtitle.');
      setSubtitleSuccess(null);
      console.error('Delete subtitle error:', err);
    }
  };

  const handleSubtitleUpdate = (updatedContent) => {
    setContent(updatedContent);
    setShowSubtitleEdit(false);
    setSubtitleSuccess('Subtitle updated successfully!');
    setSubtitleError(null);
    if (playerRef.current && updatedContent.subtitle_file) {
      playerRef.current.addRemoteTextTrack({
        kind: 'captions',
        src: updatedContent.subtitle_file,
        srcLang: 'en',
        label: 'English',
        default: true,
      }, false);
    }
  };

  // Handle font and size changes
  const handleFontChange = (e) => {
    const value = e.target.value;
    setFontFamily(value);
    localStorage.setItem('fontFamily', value);
  };

  const handleSizeChange = (e) => {
    const value = e.target.value;
    setFontSize(value);
    localStorage.setItem('fontSize', value);
  };

  const renderContent = () => {
    const url = content.content_kind === 'LINK' ? content.url : content.content_kind === 'FILE' ? content.file : null;
    const lowerUrl = url?.toLowerCase();
    const isVideoByUrl = lowerUrl?.match(/\.(mp4)$/i) !== null;

    const textStyle = {
      '--content-font-size': fontSize || 'inherit',
      '--content-font-family': fontFamily || 'inherit',
    };

    if (content.content_kind === 'TEXT') {
      return (
        <div
          className="text-base leading-relaxed text-gray-100 font-medium p-4 border border-white/20 rounded-lg content-detail-rendered"
          style={textStyle}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.text) }}
        />
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

    if (content.file_kind === "IMAGE") {
      return (
        <div className="flex justify-center p-4 border border-white/20 rounded-lg">
          <img src={url} alt={content.title} className="max-w-full h-auto rounded shadow" />
        </div>
      );
    }

    if (content.file_kind === "PDF") {
      return (
        <div className="p-4 border border-white/20 rounded-lg">
          <iframe src={`http://localhost:8000/pdf/embed/${content.id}/`} title={content.title} className="w-full h-[80vh] rounded" />
        </div>
      );
    }

    if (content.file_kind === "VIDEO" || isVideoByUrl) {
      console.log('Video URL:', url, 'Subtitle URL:', content.subtitle_file, 'MIME Type:', content.file_mime_type);
      return (
        <div className="p-4 border border-white/20 rounded-lg">
          <div className="aspect-w-16 aspect-h-9">
            <video
              ref={videoRef}
              className="video-js vjs-default-skin"
              controls
              preload="auto"
            >
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
                {!content.subtitle_file && (
                  <button
                    onClick={handleGenerateSubtitles}
                    className="btn-gradient-red p-2 rounded flex items-center"
                    title="Generate AI Subtitles"
                  >
                    <Sparkles />
                  </button>
                )}
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
                {content.subtitle_file && (
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
              <div className="bg-gray-800 p-4 rounded-lg border border-white/20 flex flex-wrap gap-4">
                <div>
                  <label htmlFor="font-select" className="text-gray-100 mr-2">Font:</label>
                  <select
                    id="font-select"
                    value={fontFamily}
                    onChange={handleFontChange}
                    className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-sm"
                    aria-label="Select font type"
                  >
                    <option value="">Default Font</option>
                    {fontOptions.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="size-select" className="text-gray-100 mr-2">Size:</label>
                  <select
                    id="size-select"
                    value={fontSize}
                    onChange={handleSizeChange}
                    className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-sm"
                    aria-label="Select font size"
                  >
                    <option value="">Default Size</option>
                    {sizeOptions.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div
                className="mt-4 text-lg font-medium text-white"
                style={{ fontFamily: fontFamily || 'inherit', fontSize: fontSize || 'inherit' }}
              >
                {content.transcript_text}
              </div>
            </div>
          )}
          {isTeacher && showSubtitleEdit && content.subtitle_file && (
            <div className="mt-4">
              <SubtitleEdit
                courseId={courseId}
                chapterId={chapterId}
                contentId={contentId}
                token={token}
                subtitleUrl={content.subtitle_file}
                onSuccess={handleSubtitleUpdate}
                className="bg-gray-900 text-white"
              />
            </div>
          )}
          {subtitleError && (
            <Alert color="danger" className="mt-2" fade={true}>
              {subtitleError}
            </Alert>
          )}
          {subtitleSuccess && (
            <Alert color="success" className="mt-2" fade={true}>
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
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="btn-gradient-red p-2 rounded flex items-center"
          title={showSettings ? 'Hide Settings' : 'Show Settings'}
        >
          <Settings />
        </button>
      </div>
      {showSettings && (
        <div className="bg-gray-800 p-4 rounded-lg border border-white/20 flex flex-wrap gap-4">
          <div>
            <label htmlFor="font-select" className="text-gray-100 mr-2">Font:</label>
            <select
              id="font-select"
              value={fontFamily}
              onChange={handleFontChange}
              className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-sm"
              aria-label="Select font type"
            >
              <option value="">Default Font</option>
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="size-select" className="text-gray-100 mr-2">Size:</label>
            <select
              id="size-select"
              value={fontSize}
              onChange={handleSizeChange}
              className="px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 text-sm"
              aria-label="Select font size"
            >
              <option value="">Default Size</option>
              {sizeOptions.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <div className="mt-4">{renderContent()}</div>
    </div>
  );
};

export default ContentDetail;