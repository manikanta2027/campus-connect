// Import News model for database operations
const News = require('../models/News');

// Function to create a new news item
exports.createNews = async (req, res) => {
  try {
    // Get news data from request body
    const { title, description, category, newsImage, createdBy, deleteAfterDays } = req.body;

    console.log('📰 Creating news with data:', { title, description, category, createdBy, deleteAfterDays });

    // Validate required fields
    if (!title || !description || !category || !createdBy) {
      console.error('❌ Missing required fields:', { title: !!title, description: !!description, category: !!category, createdBy: !!createdBy });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, category, createdBy'
      });
    }

    // Calculate expiration date (default 7 days if not provided)
    const daysToDelete = deleteAfterDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysToDelete);

    // Create a new news document
    const newNews = new News({
      title: title.trim(),
      description: description.trim(),
      category,
      newsImage: newsImage || null,
      createdBy: createdBy.toLowerCase().trim(),
      deleteAfterDays: daysToDelete,
      expiresAt: expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });

    // Save the news to database
    await newNews.save();

    console.log('✅ News created successfully:', newNews._id, `(will auto-delete in ${daysToDelete} days on ${expiresAt.toDateString()})`);

    // Return the saved news
    res.status(201).json({
      success: true,
      message: 'News created successfully',
      news: newNews
    });
  } catch (error) {
    // Log error for debugging
    console.error('❌ Error creating news:', error.message);
    console.error('❌ Full error:', error);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to create news',
      error: error.message
    });
  }
};

// Function to get all news items
exports.getAllNews = async (req, res) => {
  try {
    // Find all active news and sort by newest first
    const news = await News.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    console.log('📰 All news fetched:', news.length, 'items');
    if (news.length > 0) {
      console.log('📰 First news item:', {
        _id: news[0]._id,
        title: news[0].title,
        keys: Object.keys(news[0])
      });
    }

    // Return the news
    res.json({
      success: true,
      news: news,
      count: news.length
    });
  } catch (error) {
    // Log error for debugging
    console.error('❌ Error fetching news:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
};

// Function to get news by admin email
exports.getNewsByAdmin = async (req, res) => {
  try {
    // Get admin email from request parameters
    const { adminEmail } = req.params;

    // Validate parameter
    if (!adminEmail) {
      return res.status(400).json({
        success: false,
        message: 'adminEmail is required'
      });
    }

    // Find all news created by this admin, sorted by newest first
    const news = await News.find({ createdBy: adminEmail.toLowerCase() })
      .sort({ createdAt: -1 })
      .lean();

    // Return the news
    res.json({
      success: true,
      news: news,
      count: news.length
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching admin news:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin news',
      error: error.message
    });
  }
};

// Function to get a single news item by ID
exports.getNewsById = async (req, res) => {
  try {
    // Get news ID from request parameters
    const { newsId } = req.params;

    // Validate parameter
    if (!newsId) {
      return res.status(400).json({
        success: false,
        message: 'newsId is required'
      });
    }

    // Find the news by ID
    const news = await News.findOne({ id: parseInt(newsId) }).lean();

    // Check if news exists
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    // Return the news
    res.json({
      success: true,
      news: news
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching news:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
};

// Function to update a news item
exports.updateNews = async (req, res) => {
  try {
    // Get news ID from request parameters
    const { newsId } = req.params;

    // Get update data from request body
    const { title, description, category, newsImage } = req.body;

    // Validate parameter
    if (!newsId) {
      return res.status(400).json({
        success: false,
        message: 'newsId is required'
      });
    }

    // Prepare update object
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (newsImage !== undefined) updateData.newsImage = newsImage;
    updateData.updatedAt = new Date();

    // Find and update the news by MongoDB _id
    const updatedNews = await News.findByIdAndUpdate(
      newsId,
      updateData,
      { new: true }
    );

    // Check if news was found
    if (!updatedNews) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    // Return the updated news
    res.json({
      success: true,
      message: 'News updated successfully',
      news: updatedNews
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error updating news:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to update news',
      error: error.message
    });
  }
};

// Function to delete a news item (soft delete - mark as inactive)
exports.deleteNews = async (req, res) => {
  try {
    // Get news ID from request parameters
    const { newsId } = req.params;

    console.log('📰 Delete request received for newsId:', newsId);

    // Validate parameter
    if (!newsId) {
      console.error('❌ newsId is missing');
      return res.status(400).json({
        success: false,
        message: 'newsId is required'
      });
    }

    // Soft delete - mark as inactive instead of removing from database
    const deletedNews = await News.findByIdAndUpdate(
      newsId,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    console.log('Delete result:', deletedNews);

    // Check if news was found
    if (!deletedNews) {
      console.error('❌ News not found for ID:', newsId);
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }

    console.log('✅ News deleted successfully:', newsId);

    // Return success message
    res.json({
      success: true,
      message: 'News deleted successfully',
      news: deletedNews
    });
  } catch (error) {
    // Log error for debugging
    console.error('❌ Error deleting news:', error.message);
    console.error('❌ Full error:', error);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to delete news',
      error: error.message
    });
  }
};

// Function to get news by category
exports.getNewsByCategory = async (req, res) => {
  try {
    // Get category from request parameters
    const { category } = req.params;

    // Validate parameter
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'category is required'
      });
    }

    // Find all active news in this category, sorted by newest first
    const news = await News.find({ category, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Return the news
    res.json({
      success: true,
      news: news,
      count: news.length
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching news by category:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
};
