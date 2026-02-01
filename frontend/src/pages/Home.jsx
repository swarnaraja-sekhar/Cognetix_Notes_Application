/**
 * Home Page
 * Landing page for unauthenticated users
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineDocumentText, 
  HiOutlineLockClosed, 
  HiOutlineDeviceMobile,
  HiOutlineLightningBolt,
  HiOutlineArrowRight
} from 'react-icons/hi';

const Home = () => {
  const { isAuthenticated } = useAuth();

  // Features list
  const features = [
    {
      icon: HiOutlineDocumentText,
      title: 'Organize Your Thoughts',
      description: 'Create, edit, and organize notes with ease. Keep all your important information in one place.'
    },
    {
      icon: HiOutlineLockClosed,
      title: 'Secure & Private',
      description: 'Your notes are protected with JWT authentication. Only you can access your personal notes.'
    },
    {
      icon: HiOutlineDeviceMobile,
      title: 'Access Anywhere',
      description: 'Responsive design works perfectly on desktop, tablet, and mobile devices.'
    },
    {
      icon: HiOutlineLightningBolt,
      title: 'Fast & Reliable',
      description: 'Built with modern technologies for a smooth and responsive experience.'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg">
        <div className="container-custom py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900/30 dark:to-blue-900/30 rounded-full text-primary-700 dark:text-primary-400 text-sm font-semibold mb-8 border-2 border-primary-200 dark:border-primary-800 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              <span>🚀 Simple, Secure, Free</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Your Notes,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-600">
                Organized
              </span>
              <br />& Secure
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 dark:text-dark-muted max-w-2xl mx-auto mb-10">
              A beautiful and secure note-taking application. Create, organize, and access your notes from anywhere with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary btn-lg w-full sm:w-auto flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  <span>Go to Dashboard</span>
                  <HiOutlineArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary btn-lg w-full sm:w-auto flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <span>Get Started Free</span>
                    <HiOutlineArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary btn-lg w-full sm:w-auto border-2 border-gray-300 dark:border-dark-border hover:border-primary-400 hover:scale-105 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-dark-card">
        <div className="container-custom">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-400 text-sm font-semibold mb-4">
              ✨ Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-gray-600 dark:text-dark-muted max-w-2xl mx-auto">
              Powerful features to help you capture and organize your thoughts effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl bg-gray-50 dark:bg-dark-bg border-[3px] border-gray-300 dark:border-dark-border hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 shadow-md"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-dark-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 border-2 border-white rounded-lg rotate-45"></div>
        </div>
        
        <div className="container-custom text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span>Start for free, no credit card required</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-primary-100 max-w-2xl mx-auto mb-8">
            Join thousands of users who trust Note for their note-taking needs.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <span>Create Free Account</span>
                <HiOutlineArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white/50 hover:bg-white/10 hover:border-white transition-all duration-300"
              >
                <span>Sign In</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 dark:bg-dark-bg border-t-[3px] border-gray-200 dark:border-dark-border">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-blue-600 rounded-lg flex items-center justify-center">
                <HiOutlineDocumentText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Note</span>
            </div>
            
            {/* Copyright */}
            <p className="text-gray-500 dark:text-dark-muted text-center">
              © {new Date().getFullYear()} Note. Built with ❤️ using MERN Stack.
            </p>
            
            {/* Links */}
            <div className="flex items-center space-x-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-dark-muted dark:hover:text-primary-400 transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-dark-muted dark:hover:text-primary-400 transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-dark-muted dark:hover:text-primary-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
