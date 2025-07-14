import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Filter,
  Send,
  FileText,
  Users,
  Eye,
  EyeOff,
  AlertTriangle,
  Clock
} from 'lucide-react';
import axios from 'axios';

const AdminBroadcasts = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [newBroadcast, setNewBroadcast] = useState({
    title: '',
    message: '',
    recipients: [],
    broadcastType: 'general',
    priority: 'medium',
    expiresAt: ''
  });

  useEffect(() => {
    fetchBroadcasts();
    fetchEmployees();
  }, [typeFilter, priorityFilter]);

  const fetchBroadcasts = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('broadcastType', typeFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/broadcasts/all?${params}`);
      setBroadcasts(response.data.broadcasts);
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/employees/all`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(newBroadcast).forEach(key => {
        if (key === 'recipients') {
          newBroadcast[key].forEach(recipient => {
            formData.append('recipients', recipient);
          });
        } else {
          formData.append(key, newBroadcast[key]);
        }
      });

      selectedFiles.forEach(file => {
        formData.append('attachments', file);
      });

      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/broadcasts/send`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowCreateModal(false);
      setNewBroadcast({
        title: '',
        message: '',
        recipients: [],
        broadcastType: 'general',
        priority: 'medium',
        expiresAt: ''
      });
      setSelectedFiles([]);
      fetchBroadcasts();
    } catch (error) {
      console.error('Error creating broadcast:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getBroadcastTypeColor = (type) => {
    const colors = {
      announcement: 'bg-blue-100 text-blue-800',
      urgent: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800',
      policy: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredBroadcasts = broadcasts.filter(broadcast =>
    broadcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    broadcast.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectAllEmployees = () => {
    setNewBroadcast({
      ...newBroadcast,
      recipients: employees.map(emp => emp._id)
    });
  };

  const clearAllEmployees = () => {
    setNewBroadcast({
      ...newBroadcast,
      recipients: []
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
              <Megaphone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Broadcast Management</h1>
              <p className="text-gray-600 mt-1">Send announcements and updates to employees</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5 mr-2" />
            Send Broadcast
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Broadcasts</p>
              <p className="text-2xl font-bold text-gray-900">{broadcasts.length}</p>
            </div>
            <Megaphone className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-blue-600">
                {broadcasts.filter(b => {
                  const broadcastDate = new Date(b.createdAt);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return broadcastDate >= weekAgo;
                }).length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgent Messages</p>
              <p className="text-2xl font-bold text-red-600">
                {broadcasts.filter(b => b.priority === 'urgent').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recipients</p>
              <p className="text-2xl font-bold text-green-600">
                {broadcasts.reduce((total, b) => total + b.recipients.length, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search broadcasts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Types</option>
              <option value="announcement">Announcement</option>
              <option value="urgent">Urgent</option>
              <option value="general">General</option>
              <option value="policy">Policy</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Broadcasts List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Broadcasts ({filteredBroadcasts.length})</h2>
        </div>
        
        {filteredBroadcasts.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No broadcasts found</h3>
            <p className="text-gray-600">Send your first broadcast to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredBroadcasts.map((broadcast) => (
              <div key={broadcast._id} className="p-8 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <Megaphone className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{broadcast.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBroadcastTypeColor(broadcast.broadcastType)}`}>
                        {broadcast.broadcastType}
                      </span>
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(broadcast.priority)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(broadcast.priority)}`}>
                          {broadcast.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span>From: {broadcast.sender.email}</span>
                      <span>•</span>
                      <span>{new Date(broadcast.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(broadcast.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span>•</span>
                      <span>{broadcast.recipients.length} recipients</span>
                      {broadcast.expiresAt && (
                        <>
                          <span>•</span>
                          <span>Expires: {new Date(broadcast.expiresAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="prose max-w-none mb-4">
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {broadcast.message.length > 200 
                          ? `${broadcast.message.substring(0, 200)}...` 
                          : broadcast.message
                        }
                      </p>
                    </div>

                    {broadcast.attachments && broadcast.attachments.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Attachments</p>
                        <div className="flex flex-wrap gap-2">
                          {broadcast.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-700">{attachment.fileName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>
                          {broadcast.recipients.filter(r => r.isRead).length} read
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <EyeOff className="h-4 w-4" />
                        <span>
                          {broadcast.recipients.filter(r => !r.isRead).length} unread
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Broadcast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Broadcast</h2>
              
              <form onSubmit={handleCreateBroadcast} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newBroadcast.title}
                    onChange={(e) => setNewBroadcast({...newBroadcast, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Important Company Update"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newBroadcast.message}
                    onChange={(e) => setNewBroadcast({...newBroadcast, message: e.target.value})}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    placeholder="Type your message here..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      value={newBroadcast.broadcastType}
                      onChange={(e) => setNewBroadcast({...newBroadcast, broadcastType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="general">General</option>
                      <option value="announcement">Announcement</option>
                      <option value="urgent">Urgent</option>
                      <option value="policy">Policy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={newBroadcast.priority}
                      onChange={(e) => setNewBroadcast({...newBroadcast, priority: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newBroadcast.expiresAt}
                    onChange={(e) => setNewBroadcast({...newBroadcast, expiresAt: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Select Recipients
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={selectAllEmployees}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearAllEmployees}
                        className="text-sm text-gray-600 hover:text-gray-700"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-4">
                    {employees.map((employee) => (
                      <label key={employee._id} className="flex items-center space-x-3 py-2">
                        <input
                          type="checkbox"
                          checked={newBroadcast.recipients.includes(employee._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewBroadcast({
                                ...newBroadcast,
                                recipients: [...newBroadcast.recipients, employee._id]
                              });
                            } else {
                              setNewBroadcast({
                                ...newBroadcast,
                                recipients: newBroadcast.recipients.filter(id => id !== employee._id)
                              });
                            }
                          }}
                          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                        <span className="text-gray-900">{employee.fullName}</span>
                        <span className="text-gray-500 text-sm">({employee.department})</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {newBroadcast.recipients.length} of {employees.length} employees selected
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Attachments (Optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.zip"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Upload documents, images, or other files (Max 10MB per file)
                  </p>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || newBroadcast.recipients.length === 0}
                    className="flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Broadcast
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBroadcasts;