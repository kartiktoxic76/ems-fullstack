// backend/seed.js
// Run once: node seed.js
require('dotenv').config();
const mongoose     = require('mongoose');
const bcrypt       = require('bcryptjs');
const connectDB    = require('./config/db');
require('./models/Performance'); // registers AuditLog too

const User         = require('./models/User');
const Attendance   = require('./models/Attendance');
const Leave        = require('./models/Leave');
const LeaveBalance = require('./models/LeaveBalance');
const Payroll      = require('./models/Payroll');
const Performance  = require('./models/Performance');

const hash = (pw) => bcrypt.hashSync(pw, 12);

const USERS = [
  { eid:'EMP-001', email:'emp001@ems.com', password: hash('Emp@2026'), role:'employee', name:'Rahul Sharma',    ini:'RS', dept:'Engineering',    title:'Senior Developer',      phone:'+91 98765 43210', joinDate:'Jan 15, 2023', salary:85000,  av:'a1', c:'#3b82f6', l:'#93c5fd', b:'rgba(59,130,246,.15)',   bankAcc:'HDFC ···· 4823', address:'Mumbai, Maharashtra' },
  { eid:'MGR-001', email:'mgr001@ems.com', password: hash('Mgr@2026'), role:'manager',  name:'Arjun Kumar',     ini:'AK', dept:'Engineering',    title:'Tech Lead / Manager',   phone:'+91 98712 34567', joinDate:'Mar 10, 2021', salary:120000, av:'a5', c:'#8b5cf6', l:'#c4b5fd', b:'rgba(139,92,246,.15)',   bankAcc:'SBI ···· 7712',  address:'Pune, Maharashtra' },
  { eid:'HR-001',  email:'hr001@ems.com',  password: hash('Hr@2026'),  role:'hr',       name:'Priya Mehta',     ini:'PM', dept:'Human Resources',title:'HR Manager',            phone:'+91 97654 32109', joinDate:'Jun 1, 2020',  salary:95000,  av:'a2', c:'#ec4899', l:'#f9a8d4', b:'rgba(236,72,153,.15)',   bankAcc:'ICICI ···· 3301',address:'Bangalore, Karnataka' },
  { eid:'ADM-001', email:'admin001@ems.com',password:hash('Admin@2026'),role:'admin',   name:'Neha Agarwal',    ini:'NA', dept:'IT & Admin',     title:'System Administrator',  phone:'+91 96543 21098', joinDate:'Sep 5, 2019',  salary:90000,  av:'a4', c:'#f59e0b', l:'#fcd34d', b:'rgba(245,158,11,.15)',   bankAcc:'Axis ···· 6690', address:'Delhi, NCR' },
  { eid:'CEO-001', email:'ceo001@ems.com', password: hash('Ceo@2026'), role:'ceo',      name:'Vikram Singhania',ini:'VS', dept:'Executive',      title:'Chief Executive Officer',phone:'+91 95432 10987', joinDate:'Jan 1, 2018',  salary:300000, av:'a3', c:'#10b981', l:'#6ee7b7', b:'rgba(16,185,129,.15)',   bankAcc:'HDFC ···· 0001', address:'Mumbai, Maharashtra' },
  { eid:'EMP-002', email:'emp002@ems.com', password: hash('Emp@2026'), role:'employee', name:'Anjali Patel',    ini:'AP', dept:'Marketing',      title:'Marketing Executive',   phone:'+91 94321 09876', joinDate:'Feb 17, 2024', salary:65000,  av:'a2', c:'#ec4899', l:'#f9a8d4', b:'rgba(236,72,153,.15)',   bankAcc:'HDFC ···· 5522', address:'Surat, Gujarat' },
  { eid:'EMP-003', email:'emp003@ems.com', password: hash('Emp@2026'), role:'employee', name:'Karan Patel',     ini:'KP', dept:'Engineering',    title:'Developer',             phone:'+91 93210 98765', joinDate:'Apr 1, 2023',  salary:70000,  av:'a5', c:'#8b5cf6', l:'#c4b5fd', b:'rgba(139,92,246,.15)',   bankAcc:'SBI ···· 4410',  address:'Ahmedabad, Gujarat' },
];

