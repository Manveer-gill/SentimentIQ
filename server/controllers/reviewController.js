const { Readable } = require('stream');
const csv = require('csv-parser');
const Review = require('../models/Review');
const sentimentService = require('../services/sentimentService');

/**
 * @desc   Create and analyze a single review
 * @route  POST /api/reviews
 */
exports.createReview = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Review text is required and cannot be empty.',
      });
    }

    if (text.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Review text exceeds maximum allowed length (5000 characters).',
      });
    }

    // Run synchronous AFINN sentiment analysis
    const analysis = sentimentService.analyzeText(text);

    // Save to database
    const review = await Review.create({
      text: analysis.text,
      sentiment: analysis.sentiment,
      score: analysis.score,
      comparative: analysis.comparative,
      label: analysis.label,
      positiveWords: analysis.positiveWords,
      negativeWords: analysis.negativeWords,
    });

    return res.status(201).json({
      success: true,
      message: 'Review analyzed and saved successfully.',
      data: review,
    });
  } catch (error) {
    console.error('Error in createReview:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze review.',
    });
  }
};

/**
 * @desc   Bulk analyze and save reviews via CSV file upload or JSON payload
 * @route  POST /api/reviews/bulk
 */
exports.bulkUploadReviews = async (req, res) => {
  try {
    let reviewTexts = [];

    // Case 1: Uploaded CSV file
    if (req.file) {
      const bufferStream = Readable.from(req.file.buffer.toString('utf-8'));
      const parsedRows = await new Promise((resolve, reject) => {
        const rows = [];
        bufferStream
          .pipe(csv())
          .on('data', (row) => rows.push(row))
          .on('end', () => resolve(rows))
          .on('error', (err) => reject(err));
      });

      if (!parsedRows || parsedRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'The uploaded CSV file is empty or formatted incorrectly.',
        });
      }

      // Extract review text from common column headers or the first column
      const possibleKeys = ['review', 'text', 'feedback', 'comment', 'content', 'body', 'review_text', 'Review', 'Text', 'Feedback', 'Comment'];

      reviewTexts = parsedRows
        .map((row) => {
          // Find matching key
          for (const key of possibleKeys) {
            if (row[key] && typeof row[key] === 'string' && row[key].trim().length > 0) {
              return row[key].trim();
            }
          }
          // Fallback to first non-empty value in row
          const firstVal = Object.values(row).find((v) => typeof v === 'string' && v.trim().length > 0);
          return firstVal ? firstVal.trim() : null;
        })
        .filter(Boolean);
    }
    // Case 2: JSON payload { reviews: [...] }
    else if (req.body.reviews && Array.isArray(req.body.reviews)) {
      reviewTexts = req.body.reviews
        .map((r) => (typeof r === 'string' ? r.trim() : (r && r.text ? r.text.trim() : null)))
        .filter((t) => t && t.length > 0);
    } else {
      return res.status(400).json({
        success: false,
        message: 'No CSV file or reviews array provided.',
      });
    }

    if (reviewTexts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid review text could be extracted from the input.',
      });
    }

    // Limit batch size to 1000 items to ensure stability
    const cappedTexts = reviewTexts.slice(0, 1000);

    // Synchronously analyze all reviews in memory
    const analyzedDocs = cappedTexts.map((text) => {
      const result = sentimentService.analyzeText(text);
      return {
        text: result.text,
        sentiment: result.sentiment,
        score: result.score,
        comparative: result.comparative,
        label: result.label,
        positiveWords: result.positiveWords,
        negativeWords: result.negativeWords,
        createdAt: new Date(),
      };
    });

    // Bulk insert into MongoDB
    const inserted = await Review.insertMany(analyzedDocs);

    return res.status(201).json({
      success: true,
      message: `Successfully analyzed and saved ${inserted.length} reviews.`,
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    console.error('Error in bulkUploadReviews:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process bulk upload.',
    });
  }
};

/**
 * @desc   Get paginated reviews with search, filtering and sorting
 * @route  GET /api/reviews
 */
exports.getReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sentiment,
      label,
      search,
      sort = 'newest',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Filter by sentiment (Positive / Negative / Neutral)
    if (sentiment && ['Positive', 'Negative', 'Neutral'].includes(sentiment)) {
      query.sentiment = sentiment;
    }

    // Filter by specific label if provided
    if (label && label !== 'all') {
      query.label = label;
    }

    // Text search
    if (search && search.trim().length > 0) {
      query.text = { $regex: search.trim(), $options: 'i' };
    }

    // Sort order
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'most_negative' || sort === 'lowest_score') {
      sortOptions = { score: 1, createdAt: -1 };
    } else if (sort === 'most_positive' || sort === 'highest_score') {
      sortOptions = { score: -1, createdAt: -1 };
    }

    const [reviews, totalCount] = await Promise.all([
      Review.find(query).sort(sortOptions).skip(skip).limit(limitNum).lean(),
      Review.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return res.status(200).json({
      success: true,
      count: totalCount,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      reviews,
    });
  } catch (error) {
    console.error('Error in getReviews:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve reviews.',
    });
  }
};

