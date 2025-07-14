import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';

const Broadcasts = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBroadcasts();
  }, [filter]);

  const fetchBroadcasts = async () => {
    try {
      const params = filter === 'unread' ? '?unreadOnly=true' : '';
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/broadcasts/my-broadcasts${params}`);
      setBroadcasts(response.data.broadcasts);
    } catch (error) {
      console.error('Error fetching broadcasts:', error);
    } finally {
      setLoading(false);
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

  const downloadAttachment = (broadcastId, attachmentId, fileName) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/api/broadcasts/${broadcastId}/attachments/${attachmentId}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
              <Megaphone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
              <p className="text-gray-600 mt-1">Company-wide announcements and updates</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Broadcasts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Messages ({broadcasts.length})</h2>
        </div>
        
        {broadcasts.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread messages' : 'No announcements yet'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? 'You\'re all caught up!' 
                : 'Company announcements will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {broadcasts.map((broadcast) => {
              const userRecipient = broadcast.recipients.find(r => r.employee);
              const isRead = userRecipient?.isRead;
              
              return (
                <div key={broadcast._id} className={`p-8 hover:bg-gray-50 transition-colors ${!isRead ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {isRead ? (
                        <EyeOff className="h-6 w-6 text-gray-400" />
                      ) : (
                        <Eye className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`text-xl font-bold ${!isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {broadcast.title}
                            </h3>
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
                            {broadcast.expiresAt && (
                              <>
                                <span>•</span>
                                <span>Expires: {new Date(broadcast.expiresAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="prose max-w-none mb-6">
                        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {broadcast.message}
                        </p>
                      </div>

                      {broadcast.attachments && broadcast.attachments.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Attachments</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {broadcast.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-xl">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-5 w-5 text-gray-500" />
                                  <span className="text-sm text-gray-700 font-medium">
                                    {attachment.fileName}
                                  </span>
                                </div>
                                <button
                                  onClick={() => downloadAttachment(broadcast._id, attachment._id, attachment.fileName)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Download"
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!isRead && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          <span className="font-medium">New message</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Broadcasts;