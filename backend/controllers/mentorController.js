// Import User model for mentor queries
const User = require('../models/User');

// Get list of all mentors (only approved mentors)
exports.getMentors = async (req, res) => {
  try {
    // Find all users with isMentor: true
    const mentors = await User.find({
      isMentor: true,
    }).select('-password'); // Don't return password

    res.json({
      success: true,
      mentors: mentors,
      count: mentors.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mentors',
      error: error.message,
    });
  }
};

// Get mentor by ID
exports.getMentorById = async (req, res) => {
  try {
    const mentorId = req.params.id;

    // Find mentor
    const mentor = await User.findById(mentorId).select('-password');

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found',
      });
    }

    // Ensure user is marked as mentor
    if (!mentor.isMentor) {
      return res.status(400).json({
        success: false,
        message: 'User is not a mentor',
      });
    }

    res.json({
      success: true,
      mentor: mentor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mentor',
      error: error.message,
    });
  }
};

// Get mentors by specific skill
exports.getMentorsBySkill = async (req, res) => {
  try {
    const skill = req.params.skill;

    // Find mentors with specific skill
    const mentors = await User.find({
      isMentor: true,
      skills: { $in: [skill] }, // Check if skill exists in skills array
    }).select('-password');

    res.json({
      success: true,
      mentors: mentors,
      skill: skill,
      count: mentors.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mentors by skill',
      error: error.message,
    });
  }
};

// Get mentors filtered by skill
exports.getMentorsByDepartmentAndSkill = async (req, res) => {
  try {
    const { skill } = req.query;

    // Build query for mentors
    let query = {
      isMentor: true,
    };

    // Add skill filter if provided
    if (skill) {
      query.skills = { $in: [skill] };
    }

    const mentors = await User.find(query).select('-password');

    res.json({
      success: true,
      mentors: mentors,
      count: mentors.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching mentors',
      error: error.message,
    });
  }
};

// Add a user as mentor (Admin only)
exports.addMentor = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Find user and update isMentor to true
    const user = await User.findByIdAndUpdate(
      userId,
      { isMentor: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User added as mentor successfully',
      mentor: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding mentor',
      error: error.message,
    });
  }
};

// Remove a user as mentor (Admin only)
exports.removeMentor = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }

    // Find user and update isMentor to false
    const user = await User.findByIdAndUpdate(
      userId,
      { isMentor: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User removed as mentor successfully',
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing mentor',
      error: error.message,
    });
  }
};