/**
 * @desc   Get aggregate sentiment metrics for dashboard
 * @route  GET /api/stats
 */
exports.getStats = async (req, res) => {
  try {
    const total = await Review.countDocuments();

    if (total === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          total: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
          positivePercent: 0,
          negativePercent: 0,
          neutralPercent: 0,
          averageScore: 0,
          labelBreakdown: {
            'Strongly Positive': 0,
            'Positive': 0,
            'Neutral': 0,
            'Mildly Negative': 0,
            'Strongly Negative': 0,
          },
        },
      });
    }

    const [sentimentCounts, avgScoreResult, labelCounts] = await Promise.all([
      Review.aggregate([
        { $group: { _id: '$sentiment', count: { $sum: 1 } } },
      ]),
      Review.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$score' } } },
      ]),
      Review.aggregate([
        { $group: { _id: '$label', count: { $sum: 1 } } },
      ]),
    ]);

    let positive = 0;
    let negative = 0;
    let neutral = 0;

    sentimentCounts.forEach((item) => {
      if (item._id === 'Positive') positive = item.count;
      if (item._id === 'Negative') negative = item.count;
      if (item._id === 'Neutral') neutral = item.count;
    });

    const positivePercent = parseFloat(((positive / total) * 100).toFixed(1));
    const negativePercent = parseFloat(((negative / total) * 100).toFixed(1));
    const neutralPercent = parseFloat(((neutral / total) * 100).toFixed(1));
    const averageScore = avgScoreResult[0] ? parseFloat(avgScoreResult[0].avgScore.toFixed(2)) : 0;

    const labelBreakdown = {
      'Strongly Positive': 0,
      'Positive': 0,
      'Neutral': 0,
      'Mildly Negative': 0,
      'Strongly Negative': 0,
    };

    labelCounts.forEach((item) => {
      if (labelBreakdown[item._id] !== undefined) {
        labelBreakdown[item._id] = item.count;
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        positive,
        negative,
        neutral,
        positivePercent,
        negativePercent,
        neutralPercent,
        averageScore,
        labelBreakdown,
      },
    });
  } catch (error) {
    console.error('Error in getStats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to aggregate statistics.',
    });
  }
};

/**
 * @desc   Delete a single review by ID
 * @route  DELETE /api/reviews/:id
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
      id,
    });
  } catch (error) {
    console.error('Error in deleteReview:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete review.',
    });
  }
};

/**
 * @desc   Clear all reviews (demo / testing helper)
 * @route  DELETE /api/reviews
 */
exports.clearAllReviews = async (req, res) => {
  try {
    await Review.deleteMany({});
    return res.status(200).json({
      success: true,
      message: 'All reviews have been cleared.',
    });
  } catch (error) {
    console.error('Error in clearAllReviews:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear reviews.',
    });
  }
};

/**
 * @desc   Seed sample customer reviews
 * @route  POST /api/reviews/seed
 */
exports.seedSampleReviews = async (req, res) => {
  try {
    const sampleTexts = [
      "Outstanding app! The interface is clean, lightning fast, and has saved our team hours of work every day.",
      "Completely unacceptable experience. The app crashes every time I export data and customer support was completely unhelpful.",
      "The latest update is okay. Some features improved, but the navigation feels slightly clunky.",
      "Absolute game changer! Brilliant customer service and the analytics are extremely detailed and intuitive.",
      "Terrible update. It is buggy, slow, and deleted my saved configurations without warning. Very frustrated!",
      "Standard software, does what it says on the tin. Nothing spectacular, but no major issues either.",
      "I love this tool! Super easy to use, beautiful design, and very responsive support team.",
      "Waste of money. Constant errors, poor performance, and missing key advertised features.",
      "Average tool with moderate learning curve. Works fine for basic tasks.",
      "Incredible value! We migrated from a much more expensive alternative and couldn't be happier.",
      "Horrible delay in delivery and the package arrived damaged. Will never buy again.",
      "Everything arrived on time as described. Standard packaging and good condition."
    ];

    const analyzedDocs = sampleTexts.map((text) => {
      const result = sentimentService.analyzeText(text);
      return {
        text: result.text,
        sentiment: result.sentiment,
        score: result.score,
        comparative: result.comparative,
        label: result.label,
        positiveWords: result.positiveWords,
        negativeWords: result.negativeWords,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 5)), // randomized within past 5 days
      };
    });

    const inserted = await Review.insertMany(analyzedDocs);

    return res.status(201).json({
      success: true,
      message: `Seeded ${inserted.length} realistic sample reviews.`,
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    console.error('Error in seedSampleReviews:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to seed sample reviews.',
    });
  }
};
