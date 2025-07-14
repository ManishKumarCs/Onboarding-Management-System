import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Video, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  User
} from 'lucide-react';
import axios from 'axios';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/my-meetings`);
      setMeetings(response.data.meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToMeeting = async (meetingId, status) => {
    setResponding(meetingId);
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/meetings/${meetingId}/respond`, { status });
      fetchMeetings();
    } catch (error) {
      console.error('Error responding to meeting:', error);
    } finally {
      setResponding(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
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

  const isUpcoming = (meetingDate) => {
    return new Date(meetingDate) > new Date();
  };

  const isPast = (meetingDate) => {
    return new Date(meetingDate) < new Date();
  };

  const upcomingMeetings = meetings.filter(meeting => isUpcoming(meeting.meetingDate));
  const pastMeetings = meetings.filter(meeting => isPast(meeting.meetingDate));

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
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meetings</h1>
            <p className="text-gray-600 mt-1">View and manage your scheduled meetings</p>
          </div>
        </div>
      </div>

      {/* Upcoming Meetings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Meetings ({upcomingMeetings.length})</h2>
        </div>
        
        {upcomingMeetings.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
            <p className="text-gray-600">You don't have any meetings scheduled</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingMeetings.map((meeting) => {
              const userAttendee = meeting.attendees.find(a => a.employee._id);
              return (
                <div key={meeting._id} className="p-8 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{meeting.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMeetingTypeColor(meeting.meetingType)}`}>
                          {meeting.meetingType.replace('-', ' ')}
                        </span>
                        {userAttendee && (
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(userAttendee.status)}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(userAttendee.status)}`}>
                              {userAttendee.status}
                            </span>
                          </div>
                        )}
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

                      {meeting.agenda && meeting.agenda.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Agenda</p>
                          <ul className="space-y-1">
                            {meeting.agenda.map((item, index) => (
                              <li key={index} className="text-sm text-gray-700">
                                • {item.item} {item.duration && `(${item.duration} min)`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Attendees</p>
                        <div className="flex flex-wrap gap-2">
                          {meeting.attendees.map((attendee, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                              <User className="h-4 w-4 text-gray-500" />
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
                    
                    {userAttendee && userAttendee.status === 'pending' && (
                      <div className="flex flex-col space-y-2 ml-6">
                        <button
                          onClick={() => respondToMeeting(meeting._id, 'accepted')}
                          disabled={responding === meeting._id}
                          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </button>
                        <button
                          onClick={() => respondToMeeting(meeting._id, 'declined')}
                          disabled={responding === meeting._id}
                          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Past Meetings ({pastMeetings.length})</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {pastMeetings.slice(0, 5).map((meeting) => (
              <div key={meeting._id} className="p-8 opacity-75">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{meeting.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{new Date(meeting.meetingDate).toLocaleDateString()}</span>
                      <span>{new Date(meeting.meetingDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span>{meeting.duration} minutes</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMeetingTypeColor(meeting.meetingType)}`}>
                    {meeting.meetingType.replace('-', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;