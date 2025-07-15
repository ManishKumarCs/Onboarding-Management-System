import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, Users, ArrowLeft, Send,
  Github, Linkedin, Twitter, Code, Coffee, Heart
} from 'lucide-react';
import axios from 'axios';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', company: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Contact form error:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const teamMembers = [
    {
      name: 'Manish Kumar',
      role: 'Full Stack Developer',
      bio: 'Passionate about creating seamless user experiences and robust backend systems.',
      skills: ['React', 'Next', 'Node.js', 'MongoDB', 'JavaScript'],
      social: {
        github: 'https://github.com/ManishkumarCs',
        linkedin: 'https://linkedin.com/in/manishkumarcs1',
        twitter: '#'
      }
    }
  ];

  const projectStats = [
    { label: 'Lines of Code', value: '15,000+' },
    { label: 'Components Built', value: '50+' },
    { label: 'Features Implemented', value: '25+' },
    { label: 'Coffee Consumed', value: '∞' }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Onboarding Management System</span>
          </Link>
          <Link to="/" className="text-sm text-gray-700 hover:text-black flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </div>
      </nav>

      <section className="bg-gradient-to-br from-gray-50 to-white py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-gray-600 text-lg">Have questions about OMS or the team? We're here to help!</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
            {submitted && <p className="text-green-600 mb-4">Thank you! We'll get back to you soon.</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="w-full p-3 border rounded-xl" />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full p-3 border rounded-xl" />
              <input type="text" name="company" placeholder="Company (optional)" value={formData.company} onChange={handleChange} className="w-full p-3 border rounded-xl" />
              <textarea name="message" rows="5" placeholder="Message" value={formData.message} onChange={handleChange} required className="w-full p-3 border rounded-xl"></textarea>
              <button type="submit" className="w-full bg-black text-white p-3 rounded-xl flex items-center justify-center gap-2">
                <Send className="w-5 h-5" /> Send
              </button>
            </form>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-6">Contact Info</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6" />
                <div>
                  <p className="font-medium">developer.manish025@gmail.com</p>
                  <p className="text-sm text-gray-500">manishdev.tech</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6" />
                <div>
                  <p className="font-medium">+91 8191994215</p>
                  <p className="text-sm text-gray-500">Mon - Fri, 9AM - 6PM IST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Meet the Developer</h2>
          {teamMembers.map((member, i) => (
            <div key={i} className="max-w-3xl mx-auto">
              <img src="https://avatars.githubusercontent.com/u/165541196?v=4" alt="Manish Kumar" className="w-32 h-32 rounded-full mx-auto mb-4" />
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-gray-600 mb-2">{member.role}</p>
              <p className="text-gray-700 mb-4">{member.bio}</p>
              <div className="flex justify-center gap-2 flex-wrap mb-4">
                {member.skills.map((skill, idx) => (
                  <span key={idx} className="bg-white border text-sm px-3 py-1 rounded-full">{skill}</span>
                ))}
              </div>
              <div className="flex justify-center gap-4">
                <a href={member.social.github} target="_blank" rel="noopener noreferrer"><Github /></a>
                <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin /></a>
                <a href={member.social.twitter} target="_blank" rel="noopener noreferrer"><Twitter /></a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-black text-white py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="h-6 w-6" /> <span className="text-xl font-bold">OMS</span>
        </div>
        <p className="text-sm text-gray-400">&copy; 2025 OMS. Built with ❤️ by Manish Kumar</p>
      </footer>
    </div>
  );
};

export default ContactPage;