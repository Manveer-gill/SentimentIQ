const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
    },
    sentiment: {
      type: String,
      required: [true, 'Sentiment classification is required'],
      enum: ['Positive', 'Negative', 'Neutral'],
      index: true,
    },
    score: {
      type: Number,
      required: [true, 'Sentiment score is required'],
      index: true,
    },
    comparative: {
      type: Number,
      default: 0,
    },
    label: {
      type: String,
      required: [true, 'Sentiment label is required'],
      trim: true,
    },
    positiveWords: {
      type: [String],
      default: [],
    },
    negativeWords: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for fast filtering and sorting
ReviewSchema.index({ sentiment: 1, createdAt: -1 });
ReviewSchema.index({ score: 1 });

module.exports = mongoose.model('Review', ReviewSchema);
