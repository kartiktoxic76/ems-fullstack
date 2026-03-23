// backend/controllers/performanceController.js
const Performance = require('../models/Performance');
const { addAudit } = require('../middleware/auth');

// GET /api/performance/my
exports.getMyPerf = async (req, res) => {
  const records = await Performance.find({ userId: req.user._id })
    .populate('reviewerId', 'name').sort({ createdAt: -1 });
  res.json({ success: true, records });
};

// GET /api/performance/all
exports.getAllPerf = async (req, res) => {
  const { userId } = req.query;
  const filter = userId ? { userId } : {};
  const records = await Performance.find(filter)
    .populate('userId', 'name eid dept')
    .populate('reviewerId', 'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, records });
};

// POST /api/performance  — manager / hr creates review
exports.createReview = async (req, res) => {
  const { userId, period, codeQuality, teamwork, onTime, communication, initiative, goals, achievements, improvements, feedback } = req.body;
  if (!userId || !period) return res.status(400).json({ success: false, message: 'userId and period required' });

  const overall = parseFloat(((codeQuality + teamwork + onTime + communication + initiative) / 5).toFixed(1));

  const review = await Performance.create({
    userId, reviewerId: req.user._id, period,
    codeQuality, teamwork, onTime, communication, initiative,
    overallRating: overall, goals: goals || [], achievements, improvements, feedback,
  });
  await addAudit(req.user._id, 'REVIEW_CREATED', 'OK', { userId, period }, req.ip);
  res.status(201).json({ success: true, review });
};

// PUT /api/performance/:id
exports.updateReview = async (req, res) => {
  const review = await Performance.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  res.json({ success: true, review });
};
