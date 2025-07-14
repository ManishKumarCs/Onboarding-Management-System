import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  MessageSquare, 
  Target, 
  CheckCircle, 
  Clock,
  Plus,
  Send
} from 'lucide-react';
import axios from 'axios';

const Mentors = () => {
  const [relationships, setRelationships] = useState({ asMentor: [], asMentee: null });
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedMentorship, setSelectedMentorship] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRelationships();
  }, []);

  const fetchRelationships = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/mentors/my-relationships`);
      setRelationships(response.data);
    } catch (error) {
      console.error('Error fetching mentor relationships:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/mentors/${selectedMentorship._id}/notes`, {
        note: newNote
      });
      setNewNote('');
      setShowNoteModal(false);
      fetchRelationships();
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleGoal = async (mentorshipId, goalId, completed) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/mentors/${mentorshipId}/goals/${goalId}`, {
        completed
      });
      fetchRelationships();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const openNoteModal = (mentorship) => {
    setSelectedMentorship(mentorship);
    setShowNoteModal(true);
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
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentorship</h1>
            <p className="text-gray-600 mt-1">Your mentor and mentee relationships</p>
          </div>
        </div>
      </div>

      {/* Your Mentor */}
      {relationships.asMentee && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">Your Mentor</h2>
          </div>
          
          <div className="p-8">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {relationships.asMentee.mentor.fullName}
                </h3>
                <p className="text-gray-600 mb-4">
                  {relationships.asMentee.mentor.position} • {relationships.asMentee.mentor.department}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Goals */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Goals</h4>
                    {relationships.asMentee.goals.length === 0 ? (
                      <p className="text-gray-600">No goals set yet</p>
                    ) : (
                      <div className="space-y-3">
                        {relationships.asMentee.goals.map((goal) => (
                          <div key={goal._id} className="flex items-start space-x-3">
                            <button
                              onClick={() => toggleGoal(relationships.asMentee._id, goal._id, !goal.completed)}
                              className={`mt-1 ${goal.completed ? 'text-green-500' : 'text-gray-400'}`}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <div className="flex-1">
                              <p className={`${goal.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {goal.goal}
                              </p>
                              {goal.targetDate && (
                                <p className="text-sm text-gray-500">
                                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Recent Notes</h4>
                      <button
                        onClick={() => openNoteModal(relationships.asMentee)}
                        className="flex items-center px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Note
                      </button>
                    </div>
                    {relationships.asMentee.notes.length === 0 ? (
                      <p className="text-gray-600">No notes yet</p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {relationships.asMentee.notes.slice(-5).reverse().map((note) => (
                          <div key={note._id} className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-900 text-sm">{note.note}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(note.addedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Your Mentees */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Your Mentees ({relationships.asMentor.length})</h2>
        </div>
        
        {relationships.asMentor.length === 0 ? (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentees assigned</h3>
            <p className="text-gray-600">You haven't been assigned any mentees yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {relationships.asMentor.map((mentorship) => (
              <div key={mentorship._id} className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {mentorship.mentee.fullName}
                        </h3>
                        <p className="text-gray-600">
                          {mentorship.mentee.position} • {mentorship.mentee.department}
                        </p>
                      </div>
                      <button
                        onClick={() => openNoteModal(mentorship)}
                        className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Note
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Goals */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Goals</h4>
                        {mentorship.goals.length === 0 ? (
                          <p className="text-gray-600">No goals set yet</p>
                        ) : (
                          <div className="space-y-3">
                            {mentorship.goals.map((goal) => (
                              <div key={goal._id} className="flex items-start space-x-3">
                                <button
                                  onClick={() => toggleGoal(mentorship._id, goal._id, !goal.completed)}
                                  className={`mt-1 ${goal.completed ? 'text-green-500' : 'text-gray-400'}`}
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <div className="flex-1">
                                  <p className={`${goal.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {goal.goal}
                                  </p>
                                  {goal.targetDate && (
                                    <p className="text-sm text-gray-500">
                                      Target: {new Date(goal.targetDate).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recent Notes */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">Recent Notes</h4>
                        {mentorship.notes.length === 0 ? (
                          <p className="text-gray-600">No notes yet</p>
                        ) : (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {mentorship.notes.slice(-5).reverse().map((note) => (
                              <div key={note._id} className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-900 text-sm">{note.note}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(note.addedAt).toLocaleDateString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* No Relationships */}
      {!relationships.asMentee && relationships.asMentor.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentorship relationships</h3>
            <p className="text-gray-600">You haven't been assigned a mentor or mentees yet</p>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && selectedMentorship && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Note</h2>
              
              <form onSubmit={addNote} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    placeholder="Add a note about your mentorship progress, discussions, or observations..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowNoteModal(false)}
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
                        Adding...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Add Note
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

export default Mentors;