import { useState, useEffect } from 'react';
import { AlertCircle, User, FileText, Mail,  Search } from 'lucide-react';

const AdminIssuesDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Fetch all issues from backend
  // Helper to get JWT token from localStorage
  const getToken = () => localStorage.getItem('access_token');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch('http://localhost:8000/issues/', {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Not authorized or failed to fetch issues');
        const data = await response.json();
        setIssues(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  // Filter and search issues
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = 
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.identifiantUser.toString().includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'ALL' || issue.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Update issue status
  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:8000/issues/${issueId}/update-status/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error('Not authorized or failed to update status');

      const updatedIssue = await response.json();
      setIssues(issues.map(issue => 
        issue.id === updatedIssue.id ? updatedIssue : issue
      ));
      if (selectedIssue?.id === updatedIssue.id) {
        setSelectedIssue(updatedIssue);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
      Error: {error}
    </div>
  );

  return (
    <div className="backdrop-blur-lg bg-gray-900/30 rounded-2xl p-6 shadow-xl border border-gray-700 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-gray-500 rounded-full mr-4 shadow-lg">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-gray-400">
            Issues Dashboard
          </h2>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SENT">Sent</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issues List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/30 rounded-lg border border-gray-600 overflow-hidden">
            <div className="p-4 bg-gray-700/50 border-b border-gray-600">
              <h3 className="font-medium text-gray-300">
                Reported Issues ({filteredIssues.length})
              </h3>
            </div>
            <div className="overflow-y-auto max-h-[600px]">
              {filteredIssues.length > 0 ? (
                filteredIssues.map(issue => (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssue(issue)}
                    className={`p-4 border-b border-gray-600 cursor-pointer transition-colors hover:bg-gray-700/30 ${
                      selectedIssue?.id === issue.id ? 'bg-gray-700/50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-white truncate">
                        {issue.title}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        issue.status === 'SENT' ? 'bg-blue-900/30 text-blue-300' :
                        issue.status === 'IN_PROGRESS' ? 'bg-yellow-900/30 text-yellow-300' :
                        issue.status === 'RESOLVED' ? 'bg-green-900/30 text-green-300' :
                        'bg-red-900/30 text-red-300'
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 truncate">
                      From: User #{issue.identifiantUser}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(issue.dateCreated).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-400">
                  No issues found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Issue Detail View */}
        <div className="lg:col-span-2">
          {selectedIssue ? (
            <div className="bg-gray-800/30 rounded-lg border border-gray-600 overflow-hidden">
              <div className="p-4 bg-gray-700/50 border-b border-gray-600 flex justify-between items-center">
                <h3 className="font-medium text-white">
                  Issue Details
                </h3>
                <div className="flex space-x-2">
                  <select
                    value={selectedIssue.status}
                    onChange={(e) => handleStatusUpdate(selectedIssue.id, e.target.value)}
                    className="px-3 py-1 rounded bg-gray-800 border border-gray-600 text-white text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SENT">Sent</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-white">
                    {selectedIssue.title}
                  </h4>
                  <div className="flex items-center mt-2 text-sm text-gray-400">
                    <User className="w-4 h-4 mr-1" />
                    <span>User #{selectedIssue.identifiantUser}</span>
                    <span className="mx-2">•</span>
                    <Mail className="w-4 h-4 mr-1" />
                    <span>Recipient: {selectedIssue.recipient_type}</span>
                    <span className="mx-2">•</span>
                    <span>
                      {new Date(selectedIssue.dateCreated).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">
                    Description
                  </h5>
                  <p className="text-white whitespace-pre-wrap">
                    {selectedIssue.content}
                  </p>
                </div>

                {/* Responses Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-medium text-white">
                      Responses
                    </h5>
                  </div>

                  {/* Responses will be added here when implemented */}
                  <div className="text-center text-gray-500 py-8">
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <p>No responses yet</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/30 rounded-lg border border-gray-600 p-8 text-center">
              <AlertCircle className="w-10 h-10 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                No Issue Selected
              </h3>
              <p className="text-gray-500">
                Select an issue from the list to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminIssuesDashboard;