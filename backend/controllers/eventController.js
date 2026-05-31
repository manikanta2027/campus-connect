// Import Event model
const Event = require('../models/Event');

// Function to create a new event
const createEvent = async (req, res) => {
  try {
    // Get event data from request body
    const { title, description, startDate, endDate, location, category, eventUrl, eventImage, createdBy } = req.body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !category || !createdBy) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, startDate, endDate, category, createdBy'
      });
    }

    // Create new event with unique ID based on timestamp
    const newEvent = new Event({
      id: Date.now(),
      title,
      description,
      startDate,
      endDate,
      location: location || '',
      category,
      eventUrl: eventUrl || '',
      eventImage: eventImage || '',
      registrations: 0,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save event to database
    const savedEvent = await newEvent.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (error) {
    console.error('Create event error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create event',
      error: error.message
    });
  }
};

// Function to get all events
const getAllEvents = async (req, res) => {
  try {
    // Fetch all events sorted by newest first
    const events = await Event.find().sort({ createdAt: -1 });

    // Return success response with events
    res.json({
      success: true,
      message: 'Events fetched successfully',
      events
    });
  } catch (error) {
    console.error('Get all events error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Function to get events by admin email
const getEventsByAdmin = async (req, res) => {
  try {
    // Get admin email from request parameters
    const { adminEmail } = req.params;

    // Fetch events created by this admin
    const events = await Event.find({ createdBy: adminEmail }).sort({ createdAt: -1 });

    // Return success response with events
    res.json({
      success: true,
      message: 'Events fetched successfully',
      events
    });
  } catch (error) {
    console.error('Get events by admin error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
};

// Function to update an event
const updateEvent = async (req, res) => {
  try {
    // Get event ID from request parameters
    const { eventId } = req.params;
    // Get updated fields from request body
    const { title, description, startDate, endDate, location, category, eventUrl, eventImage } = req.body;

    // Validate required fields
    if (!title || !description || !startDate || !endDate || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Build update object with only provided fields
    const updateData = {
      title,
      description,
      startDate,
      endDate,
      location: location || '',
      category,
      eventUrl: eventUrl || '',
      updatedAt: new Date()
    };

    // Only update eventImage if provided
    if (eventImage) {
      updateData.eventImage = eventImage;
    }

    // Find event by ID and update it
    const updatedEvent = await Event.findOneAndUpdate(
      { id: parseInt(eventId) },
      updateData,
      { new: true } // Return updated document
    );

    // Check if event exists
    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Return success response
    res.json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update event',
      error: error.message
    });
  }
};

// Function to delete an event
const deleteEvent = async (req, res) => {
  try {
    // Get event ID from request parameters
    const { eventId } = req.params;

    // Find event by ID and delete it
    const deletedEvent = await Event.findOneAndDelete({ id: parseInt(eventId) });

    // Check if event exists
    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Return success response
    res.json({
      success: true,
      message: 'Event deleted successfully',
      event: deletedEvent
    });
  } catch (error) {
    console.error('Delete event error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event',
      error: error.message
    });
  }
};

// Export all functions
module.exports = {
  createEvent,
  getAllEvents,
  getEventsByAdmin,
  updateEvent,
  deleteEvent
};
