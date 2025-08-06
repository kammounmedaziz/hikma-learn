import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import axios from 'axios';

const SubtitleEdit = ({ courseId, chapterId, contentId, onSuccess, token }) => {
  const [subtitleContent, setSubtitleContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchSubtitleContent = async () => {
      const url = `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/edit-subtitles/`;
      console.log('Sending GET request to:', url);
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setSubtitleContent(response.data.subtitle_content || '');
      } catch (err) {
        setError('Failed to load subtitle content.');
        console.error('Fetch subtitle error:', err.response?.data, err);
      }
    };
    fetchSubtitleContent();
  }, [courseId, chapterId, contentId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!subtitleContent.trim()) {
      setError('Subtitle content cannot be empty.');
      setLoading(false);
      return;
    }

    const url = `http://127.0.0.1:8000/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/edit-subtitles/`;
    console.log('Sending POST request to:', url);

    try {
      const response = await axios.post(
        url,
        { subtitle_content: subtitleContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccess('Subtitle updated successfully!');
      onSuccess(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        `Failed to update subtitle. Status: ${err.response?.status || 'unknown'}.`;
      setError(errorMessage);
      console.error('Subtitle update error:', err.response?.data, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label for="subtitleContent">Subtitle Content</Label>
        <Input
          type="textarea"
          name="subtitleContent"
          id="subtitleContent"
          value={subtitleContent}
          onChange={(e) => setSubtitleContent(e.target.value)}
          rows="10"
        />
      </FormGroup>
      {error && <Alert color="danger" className="mt-2" fade={true} timeout={3000}>{error}</Alert>}
      {success && <Alert color="success" className="mt-2" fade={true} timeout={3000}>{success}</Alert>}
      <Button color="primary" type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Subtitles'}
      </Button>
    </Form>
  );
};

export default SubtitleEdit;