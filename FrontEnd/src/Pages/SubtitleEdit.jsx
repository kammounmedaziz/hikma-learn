import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, Alert } from 'reactstrap';
import axios from 'axios';

const SubtitleEdit = ({ courseId, chapterId, contentId, token, subtitleUrl, onSuccess }) => {
  const [subtitleContent, setSubtitleContent] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subtitleUrl) {
      fetch(subtitleUrl)
        .then((response) => response.text())
        .then((data) => setSubtitleContent(data))
        .catch(() => setError('Failed to load subtitle content.'));
    }
  }, [subtitleUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/edit-subtitles/`,
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
      setError(err.response?.data?.error || 'Failed to update subtitle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label for="subtitleContent" className="text-gray-300">Edit Subtitle (.vtt)</Label>
        <Input
  type="textarea"
  id="subtitleContent"
  value={subtitleContent}
  onChange={(e) => setSubtitleContent(e.target.value)}
  rows={10}
  className="bg-gray-800 text-white border-gray-600"
  style={{
    backgroundColor: '#1a202c',
    color: '#ffffff',
    borderColor: '#4a5568',
    ':focus': {
      backgroundColor: '#1a202c', // Maintain dark background on focus
      color: '#ffffff',
      borderColor: '#4a5568',
      outline: 'none', // Remove default focus outline if unwanted
      boxShadow: 'none', // Remove default focus shadow if present
    },
  }}
  placeholder="Enter WebVTT content (e.g., WEBVTT\n\n00:00:01.000 --> 00:00:04.000\nText)"
/>
      </FormGroup>
      <Button color="primary" type="submit" disabled={loading || !subtitleContent}>
        {loading ? 'Saving...' : 'Save Subtitle'}
      </Button>
      {error && <Alert color="danger" className="mt-2">{error}</Alert>}
      {success && <Alert color="success" className="mt-2">{success}</Alert>}
    </Form>
  );
};

export default SubtitleEdit;