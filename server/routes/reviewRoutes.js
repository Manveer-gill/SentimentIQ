const express = require('express');
const multer = require('multer');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Configure Multer for in-memory CSV file handling
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.csv') ||
      file.mimetype === 'text/plain'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv files are supported.'));
    }
  },
});

// Primary Review API Routes
router.post('/reviews', reviewController.createReview);
router.post('/reviews/bulk', upload.single('file'), reviewController.bulkUploadReviews);
router.get('/reviews', reviewController.getReviews);
router.delete('/reviews/:id', reviewController.deleteReview);
router.delete('/reviews', reviewController.clearAllReviews);

// Statistics and Seeding
router.get('/stats', reviewController.getStats);
router.post('/reviews/seed', reviewController.seedSampleReviews);

module.exports = router;
