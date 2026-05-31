// Import Hugging Face inference library
const { HfInference } = require("@huggingface/inference");

// Initialize Hugging Face client with API token
// Store your token in .env file as: HF_API_TOKEN=your_token_here
const hf = new HfInference(process.env.HF_API_TOKEN);

// Predefined campus-related tags for classification
const CAMPUS_TAGS = [
  "ReactJS",
  "NodeJS",
  "DSA",
  "Placement",
  "Hackathon",
  "Mentorship",
  "Learning",
  "Interview",
  "WebDevelopment",
  "Backend",
  "Frontend",
  "Database",
  "Project",
  "Tips",
  "Help",
  "Collaboration",
  "SystemDesign",
  "Career",
  "Internship",
  "OpenSource"
];

// ============================================================
// AUTO-TAG FUNCTION - Generate tags from post content using AI
// ============================================================
// What it does:
// 1. Takes post content as input
// 2. Uses Hugging Face zero-shot classification
// 3. Classifies content against predefined campus tags
// 4. Returns top 3-5 most relevant tags
// 5. Falls back to empty array if API fails

exports.autoTagPost = async (postContent) => {
  try {
    // Don't process empty content
    if (!postContent || postContent.trim().length === 0) {
      return [];
    }

    // Limit content length to avoid API issues (max 512 characters)
    const limitedContent = postContent.substring(0, 512);

    console.log("📤 Sending to Hugging Face API...");

    // Call Hugging Face zero-shot classification API
    // Zero-shot = can classify without training data
    const result = await hf.zeroShotClassification({
      inputs: limitedContent,
      parameters: {
        candidate_labels: CAMPUS_TAGS,
      },
      model: "facebook/bart-large-mnli", // Free model, no API key needed for inference
    });

    // Debug: Log the response
    console.log("📥 API Response received");

    // Extract top 3 tags from the response
    let topTags = [];
    
    if (Array.isArray(result) && result.length > 0) {
      // Response is directly an array of {label, score} objects
      console.log("✅ Response is array format (Hugging Face standard)");
      
      // Extract just the labels from top 3 items
      topTags = result
        .slice(0, 3)
        .map(item => item.label)
        .filter(label => label && typeof label === 'string'); // Ensure they're valid strings
      
      console.log("✅ Extracted tags:", topTags);
    } else if (result && result.labels && Array.isArray(result.labels)) {
      // Alternative format with labels array
      console.log("✅ Response has labels property");
      topTags = result.labels.slice(0, 3).filter(label => typeof label === 'string');
    } else {
      // Unexpected format
      console.warn("⚠️ Unexpected response format:", typeof result);
      return getTagsFromKeywords(postContent);
    }

    if (topTags.length === 0) {
      console.warn("⚠️ No valid tags extracted, using fallback");
      return getTagsFromKeywords(postContent);
    }

    console.log(`✅ Auto-tagged post: ${topTags.join(", ")}`);
    return topTags;

  } catch (error) {
    // If API fails, log error and use fallback
    console.error("❌ Error auto-tagging post:", error.message);
    
    // Fallback: Try simple keyword matching if API fails
    console.log("🔄 Switching to keyword-based fallback...");
    return getTagsFromKeywords(postContent);
  }
};

// ============================================================
// FALLBACK FUNCTION - Keyword-based tagging if API fails
// ============================================================
// What it does:
// 1. Searches post content for keywords
// 2. Returns matching tags
// 3. Simple and fast backup method

function getTagsFromKeywords(postContent) {
  try {
    const text = postContent.toLowerCase();
    const matchedTags = [];

    // Define keyword patterns for each tag
    const keywordMap = {
      "ReactJS": ["react", "jsx", "component", "frontend framework"],
      "NodeJS": ["node", "express", "backend", "nodejs"],
      "DSA": ["algorithm", "data structure", "dsa", "coding", "array", "linked list", "tree"],
      "Placement": ["placement", "recruit", "job", "company", "campus recruit", "drive"],
      "Hackathon": ["hackathon", "hack", "competition", "coding competition"],
      "Mentorship": ["mentor", "guidance", "guide", "help", "senior", "junior"],
      "Learning": ["learn", "study", "course", "tutorial", "beginner", "new to"],
      "Interview": ["interview", "question", "prep", "interview prep", "preparation"],
      "WebDevelopment": ["web", "website", "html", "css", "frontend", "ui/ux"],
      "Project": ["project", "built", "created", "developed", "github", "repository"],
      "Career": ["career", "professional", "growth", "development", "path"],
      "Internship": ["internship", "intern", "summer", "remote internship"],
      "SystemDesign": ["system design", "scalability", "architecture", "distributed"],
      "Database": ["database", "sql", "mysql", "mongodb", "nosql"],
      "Collaboration": ["team", "collaborate", "collaborate", "group", "teammate"],
    };

    // Check which tags match keywords in the content
    for (const [tag, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        matchedTags.push(tag);
        if (matchedTags.length >= 3) break; // Limit to 3 tags
      }
    }

    if (matchedTags.length > 0) {
      console.log(`⚠️ Using keyword-based fallback tags: ${matchedTags.join(", ")}`);
    } else {
      console.log(`⚠️ No keywords matched, returning empty tags`);
    }
    
    return matchedTags;
  } catch (err) {
    console.error("Error in keyword fallback:", err.message);
    return [];
  }
}

// ============================================================
// DEBUG FUNCTION - Test auto-tagging with sample content
// ============================================================
// What it does:
// 1. Tests the auto-tagging function
// 2. Useful for debugging and validation

exports.testAutoTagger = async () => {
  console.log("🧪 Testing auto-tagger...");

  const testPosts = [
    "Just completed a React project for e-commerce. Built components for product listing and cart management.",
    "Looking for interview prep tips. Have DSA questions and coding challenges to practice.",
    "Anyone interested in a hackathon? Looking for teammates to build an innovative solution.",
    "Struggling with NodeJS and Express. Can someone mentor me?",
  ];

  for (const post of testPosts) {
    console.log(`\nContent: "${post.substring(0, 50)}..."`);
    const tags = await exports.autoTagPost(post);
    console.log(`Tags: ${tags.join(", ")}\n`);
  }
};
