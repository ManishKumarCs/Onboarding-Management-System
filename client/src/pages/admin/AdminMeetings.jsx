import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Clock,
  Users,
  MapPin,
  Video,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import axios from 'axios';

const AdminMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    attendees: [],
    meetingDate: '',
    duration: 60,
    meetingType: 'one-on-one',
    location: '',
    meetingLink: '',
    agenda: []
  });

  const [agendaItem, setAgendaItem] = useState({ item: '', duration: '' });

  useEffect(() => {
    fetchMeetings();
    fetchEmployees();
  }, [statusFilter, typeFilter]);

  const fetchMeetings = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('meetingType', typeFilter);

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/all?${params}`);
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
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

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/schedule`, newMeeting);
      setShowCreateModal(false);
      setNewMeeting({
        title: '',
        description: '',
        attendees: [],
        meetingDate: '',
        duration: 60,
        meetingType: 'one-on-one',
        location: '',
        meetingLink: '',
        agenda: []
      });
      fetchMeetings();
    } catch (error) {
      console.error('Error creating meeting:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addAgendaItem = () => {
    if (agendaItem.item.trim()) {
      setNewMeeting({
        ...newMeeting,
        agenda: [...newMeeting.agenda, agendaItem]
      });
      setAgendaItem({ item: '', duration: '' });
    }
  };

  const removeAgendaItem = (index) => {
    setNewMeeting({
      ...newMeeting,
      agenda: newMeeting.agenda.filter((_, i) => i !== index)
    });
  };

  const updateMeetingStatus = async (meetingId, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/${meetingId}/status`, { status });
      fetchMeetings();
    } catch (error) {
      console.error('Error updating meeting status:', error);
    }
  };

  const getMeetingTypeColor = (type) => {
    const colors = {
      'one-on-one': 'bg-blue-100 text-blue-800',
      'team': 'bg-purple-100 text-purple-800',
      'department': 'bg-indigo-100 text-indigo-800',
      'all-hands': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meeting Management</h1>
              <p className="text-gray-600 mt-1">Schedule and manage employee meetings</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5 mr-2" />
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Meetings</p>
              <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-yellow-600">
                {meetings.filter(m => m.status === 'scheduled').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {meetings.filter(m => m.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-blue-600">
                {meetings.filter(m => {
                  const meetingDate = new Date(m.meetingDate);
                  const now = new Date();
                  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return meetingDate >= now && meetingDate <= weekFromNow;
                }).length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
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
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="all">All Types</option>
              <option value="one-on-one">One-on-One</option>
              <option value="team">Team</option>
              <option value="department">Department</option>
              <option value="all-hands">All Hands</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Meetings ({filteredMeetings.length})</h2>
        </div>
        
        {filteredMeetings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-600">Schedule your first meeting to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMeetings.map((meeting) => (
              <div key={meeting._id} className="p-8 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{meeting.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMeetingTypeColor(meeting.meetingType)}`}>
                        {meeting.meetingType.replace('-', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(meeting.status)}`}>
                        {meeting.status}
                      </span>
                    </div>
                    
                    {meeting.description && (
                      <p className="text-gray-700 mb-4">{meeting.description}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(meeting.meetingDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Time</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(meeting.meetingDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="font-semibold text-gray-900">{meeting.duration} minutes</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Attendees</p>
                          <p className="font-semibold text-gray-900">{meeting.attendees.length}</p>
                        </div>
                      </div>
                    </div>

                    {(meeting.location || meeting.meetingLink) && (
                      <div className="flex items-center space-x-6 mb-4">
                        {meeting.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-700">{meeting.location}</span>
                          </div>
                        )}
                        {meeting.meetingLink && (
                          <div className="flex items-center space-x-2">
                            <Video className="h-5 w-5 text-gray-400" />
                            <a 
                              href={meeting.meetingLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              Join Meeting
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Attendees</p>
                      <div className="flex flex-wrap gap-2">
                        {meeting.attendees.map((attendee, index) => (
                          <div key={index} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                            <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {attendee.employee.fullName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">{attendee.employee.fullName}</span>
                            {attendee.status !== 'pending' && (
                              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(attendee.status)}`}>
                                {attendee.status}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <select
                      value={meeting.status}
                      onChange={(e) => updateMeetingStatus(meeting._id, e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Schedule Meeting</h2>
              
              <form onSubmit={handleCreateMeeting} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meeting Title
                  </label>
                  <input
                    type="text"
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    placeholder="Weekly Team Sync"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newMeeting.description}
                    onChange={(e) => setNewMeeting({...newMeeting, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                    placeholder="Meeting description..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meeting Type
                    </label>
                    <select
                      value={newMeeting.meetingType}
                      onChange={(e) => setNewMeeting({...newMeeting, meetingType: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="one-on-one">One-on-One</option>
                      <option value="team">Team Meeting</option>
                      <option value="department">Department Meeting</option>
                      <option value="all-hands">All Hands</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={newMeeting.duration}
                      onChange={(e) => setNewMeeting({...newMeeting, duration: parseInt(e.target.value)})}
                      min="15"
                      max="480"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newMeeting.meetingDate}
                    onChange={(e) => setNewMeeting({...newMeeting, meetingDate: e.target.value})}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Attendees
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-4">
                    {employees.map((employee) => (
                      <label key={employee._id} className="flex items-center space-x-3 py-2">
                        <input
                          type="checkbox"
                          checked={newMeeting.attendees.includes(employee._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewMeeting({
                                ...newMeeting,
                                attendees: [...newMeeting.attendees, employee._id]
                              });
                            } else {
                              setNewMeeting({
                                ...newMeeting,
                                attendees: newMeeting.attendees.filter(id => id !== employee._id)
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={newMeeting.location}
                      onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="Conference Room A"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meeting Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={newMeeting.meetingLink}
                      onChange={(e) => setNewMeeting({...newMeeting, meetingLink: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                      placeholder="https://zoom.us/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Agenda Items
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={agendaItem.item}
                        onChange={(e) => setAgendaItem({...agendaItem, item: e.target.value})}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Agenda item..."
                      />
                      <input
                        type="number"
                        value={agendaItem.duration}
                        onChange={(e) => setAgendaItem({...agendaItem, duration: e.target.value})}
                        className="w-24 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Min"
                      />
                      <button
                        type="button"
                        onClick={addAgendaItem}
                        className="px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    
                    {newMeeting.agenda.length > 0 && (
                      <div className="space-y-2">
                        {newMeeting.agenda.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="text-gray-900">{item.item}</span>
                            <div className="flex items-center space-x-2">
                              {item.duration && (
                                <span className="text-gray-500 text-sm">{item.duration} min</span>
                              )}
                              <button
                                type="button"
                                onClick={() => removeAgendaItem(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                    disabled={submitting}
                    className="flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-5 w-5 mr-2" />
                        Schedule Meeting
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

export default AdminMeetings;