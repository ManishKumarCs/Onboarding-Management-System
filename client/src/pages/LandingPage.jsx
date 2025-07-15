import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  ArrowRight,
  CheckCircle,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  UserCheck,
  Megaphone,
  Bell,
  Shield,
  Zap,
  Globe,
  Star,
  Play
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const { user, logout } = useAuth();

  const features = [
    { icon: Users, title: "Employee Management", description: "Comprehensive profiles with secure authentication and role-based access control." },
    { icon: CheckCircle, title: "Structured Onboarding", description: "Step-by-step onboarding process with progress tracking and automated workflows." },
    { icon: FileText, title: "Document Management", description: "Secure document upload, review, and approval system with cloud storage integration." },
    { icon: Calendar, title: "Leave Management", description: "Complete leave request system with approval workflows and calendar integration." },
    { icon: Calendar, title: "Meeting Scheduling", description: "Schedule one-on-one or group meetings with agenda management and notifications." },
    { icon: UserCheck, title: "Mentor Assignment", description: "Assign mentors to new employees with goal tracking and progress monitoring." },
    { icon: Megaphone, title: "Broadcast Messaging", description: "Send company-wide announcements with priority levels and read tracking." },
    { icon: Bell, title: "Smart Notifications", description: "Real-time notifications for all system activities with priority management." },
    { icon: MessageSquare, title: "Internal Messaging", description: "Direct communication between employees and administrators with message history." }
  ];

  const benefits = [
    { icon: Zap, title: "Streamlined Process", description: "Reduce onboarding time by 60% with automated workflows and digital processes." },
    { icon: Shield, title: "Secure & Compliant", description: "Enterprise-grade security with role-based access and document encryption." },
    { icon: Globe, title: "Cloud-Based", description: "Access from anywhere with cloud storage and real-time synchronization." }
  ];

  const testimonials = [
    { name: "Dheeraj Gaur", role: "Full Stack Developer", content: "This system transformed our onboarding process. New hires are now productive 40% faster.", rating: 5 },
    { name: "Mukul Kumar", role: "Full Stack Developer", content: "The mentor assignment feature has significantly improved our retention rates.", rating: 5 },
    { name: "Akash Kumar", role: "Full Stack Developer", content: "Document management and leave tracking have never been easier. Highly recommended!", rating: 5 }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Onboarding Management System | Streamline HR & Employee Experience</title>
        <meta name="description" content="Transform your onboarding process with our all-in-one employee management system. Secure, cloud-based, and built for modern teams." />
        <meta name="keywords" content="Employee onboarding, HR management, onboarding software, document management, leave management, mentor assignment, HR automation, OMS" />
        <meta name="author" content="Manish Kumar" />
        <meta property="og:title" content="Onboarding Management System" />
        <meta property="og:description" content="Streamline your HR and employee onboarding processes with OMS." />
        <meta property="og:image" content="https://your-domain.com/og-image.png" />
        <meta property="og:url" content="https://your-domain.com" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Onboarding Management System" />
        <meta name="twitter:description" content="All-in-one platform for onboarding, document management, and more." />
        <meta name="twitter:image" content="https://your-domain.com/og-image.png" />
        <link rel="canonical" href="https://your-domain.com" />
      </Helmet>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold">Onboarding Management System</span>
          </div>
          <div className="hidden sm:flex flex-row items-center gap-4">
            {!user ? (
              <Link to="/register" className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition-colors">
                Get Started
              </Link>
            ) : (
              <Link to="/" className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition-colors">
                <button onClick={logout}>Logout</button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transform Your <span className="block text-black">Onboarding</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8">
              Streamline your HR processes with our comprehensive onboarding and management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="px-6 sm:px-8 py-3 sm:py-4 bg-black text-white rounded-xl hover:bg-gray-800 text-base sm:text-lg flex items-center justify-center">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button className="px-6 sm:px-8 py-3 sm:py-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center justify-center text-base sm:text-lg">
                <Play className="mr-2 h-5 w-5" /> Watch Demo
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-100 space-y-4">
            {[CheckCircle, FileText, UserCheck].map((Icon, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${i === 0 ? "bg-green-100" : i === 1 ? "bg-blue-100" : "bg-purple-100"}`}>
                  <Icon className={`h-6 w-6 ${i === 0 ? "text-green-600" : i === 1 ? "text-blue-600" : "text-purple-600"}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{["Profile Setup Complete", "Documents Approved", "Mentor Assigned"][i]}</h3>
                  <p className="text-sm text-gray-600">{["Welcome aboard, Sarah!", "All required documents verified", "Meet your mentor"][i]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need for Success</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Our comprehensive platform covers every aspect of onboarding and management.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, description }, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose OMS?</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Built for modern companies that value efficiency, security, and employee experience.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {benefits.map(({ icon: Icon, title, description }, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted by Developers</h2>
            <p className="text-lg text-gray-600">See what our users say about their experience.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map(({ name, role, content, rating }, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border">
                <div className="flex mb-4">
                  {[...Array(rating)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{content}"</p>
                <h4 className="font-bold">{name}</h4>
                <p className="text-gray-600">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black text-white text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your Onboarding?</h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of companies that have streamlined HR processes with OMS.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-black rounded-xl hover:bg-gray-100 text-base sm:text-lg flex items-center justify-center">
              Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/contact" className="px-6 py-3 sm:px-8 sm:py-4 border border-gray-600 text-white rounded-xl hover:bg-gray-900 text-base sm:text-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 text-gray-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
          <div>
            <div className="flex justify-center md:justify-start items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">OMS</span>
            </div>
            <p>Streamlining onboarding for modern companies worldwide.</p>
          </div>
          {["Product", "Company", "Support"].map((section, i) => (
            <div key={i}>
              <h3 className="font-bold text-gray-900 mb-4">{section}</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "Security", "Integrations"].slice(0, section === "Support" ? 4 : 3).map((item, j) => (
                  <li key={j}><a href="#" className="hover:text-black transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-8 border-t pt-6">&copy; 2025 OMS. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default LandingPage;
