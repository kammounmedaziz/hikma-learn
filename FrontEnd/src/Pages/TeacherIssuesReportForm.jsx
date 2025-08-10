import { useState } from 'react';
import { AlertCircle, User, FileText, Mail, Save, X } from 'lucide-react';

const TeacherIssuesReportForm = ({ teacherId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    identifiantUser: teacherId || '', // Pre-fill if teacherId provided
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Helper to get JWT token from localStorage
      const getToken = () => localStorage.getItem('access_token');

      const response = await fetch('http://localhost:8000/issues/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          ...formData,
          identifiantRec: 1, // Hardcoded admin ID (adjust as needed)
          recipient_type: 'ADMIN', // Always goes to admin
          status: 'SENT' // Default status
        }),
      });

      if (!response.ok) {
        throw new Error('Not authorized or failed to submit issue');
      }

      const newIssue = await response.json();
      if (onSubmit) onSubmit(newIssue);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-8 shadow-xl border border-gray-700 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-gray-500 rounded-full mr-4 shadow-lg">
            <Save className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-gray-400">
            Report Submitted!
          </h2>
        </div>
        <div className="text-center text-gray-300">
          <p>Your report has been sent to the administration team.</p>
          <p className="mt-2 text-green-400">Reference: #{Date.now().toString().slice(-6)}</p>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({
                title: '',
                content: '',
                identifiantUser: teacherId || ''
              });
            }}
            className="mt-6 px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition hover:scale-105 shadow-lg"
          >
            New Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-8 shadow-xl border border-gray-700 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-gray-500 rounded-full mr-4 shadow-lg">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-gray-400">
            Teacher Report Form
          </h2>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Teacher ID (hidden if pre-filled) */}
      {!teacherId && (
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Your Teacher ID *
          </label>
          <input
            type="text"
            name="identifiantUser"
            value={formData.identifiantUser}
            onChange={handleChange}
            placeholder="Enter your teacher ID"
            className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
            required
          />
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Report Title *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Brief summary of your report"
          className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Detailed Report *
        </label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Please include all relevant details"
          className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 h-40"
          required
        />
      </div>

      {/* Recipient Info (readonly) */}
      <div className="p-4 bg-gray-800/30 border border-gray-600 rounded-lg">
        <div className="flex items-center text-gray-300">
          <Mail className="w-5 h-5 mr-3 text-red-400" />
          <div>
            <p className="font-medium">This report will be sent to:</p>
            <p className="text-sm">Administration</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition hover:scale-105 shadow-lg flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Submit Report
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TeacherIssuesReportForm;