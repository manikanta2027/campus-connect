import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AboutUs() {
  const navigate = useNavigate()
  const [expandedFAQ, setExpandedFAQ] = useState(null)

  const features = [
    {
      icon: '📱',
      title: 'Connect & Share',
      description: 'Share your thoughts, projects, and achievements with the college community'
    },
    {
      icon: '👥',
      title: 'Find Mentors',
      description: 'Connect with experienced seniors for guidance and mentorship'
    },
    {
      icon: '🚀',
      title: 'Discover Events',
      description: 'Never miss hackathons, workshops, and networking opportunities'
    },
    {
      icon: '',
      title: 'Direct Chat',
      description: 'Message mentors and peers directly for meaningful conversations'
    },
    {
      icon: '🎯',
      title: 'Career Growth',
      description: 'Get tips and guidance for your career development journey'
    }
  ]

  const team = [
    {
      name: 'Development Team',
      role: 'Full Stack Engineers',
      emoji: '💻'
    },
    {
      name: 'Design Team',
      role: 'UI/UX Designers',
      emoji: '🎨'
    },
    {
      name: 'Community Team',
      role: 'Community Managers',
      emoji: '🤝'
    }
  ]

  const faqs = [
    {
      question: 'How do I get started on Campus Connect?',
      answer: 'Simply register with your email, verify your account, and you\'re ready to explore! Complete your profile to help others know you better.'
    },
    {
      question: 'Is Campus Connect free to use?',
      answer: 'Yes! Campus Connect is completely free for all college students. All features are available without any subscription.'
    },
    {
      question: 'How can I become a mentor?',
      answer: 'Go to the Mentors section and fill out your profile with your skills and experience. Senior students can guide juniors in their domain.'
    },
    {
      question: 'How do I report inappropriate content?',
      answer: 'You can report any post or user directly through our content moderation system. Our admin team reviews all reports.'
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account anytime from your profile settings. All your data will be permanently removed.'
    }
  ]

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-blue-600">Campus Connect</h1>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side - Text */}
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                Welcome to Campus Connect
              </h2>
              <p className="text-base sm:text-lg text-blue-100">
                Your complete social platform designed for college students to connect, learn, and grow together.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={() => navigate('/register')}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition text-sm sm:text-base"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition text-sm sm:text-base"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Right side - Emoji illustration */}
            <div className="hidden md:flex justify-center">
              <div className="text-8xl">🎓</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Campus Connect?
            </h3>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Everything you need to succeed in your college journey, all in one place
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-6 sm:p-8 hover:shadow-lg transition"
              >
                <div className="text-4xl sm:text-5xl mb-4">{feature.icon}</div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">500+</div>
              <p className="text-gray-600 text-sm sm:text-base mt-2">Active Students</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">100+</div>
              <p className="text-gray-600 text-sm sm:text-base mt-2">Mentors</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">50+</div>
              <p className="text-gray-600 text-sm sm:text-base mt-2">Events</p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600">1000+</div>
              <p className="text-gray-600 text-sm sm:text-base mt-2">Connections</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Team
            </h3>
            <p className="text-gray-600 text-base sm:text-lg">
              Dedicated to building the best platform for college students
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">{member.emoji}</div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 sm:px-8 py-4 flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <h4 className="text-left font-semibold text-gray-900 text-sm sm:text-base">
                    {faq.question}
                  </h4>
                  <span className="text-blue-600 text-xl sm:text-2xl flex-shrink-0">
                    {expandedFAQ === index ? '−' : '+'}
                  </span>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-600 text-sm sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Ready to Join Campus Connect?
          </h3>
          <p className="text-blue-100 text-base sm:text-lg mb-6 sm:mb-8">
            Start connecting with your college community today and make the most of your college journey!
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-6 sm:px-10 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition text-base sm:text-lg"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div>
              <h5 className="text-white font-semibold mb-4">Campus Connect</h5>
              <p className="text-sm">Connecting college students worldwide</p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Features</h5>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">Feed</a></li>
                <li><a href="#" className="hover:text-white transition">Mentorship</a></li>
                <li><a href="#" className="hover:text-white transition">Events</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Company</h5>
              <ul className="text-sm space-y-2">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">Contact</h5>
              <ul className="text-sm space-y-2">
                <li>Email: info@campusconnect.com</li>
                <li>Phone: +91-XXXXXXXXXX</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 Campus Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AboutUs
