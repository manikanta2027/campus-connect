// Import Post model for database operations
const Post = require('../models/Post');
// Import User model to fetch registerNumber
const User = require('../models/User');
// Import auto-tagging function
const { autoTagPost } = require('../utils/autoTagger');

// Debug: Log when module is loaded
console.log('Post controller loaded - User model imported');

// Function to create a new post
exports.createPost = async (req, res) => {
  try {
    // Get post data from request body
    const { id, authorName, authorDept, authorAvatar, authorEmail, content, images, profileImage } = req.body;

    // Validate required fields
    if (!id || !authorName || !content || !authorEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: id, authorName, content, authorEmail'
      });
    }

    // Normalize email to lowercase for consistency
    const normalizedEmail = authorEmail.toLowerCase().trim();
    console.log(`Creating post - Author: ${authorName}, Email: ${normalizedEmail}`);

    // Auto-tag the post using AI
    console.log('🤖 Generating tags for post...');
    const tags = await autoTagPost(content);

    // Create a new post document
    const newPost = new Post({
      id,
      authorName,
      authorDept: authorDept || 'Department Unknown',
      authorAvatar: authorAvatar || authorName.charAt(0).toUpperCase(),
      authorEmail: normalizedEmail,
      content: content.trim(),
      images: images || [],
      profileImage: profileImage || null,
      tags: tags, // Add AI-generated tags
      timestamp: new Date()
    });

    // Save the post to database
    await newPost.save();

    // Return the saved post with tags
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost,
      tags: tags // Return tags in response
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error creating post:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

