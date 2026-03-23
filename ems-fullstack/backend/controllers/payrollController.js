// backend/controllers/payrollController.js
const Payroll     = require('../models/Payroll');
const User        = require('../models/User');
const { addAudit }= require('../middleware/auth');

// GET /api/payroll/my  — employee sees own payslips
exports.getMyPayroll = async (req, res) => {
  const records = await Payroll.find({ userId: req.user._id }).sort({ month: -1 });
  res.json({ success: true, records });
};

// GET /api/payroll/all?month=YYYY-MM  — HR/CEO
exports.getAllPayroll = async (req, res) => {
  const filter = {};
  if (req.query.month) filter.month = req.query.month;
  const records = await Payroll.find(filter)
    .populate('userId', 'name eid dept title salary')
    .sort({ month: -1 });
  res.json({ success: true, records });
};

// POST /api/payroll/run  — HR generates payroll for a month
exports.runPayroll = async (req, res) => {
  const { month } = req.body;   // 'YYYY-MM'
  if (!month) return res.status(400).json({ success: false, message: 'Month required' });

  const users = await User.find({ isActive: true });
  const [yr, mo] = month.split('-');
  const monthLabel = new Date(yr, mo - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const created = [];

  for (const u of users) {
    const exists = await Payroll.findOne({ userId: u._id, month });
    if (exists) continue;

    const basic     = Math.round(u.salary * 0.5);
    const hra       = Math.round(u.salary * 0.2);
    const transport = Math.round(u.salary * 0.05);
    const gross     = basic + hra + transport;
    const tds       = Math.round(gross * 0.1);
    const pf        = Math.round(basic * 0.12);
    const profTax   = 200;
    const totalDed  = tds + pf + profTax;
    const netPay    = gross - totalDed;

    const p = await Payroll.create({
      userId: u._id, month, monthLabel,
      basic, hra, transport, bonus: 0, gross,
      tds, pf, profTax, totalDeductions: totalDed, netPay,
      status: 'paid', paidOn: new Date(yr, mo - 1, 28),
    });
    created.push(p);
  }

  await addAudit(req.user._id, 'PAYROLL_RUN', 'OK', { month, count: created.length }, req.ip);
  res.json({ success: true, message: `Payroll generated for ${created.length} employees`, records: created });
};

// PUT /api/payroll/:id  — update bonus / status
exports.updatePayroll = async (req, res) => {
  const { bonus, status } = req.body;
  const p = await Payroll.findById(req.params.id);
  if (!p) return res.status(404).json({ success: false, message: 'Record not found' });

  if (bonus !== undefined) {
    p.bonus = bonus;
    p.gross = p.basic + p.hra + p.transport + bonus;
    p.tds   = Math.round(p.gross * 0.1);
    p.totalDeductions = p.tds + p.pf + p.profTax;
    p.netPay = p.gross - p.totalDeductions;
  }
  if (status) p.status = status;
  await p.save();
  res.json({ success: true, record: p });
};
