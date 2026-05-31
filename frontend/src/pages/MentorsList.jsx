import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function MentorsList({ token, onLogout }) {
  // Router hook
  const navigate = useNavigate()

  // State management
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [allSkills, setAllSkills] = useState([])

  // Get all unique skills from mentors for filtering
  useEffect(() => {
    const extractSkills = () => {
      const skills = new Set()
      mentors.forEach(mentor => {
        if (mentor.skills && Array.isArray(mentor.skills)) {
          mentor.skills.forEach(skill => skills.add(skill))
        }
      })
      setAllSkills(Array.from(skills).sort())
    }
    extractSkills()
  }, [mentors])

  // Fetch mentors on component load
  useEffect(() => {
    fetchMentors()
  }, [])

  // Fetch all mentors from API
  const fetchMentors = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('http://localhost:8000/api/mentors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch mentors')
      }

      setMentors(data.mentors || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching mentors:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch mentors by selected skill
  const handleSkillFilter = async (skill) => {
    try {
      setSelectedSkill(skill)
      setLoading(true)
      setError('')

      if (skill === '') {
        // If clearing filter, fetch all mentors again
        await fetchMentors()
        return
      }

      const response = await fetch(`http://localhost:8000/api/mentors/skill/${skill}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch mentors by skill')
      }

      setMentors(data.mentors || [])
    } catch (err) {
      setError(err.message)
      console.error('Error filtering mentors:', err)
    } finally {
      setLoading(false)
    }
  }

  // Start chat with mentor
  const handleStartChat = async (mentorId) => {
    try {
      setError('')

      const response = await fetch('http://localhost:8000/api/messages/conversations/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mentorId: mentorId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start conversation')
      }

      // Navigate to chat page with conversation ID
      navigate(`/mentor-chat/${data.conversation._id}`)
    } catch (err) {
      setError(err.message)
      console.error('Error starting conversation:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header - Responsive */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">Find Your Mentor</h1>
            <button
              onClick={() => navigate('/conversations')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-2 rounded-lg transition text-sm sm:text-base whitespace-nowrap"
            >
              My Conversations
            </button>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Connect with experienced seniors (3rd/4th year) for guidance and mentorship
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Skill Filter - Responsive */}
        {allSkills.length > 0 && (
          <div className="mb-8 overflow-x-auto">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSkillFilter('')}
                className={`px-3 sm:px-4 py-2 rounded-full transition text-sm sm:text-base whitespace-nowrap ${
                  selectedSkill === ''
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                All Mentors
              </button>
              {allSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => handleSkillFilter(skill)}
                  className={`px-3 sm:px-4 py-2 rounded-full transition text-sm sm:text-base whitespace-nowrap ${
                    selectedSkill === skill
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading mentors...</p>
          </div>
        )}

        {/* Mentors Grid - Responsive */}
        {!loading && mentors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mentors.map(mentor => (
              <div
                key={mentor._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition hover:scale-105"
              >
                {/* Mentor Photo - Circular */}
                <div className="w-full pt-4 pb-2 px-4 bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {mentor.profileImage ? (
                      <img
                        src={mentor.profileImage}
                        alt={mentor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl font-bold text-white">
                        {mentor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mentor Info */}
                <div className="p-3">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{mentor.name}</h3>
                  
                  {/* Register Number */}
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-semibold">Reg. No:</span> {mentor.registerNumber}
                  </p>

                  {/* Branch/Department */}
                  <div className="mb-3 inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {mentor.department}
                  </div>

                  {/* Skills */}
                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {mentor.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {mentor.skills.length > 3 && (
                          <span className="text-gray-600 text-xs font-semibold">
                            +{mentor.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Connect Button */}
                  <button
                    onClick={() => handleStartChat(mentor._id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1 px-3 text-sm rounded-lg transition"
                  >
                    Connect & Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No mentors found */}
        {!loading && mentors.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">
              {selectedSkill
                ? `No mentors found with skill "${selectedSkill}"`
                : 'No mentors available in your department'}
            </p>
            {selectedSkill && (
              <button
                onClick={() => handleSkillFilter('')}
                className="mt-4 text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                View all mentors
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MentorsList