async function seed() {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Attendance.deleteMany({}), Leave.deleteMany({}),
    LeaveBalance.deleteMany({}), Payroll.deleteMany({}), Performance.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // Insert users
  const users = await User.insertMany(USERS);
  const byEid = {};
  users.forEach(u => { byEid[u.eid] = u; });
  console.log(`👥 Inserted ${users.length} users`);

  // Set manager IDs
  await User.updateOne({ eid:'EMP-001' }, { managerId: byEid['MGR-001']._id });
  await User.updateOne({ eid:'EMP-002' }, { managerId: byEid['MGR-001']._id });
  await User.updateOne({ eid:'EMP-003' }, { managerId: byEid['MGR-001']._id });

  // Attendance — past 30 days for main users
  const today = new Date();
  const attRecs = [];
  ['EMP-001','MGR-001','HR-001','EMP-002','EMP-003'].forEach(eid => {
    const uid = byEid[eid]._id;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const day = d.getDay();
      if (day === 0 || day === 6) { attRecs.push({ userId: uid, date: ds, status: 'weekend' }); continue; }
      const r = Math.random();
      if (r < 0.82) {
        const h1 = 8 + Math.floor(Math.random() * 2), m1 = Math.floor(Math.random() * 60);
        const h2 = 17 + Math.floor(Math.random() * 2), m2 = Math.floor(Math.random() * 60);
        const hrs = parseFloat(((h2 * 60 + m2 - h1 * 60 - m1) / 60).toFixed(2));
        attRecs.push({ userId: uid, date: ds, checkIn: `${String(h1).padStart(2,'0')}:${String(m1).padStart(2,'0')}`, checkOut: `${String(h2).padStart(2,'0')}:${String(m2).padStart(2,'0')}`, hoursWorked: hrs, status: 'present', source: 'manual' });
      } else if (r < 0.9) { attRecs.push({ userId: uid, date: ds, status: 'absent' }); }
      else { attRecs.push({ userId: uid, date: ds, status: 'leave' }); }
    }
  });
  await Attendance.insertMany(attRecs);
  console.log(`📅 Inserted ${attRecs.length} attendance records`);

  // Leave balances
  const balances = users.map(u => ({
    userId: u._id,
    casual: { total: 12, used: Math.floor(Math.random() * 4) },
    sick:   { total: 10, used: Math.floor(Math.random() * 3) },
    annual: { total: 21, used: Math.floor(Math.random() * 8) },
    unpaid: { total: 999, used: 0 },
  }));
  await LeaveBalance.insertMany(balances);
  console.log('🏖️  Inserted leave balances');

  // Leaves
  await Leave.insertMany([
    { userId: byEid['EMP-001']._id, type:'casual', from:'2026-01-20', to:'2026-01-21', days:2, reason:'Personal work', status:'approved', approvedById: byEid['MGR-001']._id, approvedAt: new Date('2026-01-18'), remark:'Approved' },
    { userId: byEid['EMP-001']._id, type:'annual',  from:'2026-02-14', to:'2026-02-16', days:3, reason:'Vacation with family', status:'pending' },
    { userId: byEid['EMP-003']._id, type:'sick',    from:'2026-01-15', to:'2026-01-15', days:1, reason:'Fever and cold', status:'approved', approvedById: byEid['MGR-001']._id, approvedAt: new Date('2026-01-14'), remark:'Get well soon' },
    { userId: byEid['EMP-002']._id, type:'casual',  from:'2026-02-10', to:'2026-02-10', days:1, reason:'Doctor appointment', status:'pending' },
    { userId: byEid['EMP-001']._id, type:'casual',  from:'2025-12-26', to:'2025-12-26', days:1, reason:'Personal errand', status:'rejected', approvedById: byEid['MGR-001']._id, approvedAt: new Date('2025-12-24'), remark:'Busy project deadline' },
  ]);
  console.log('📝 Inserted leaves');

  // Payroll — 3 months
  const months = ['2025-11','2025-12','2026-01'];
  const payrollRecs = [];
  for (const u of users) {
    for (const month of months) {
      const [yr, mo] = month.split('-');
      const monthLabel = new Date(yr, mo - 1).toLocaleDateString('en-US', { month:'long', year:'numeric' });
      const basic = Math.round(u.salary * 0.5), hra = Math.round(u.salary * 0.2), transport = Math.round(u.salary * 0.05);
      const gross = basic + hra + transport;
      const tds = Math.round(gross * 0.1), pf = Math.round(basic * 0.12), profTax = 200;
      const totalDed = tds + pf + profTax;
      payrollRecs.push({ userId: u._id, month, monthLabel, basic, hra, transport, bonus:0, gross, tds, pf, profTax, totalDeductions: totalDed, netPay: gross - totalDed, status:'paid', paidOn: new Date(yr, mo - 1, 28) });
    }
  }
  await Payroll.insertMany(payrollRecs);
  console.log(`💰 Inserted ${payrollRecs.length} payroll records`);

  // Performance reviews
  await Performance.insertMany([
    { userId: byEid['EMP-001']._id, reviewerId: byEid['MGR-001']._id, period:'Q4-2025', codeQuality:4, teamwork:5, onTime:4, communication:4, initiative:4, overallRating:4.2, goals:[{title:'NodeJS Certification',progress:60,status:'in-progress'},{title:'Mentor 2 Juniors',progress:100,status:'done'},{title:'API Module',progress:45,status:'in-progress'}], achievements:'Completed 3 major features. Reduced API response time by 40%.', improvements:'Need to improve documentation practices.', feedback:'Excellent team player. Strong technical skills. Keep it up!' },
    { userId: byEid['EMP-003']._id, reviewerId: byEid['MGR-001']._id, period:'Q4-2025', codeQuality:3, teamwork:4, onTime:3, communication:3, initiative:3, overallRating:3.2, goals:[{title:'Complete React training',progress:40,status:'in-progress'},{title:'Fix legacy bugs',progress:70,status:'in-progress'}], achievements:'Fixed 12 bugs in production.', improvements:'Needs to improve on deadlines and communication.', feedback:'Good effort, needs more consistency.' },
    { userId: byEid['EMP-002']._id, reviewerId: byEid['HR-001']._id, period:'Q4-2025', codeQuality:0, teamwork:5, onTime:5, communication:5, initiative:5, overallRating:5.0, goals:[{title:'Social Media Campaign',progress:100,status:'done'},{title:'Brand Refresh',progress:80,status:'in-progress'}], achievements:'Led Q4 campaign, 200% ROI.', improvements:'None noted.', feedback:'Outstanding performance this quarter.' },
  ]);
  console.log('⭐ Inserted performance reviews');

  console.log('\n✅ Seed complete! Login credentials:');
  console.log('   Employee : emp001@ems.com  / Emp@2026');
  console.log('   Manager  : mgr001@ems.com  / Mgr@2026');
  console.log('   HR       : hr001@ems.com   / Hr@2026');
  console.log('   Admin    : admin001@ems.com / Admin@2026');
  console.log('   CEO      : ceo001@ems.com  / Ceo@2026');
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); mongoose.disconnect(); });
