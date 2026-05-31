// Import Comment model for database operations
const Comment = require('../models/Comment');
// Import Post model to get author information
const Post = require('../models/Post');

// Function to add a new comment to a post
exports.addComment = async (req, res) => {
  try {
    // Get comment data from request body
    const { postId, text } = req.body;
    // Get author name from request (can come from token or body) with fallback to Anonymous
    let { author, userEmail } = req.body;

    // Validate required fields - only postId and text are strictly required
    if (!postId || !text) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: postId and text are required'
      });
    }

    // Provide defaults if author or userEmail are missing
    author = author || 'Anonymous User';
    userEmail = userEmail || 'user@campus.local';

    // Create a new comment document
    const newComment = new Comment({
      postId,
      author,
      text: text.trim(),
      userEmail,
      timestamp: new Date()
    });

    // Save the comment to database
    await newComment.save();

    // Increment the comment count in the Post model
    try {
      const postId_num = Number(postId);
      const updatedPost = await Post.findOneAndUpdate(
        { id: postId_num },
        { $inc: { 'reactions.comments': 1 } },
        { new: true }
      );
      
      if (!updatedPost) {
        console.warn(`⚠️  Post not found for ID: ${postId_num} - comment count not updated`);
      } else {
        console.log(`✓ Comment count updated for post ${postId_num}. New count: ${updatedPost.reactions.comments}`);
      }
    } catch (postUpdateError) {
      console.error('⚠️  Error updating post comment count:', postUpdateError.message);
      // Don't fail the comment addition if post update fails
    }

    // Send notification to post author if someone commented on their post
    try {
      console.log(`\n💬 Attempting to send comment notification...`);
      console.log(`   Post ID: ${postId}`);
      console.log(`   Commenter: ${author} (${userEmail})`);

      // Get the post to find the author's email
      const post = await Post.findOne({ id: Number(postId) });
      
      if (post && post.authorEmail) {
        // Only send if the commenter is not the post author
        if (post.authorEmail.toLowerCase() !== userEmail.toLowerCase()) {
          console.log(`   Post author: ${post.authorName} (${post.authorEmail})`);
          
          const { sendNotification } = require('./notificationController');
          await sendNotification(
            post.authorEmail,
            'comment',
            userEmail,
            author,
            postId.toString(),
            `${author} commented on your post`
          );
        } else {
          console.log(`ℹ️  Skipping notification - user commented on their own post`);
        }
      } else {
        console.log(`⚠️  Post not found for ID: ${postId}`);
      }
    } catch (notificationError) {
      console.error('⚠️  Error sending comment notification:', notificationError.message);
      // Don't fail the comment addition if notification fails
    }

    // Return the saved comment
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: {
        id: newComment._id,
        postId: newComment.postId,
        author: newComment.author,
        text: newComment.text,
        timestamp: newComment.timestamp.toLocaleString()
      }
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error adding comment:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Function to get all comments for a specific post
exports.getComments = async (req, res) => {
  try {
    // Get postId from request parameters
    const { postId } = req.params;

    // Validate postId
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'postId is required'
      });
    }

    // Find all comments for this post, sorted by newest first
    const comments = await Comment.find({ postId: Number(postId) })
      .sort({ timestamp: -1 })
      .lean();

    // Transform comments for frontend display
    const formattedComments = comments.map(comment => ({
      id: comment._id,
      author: comment.author,
      text: comment.text,
      timestamp: comment.timestamp.toLocaleString()
    }));

    // Return the comments
    res.json({
      success: true,
      comments: formattedComments,
      count: formattedComments.length
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching comments:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
};

// Function to delete a comment (optional - for future use)
exports.deleteComment = async (req, res) => {
  try {
    // Get comment ID from request parameters
    const { commentId } = req.params;

    // Validate commentId
    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: 'commentId is required'
      });
    }

    // Delete the comment from database
    const result = await Comment.findByIdAndDelete(commentId);

    // Check if comment was found and deleted
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Decrement the comment count in the Post model
    try {
      const postId_num = Number(result.postId);
      const updatedPost = await Post.findOneAndUpdate(
        { id: postId_num },
        { $inc: { 'reactions.comments': -1 } },
        { new: true }
      );
      
      if (!updatedPost) {
        console.warn(`⚠️  Post not found for ID: ${postId_num} - comment count not updated`);
      } else {
        console.log(`✓ Comment count updated for post ${postId_num}. New count: ${updatedPost.reactions.comments}`);
      }
    } catch (postUpdateError) {
      console.error('⚠️  Error updating post comment count:', postUpdateError.message);
      // Don't fail the comment deletion if post update fails
    }

    // Return success response
    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error deleting comment:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};
