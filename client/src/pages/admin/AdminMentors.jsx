import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  UserCheck,
  Target,
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import axios from 'axios';

const AdminMentors = () => {
  const [mentorships, setMentorships] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  const [newMentorship, setNewMentorship] = useState({
    mentor: '',
    mentee: '',
    endDate: '',
    goals: []
  });

  const [goalInput, setGoalInput] = useState({ goal: '', targetDate: '' });

  useEffect(() => {
    fetchMentorships();
    fetchEmployees();
  }, [statusFilter]);

  const fetchMentorships = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/mentors/all?${params}`);
      setMentorships(response.data.mentorships);
    } catch (error) {
      console.error('Error fetching mentorships:', error);
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

  const handleCreateMentorship = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/mentors/assign`, newMentorship);
      setShowCreateModal(false);
      setNewMentorship({
        mentor: '',
        mentee: '',
        endDate: '',
        goals: []
      });
      fetchMentorships();
    } catch (error) {
      console.error('Error creating mentorship:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addGoal = () => {
    if (goalInput.goal.trim()) {
      setNewMentorship({
        ...newMentorship,
        goals: [...newMentorship.goals, goalInput]
      });
      setGoalInput({ goal: '', targetDate: '' });
    }
  };

  const removeGoal = (index) => {
    setNewMentorship({
      ...newMentorship,
      goals: newMentorship.goals.filter((_, i) => i !== index)
    });
  };

  const updateMentorshipStatus = async (mentorshipId, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/mentors/${mentorshipId}/status`, { status });
      fetchMentorships();
    } catch (error) {
      console.error('Error updating mentorship status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMentorships = mentorships.filter(mentorship =>
    mentorship.mentor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentorship.mentee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mentor Management</h1>
              <p className="text-gray-600 mt-1">Assign and manage mentor-mentee relationships</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5 mr-2" />
            Assign Mentor
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Mentorships</p>
              <p className="text-2xl font-bold text-gray-900">{mentorships.length}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {mentorships.filter(m => m.status === 'active').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {mentorships.filter(m => m.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Mentors</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(mentorships.map(m => m.mentor?._id)).size}
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-400" />
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
                placeholder="Search mentors or mentees..."
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
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mentorships List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Mentorships ({filteredMentorships.length})</h2>
        </div>
        
        {filteredMentorships.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentorships found</h3>
            <p className="text-gray-600">Create your first mentorship to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMentorships.map((mentorship) => (
              <div key={mentorship._id} className="p-8 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {mentorship.mentor?.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{mentorship.mentor?.fullName}</h3>
                          <p className="text-gray-600">{mentorship.mentor?.department} • {mentorship.mentor?.position}</p>
                        </div>
                      </div>
                      
                      <div className="text-gray-400">→</div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {mentorship.mentee?.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{mentorship.mentee?.fullName}</h3>
                          <p className="text-gray-600">{mentorship.mentee?.department} • {mentorship.mentee?.position}</p>
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mentorship.status)}`}>
                        {mentorship.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(mentorship.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      {mentorship.endDate && (
                        <div>
                          <p className="text-sm text-gray-600">End Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(mentorship.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Goals Progress</p>
                        <p className="font-semibold text-gray-900">
                          {mentorship.goals.filter(g => g.completed).length} / {mentorship.goals.length} completed
                        </p>
                      </div>
                    </div>

                    {mentorship.goals.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Goals</p>
                        <div className="space-y-2">
                          {mentorship.goals.slice(0, 3).map((goal, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <span className={`text-sm ${goal.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {goal.goal}
                              </span>
                              {goal.targetDate && (
                                <span className="text-xs text-gray-500">
                                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          ))}
                          {mentorship.goals.length > 3 && (
                            <p className="text-sm text-gray-500">+{mentorship.goals.length - 3} more goals</p>
                          )}
                        </div>
                      </div>
                    )}

                    {mentorship.notes.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Recent Notes</p>
                        <div className="space-y-2">
                          {mentorship.notes.slice(-2).map((note, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-900">{note.note}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(note.addedAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <select
                      value={mentorship.status}
                      onChange={(e) => updateMentorshipStatus(mentorship._id, e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="paused">Paused</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Mentorship Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Mentor</h2>
              
              <form onSubmit={handleCreateMentorship} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Mentor
                    </label>
                    <select
                      value={newMentorship.mentor}
                      onChange={(e) => setNewMentorship({...newMentorship, mentor: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    >
                      <option value="">Choose Mentor</option>
                      {employees.map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.fullName} - {employee.department}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Mentee
                    </label>
                    <select
                      value={newMentorship.mentee}
                      onChange={(e) => setNewMentorship({...newMentorship, mentee: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                      required
                    >
                      <option value="">Choose Mentee</option>
                      {employees.filter(emp => emp._id !== newMentorship.mentor).map((employee) => (
                        <option key={employee._id} value={employee._id}>
                          {employee.fullName} - {employee.department}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newMentorship.endDate}
                    onChange={(e) => setNewMentorship({...newMentorship, endDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Goals
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={goalInput.goal}
                        onChange={(e) => setGoalInput({...goalInput, goal: e.target.value})}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Goal description..."
                      />
                      <input
                        type="date"
                        value={goalInput.targetDate}
                        onChange={(e) => setGoalInput({...goalInput, targetDate: e.target.value})}
                        className="w-40 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <button
                        type="button"
                        onClick={addGoal}
                        className="px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    
                    {newMentorship.goals.length > 0 && (
                      <div className="space-y-2">
                        {newMentorship.goals.map((goal, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div>
                              <span className="text-gray-900">{goal.goal}</span>
                              {goal.targetDate && (
                                <span className="text-gray-500 text-sm ml-2">
                                  (Target: {new Date(goal.targetDate).toLocaleDateString()})
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeGoal(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-5 w-5 mr-2" />
                        Assign Mentor
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

export default AdminMentors;