// Function to get all posts from database
exports.getAllPosts = async (req, res) => {
  try {
    // Find all posts and sort by newest first
    const posts = await Post.find({})
      .sort({ timestamp: -1 })
      .lean();

    console.log(`\n=== getAllPosts Debug ===`);
    console.log(`Total posts fetched: ${posts.length}`);

    // ============================================================
    // TIME-BASED FEED EXPIRY - Filter posts by age and engagement
    // ============================================================
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const filteredPosts = posts.filter(post => {
      const postAge = new Date(post.timestamp);
      const likeCount = post.reactions?.likes?.length || 0;

      // 1. Show all posts from last 7 days
      if (postAge >= sevenDaysAgo) {
        return true;
      }

      // 2. Show posts 7-30 days old only if they have 50+ likes (popular content)
      if (postAge >= thirtyDaysAgo && likeCount >= 50) {
        return true;
      }

      // 3. Hide posts older than 30 days (archive them)
      return false;
    });

    console.log(`📅 Feed filtering applied:`);
    console.log(`   ├─ Posts from last 7 days: ${posts.filter(p => new Date(p.timestamp) >= sevenDaysAgo).length}`);
    console.log(`   ├─ Posts 7-30 days old: ${posts.filter(p => new Date(p.timestamp) >= thirtyDaysAgo && new Date(p.timestamp) < sevenDaysAgo).length}`);
    console.log(`   ├─ Posts older 30 days: ${posts.filter(p => new Date(p.timestamp) < thirtyDaysAgo).length}`);
    console.log(`   └─ Posts shown in feed: ${filteredPosts.length}`);

    // Fetch registerNumber for each post from User collection
    const postsWithRegNumber = await Promise.all(
      filteredPosts.map(async (post) => {
        try {
          // Normalize email to lowercase for lookup
          const normalizedEmail = (post.authorEmail || '').toLowerCase().trim();
          
          // Use case-insensitive regex for robust matching
          const user = await User.findOne(
            { email: { $regex: `^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
            'registerNumber name email'
          ).lean();
          
          if (user) {
            console.log(`✓ Post by ${normalizedEmail} → Found user: ${user.name}, Reg#: ${user.registerNumber}`);
          } else {
            console.log(`✗ Post by ${normalizedEmail} → NO USER FOUND in database`);
            // Log all users that exist to help debug
            const allUsers = await User.find({}, 'email registerNumber name').lean();
            console.log(`Available users in DB: ${allUsers.map(u => u.email).join(', ')}`);
          }
          
          return {
            ...post,
            registrationNumber: user?.registerNumber || 'N/A'
          };
        } catch (err) {
          console.error(`Error fetching registerNumber for ${post.authorEmail}:`, err.message);
          return {
            ...post,
            registrationNumber: 'N/A'
          };
        }
      })
    );

    console.log(`=== End Debug ===\n`);

    // Return the posts with registerNumber
    res.json({
      success: true,
      posts: postsWithRegNumber,
      count: postsWithRegNumber.length,
      feedInfo: {
        totalPostsInDB: posts.length,
        postsShownInFeed: postsWithRegNumber.length,
        archivedPosts: posts.length - postsWithRegNumber.length,
        filterRules: {
          '0-7 days': 'Show all posts',
          '7-30 days': 'Show only if 50+ likes',
          '30+ days': 'Archived (hidden)'
        }
      }
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching posts:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// Function to get posts by a specific user
exports.getUserPosts = async (req, res) => {
  try {
    // Get author email from request parameters
    const { authorEmail } = req.params;

    // Validate parameter
    if (!authorEmail) {
      return res.status(400).json({
        success: false,
        message: 'authorEmail is required'
      });
    }

    // Normalize email to lowercase
    const normalizedEmail = authorEmail.toLowerCase().trim();

    // Find all posts by this user, sorted by newest first
    const posts = await Post.find({ authorEmail: normalizedEmail })
      .sort({ timestamp: -1 })
      .lean();

    // Fetch registerNumber for the user using normalized email
    const user = await User.findOne({ email: normalizedEmail }, 'registerNumber').lean();
    const registrationNumber = user?.registerNumber || 'N/A';
    console.log(`User posts for ${normalizedEmail} - User found: ${!!user}, registerNumber: ${user?.registerNumber}`);

    // Add registerNumber to all posts
    const postsWithRegNumber = posts.map(post => ({
      ...post,
      registrationNumber: registrationNumber
    }));

    // Return the posts
    res.json({
      success: true,
      posts: postsWithRegNumber,
      count: postsWithRegNumber.length
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching user posts:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user posts',
      error: error.message
    });
  }
};

// Function to update a post (for editing)
exports.updatePost = async (req, res) => {
  try {
    // Get post ID from request parameters
    const { postId } = req.params;
    // Get updated data from request body
    const { content, images, profileImage } = req.body;

    // Validate postId
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'postId is required'
      });
    }

    // Find and update the post by custom id field (not MongoDB _id)
    const updatedPost = await Post.findOneAndUpdate(
      { id: parseInt(postId) }, // Find by custom id field
      {
        content: content || undefined,
        images: images || undefined,
        profileImage: profileImage || undefined
      },
      { new: true } // Return updated document
    );

    // Check if post was found
    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Return the updated post
    res.json({
      success: true,
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error updating post:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
};

// Function to delete a post
exports.deletePost = async (req, res) => {
  try {
    // Get post ID from request parameters
    const { postId } = req.params;

    // Validate postId
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'postId is required'
      });
    }

    // Find and delete the post by custom id field (not MongoDB _id)
    const deletedPost = await Post.findOneAndDelete({ id: parseInt(postId) });

    // Check if post was found
    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Return success message
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error deleting post:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

// Function to update likes on a post
exports.updateLikes = async (req, res) => {
  try {
    // Get post ID and increment value from request
    const { postId } = req.params;
    const { increment, currentUserEmail, currentUserName } = req.body; // increment is 1 (like) or -1 (unlike)

    // Validate inputs
    if (!postId || increment === undefined) {
      return res.status(400).json({
        success: false,
        message: 'postId and increment are required'
      });
    }

    // Find post by custom id field and update likes
    const updatedPost = await Post.findOneAndUpdate(
      { id: parseInt(postId) }, // Find by custom id field
      { $inc: { 'reactions.likes': increment } }, // Increment or decrement likes
      { new: true } // Return updated document
    );

    // Check if post was found
    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Send notification to post author if someone liked their post
    if (increment === 1 && updatedPost.authorEmail && currentUserEmail && currentUserName) {
      // Only send if the liker is not the post author
      if (updatedPost.authorEmail.toLowerCase() !== currentUserEmail.toLowerCase()) {
        console.log(`\n❤️  Attempting to send like notification...`);
        console.log(`   Post by: ${updatedPost.authorEmail}`);
        console.log(`   Liked by: ${currentUserName} (${currentUserEmail})`);
        
        const { sendNotification } = require('./notificationController');
        await sendNotification(
          updatedPost.authorEmail,
          'like',
          currentUserEmail,
          currentUserName,
          updatedPost.id.toString(),
          `${currentUserName} liked your post`
        );
      } else {
        console.log(`ℹ️  Skipping notification - user liked their own post`);
      }
    }

    // Return updated post
    res.json({
      success: true,
      message: 'Post likes updated successfully',
      post: updatedPost
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error updating likes:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to update likes',
      error: error.message
    });
  }
};

// Function to fix old posts with placeholder email
// This updates posts that have "user@campus.local" to use the correct author email
exports.fixOldPostEmails = async (req, res) => {
  try {
    // Get the author name and correct email from request body
    const { authorName, correctEmail } = req.body;

    // Validate inputs
    if (!authorName || !correctEmail) {
      return res.status(400).json({
        success: false,
        message: 'authorName and correctEmail are required'
      });
    }

    // Update all posts with placeholder email and matching author name
    const result = await Post.updateMany(
      {
        authorName: authorName,
        authorEmail: 'user@campus.local'
      },
      {
        $set: { authorEmail: correctEmail }
      }
    );

    // Return success message with count of updated posts
    res.json({
      success: true,
      message: `Fixed ${result.modifiedCount} posts for ${authorName}`,
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error fixing old post emails:', error.message);

    // Return error response
    res.status(500).json({
      success: false,
      message: 'Failed to fix post emails',
      error: error.message
    });
  }
};

// Function to sync and normalize all post emails
// This ensures all post emails match with User collection and shows missing users
exports.syncPostEmails = async (req, res) => {
  try {
    console.log('\n=== SYNC POST EMAILS ===');
    
    // Get all posts
    const posts = await Post.find({}).lean();
    console.log(`Total posts: ${posts.length}`);
    
    // Get all users
    const users = await User.find({}, 'email registerNumber name').lean();
    console.log(`Total users: ${users.length}`);
    console.log(`Users: ${users.map(u => u.email).join(', ')}\n`);

    let normalizedCount = 0;
    let missingUsers = [];

    // Normalize all post emails to lowercase
    for (let post of posts) {
      const oldEmail = post.authorEmail;
      const newEmail = (post.authorEmail || '').toLowerCase().trim();
      
      if (oldEmail !== newEmail) {
        await Post.updateOne({ _id: post._id }, { $set: { authorEmail: newEmail } });
        normalizedCount++;
        console.log(`Normalized: "${oldEmail}" → "${newEmail}"`);
      }

      // Check if user exists
      const userExists = users.find(u => u.email.toLowerCase() === newEmail.toLowerCase());
      if (!userExists) {
        console.log(`⚠ WARNING: Post by "${newEmail}" has NO matching user!`);
        missingUsers.push(newEmail);
      }
    }

    console.log(`\n=== SYNC COMPLETE ===`);
    console.log(`Normalized emails: ${normalizedCount}`);
    console.log(`Posts with missing users: ${missingUsers.length}`);
    if (missingUsers.length > 0) {
      console.log(`Missing users: ${[...new Set(missingUsers)].join(', ')}`);
    }

    // Return sync results
    res.json({
      success: true,
      message: 'Post emails synced',
      normalizedCount,
      missingUserEmails: [...new Set(missingUsers)],
      totalPosts: posts.length,
      totalUsers: users.length
    });
  } catch (error) {
    console.error('Error syncing post emails:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to sync post emails',
      error: error.message
    });
  }
};

// ============================================================
// SEARCH POSTS BY TAG - Find all posts with a specific tag
// ============================================================
// What it does:
// 1. Takes tag name from URL parameter
// 2. Searches for all posts that have this tag
// 3. Returns posts with registerNumber for each
// 4. Case-insensitive tag matching

exports.searchPostsByTag = async (req, res) => {
  try {
    // Get tag name from URL parameter
    const { tagName } = req.params;

    // Validate tag name
    if (!tagName || tagName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tag name is required'
      });
    }

    // Search for posts that contain this tag (case-insensitive)
    const posts = await Post.find({
      tags: { $regex: tagName, $options: 'i' } // Case-insensitive search
    }).sort({ timestamp: -1 }).lean();

    console.log(`\n=== searchPostsByTag Debug ===`);
    console.log(`Tag: ${tagName}, Posts found: ${posts.length}`);

    // Fetch registerNumber for each post from User collection
    const postsWithRegNumber = await Promise.all(
      posts.map(async (post) => {
        try {
          const normalizedEmail = (post.authorEmail || '').toLowerCase().trim();
          const user = await User.findOne({ 
            email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
          }).select('registerNumber');

          return {
            ...post,
            registrationNumber: user?.registerNumber || 'N/A'
          };
        } catch (err) {
          console.error(`Error fetching user for ${post.authorEmail}:`, err.message);
          return { ...post, registrationNumber: 'N/A' };
        }
      })
    );

    // Return posts with tag
    res.status(200).json({
      success: true,
      message: `Found ${postsWithRegNumber.length} posts with tag "${tagName}"`,
      tag: tagName,
      posts: postsWithRegNumber
    });
  } catch (error) {
    console.error('Error searching posts by tag:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search posts by tag',
      error: error.message
    });
  }
};

// Function to sync comment counts for all posts
// This fixes posts that have incorrect comment counts in the database
exports.syncCommentCounts = async (req, res) => {
  try {
    console.log('\n=== Starting Comment Count Sync ===');
    
    // Import Comment model
    const Comment = require('../models/Comment');
    
    // Get all posts
    const allPosts = await Post.find({}).lean();
    console.log(`Processing ${allPosts.length} posts...`);
    
    let updatedCount = 0;
    let results = [];
    
    // For each post, count comments and update if needed
    for (const post of allPosts) {
      try {
        // Count actual comments for this post
        const commentCount = await Comment.countDocuments({ postId: post.id });
        
        // Always update to ensure accuracy
        await Post.findOneAndUpdate(
          { id: post.id },
          { 'reactions.comments': commentCount },
          { new: true }
        );
        
        console.log(`✓ Post ${post.id} - Comment count set to ${commentCount}`);
        results.push({
          postId: post.id,
          oldCount: post.reactions.comments,
          newCount: commentCount,
          updated: true
        });
        updatedCount++;
      } catch (err) {
        console.error(`Error processing post ${post.id}:`, err.message);
      }
    }
    
    console.log(`=== Sync Complete: ${updatedCount} posts updated ===\n`);
    
    // Return success response with details
    res.json({
      success: true,
      message: `Successfully synced comment counts. ${updatedCount} posts updated.`,
      totalPosts: allPosts.length,
      postsUpdated: updatedCount,
      details: results
    });
  } catch (error) {
    console.error('Error syncing comment counts:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to sync comment counts',
      error: error.message
    });
  }
};
