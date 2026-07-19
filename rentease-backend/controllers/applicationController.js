const Application  = require('../models/Application');
const Property     = require('../models/Property');
const sendEmail    = require('../utils/sendEmail');
const { sendNotification } = require('../services/socketService');
const Notification = require('../models/Notification');
const PDFDocument  = require('pdfkit');

// Helper — create and push in-app notification
const notify = async (userId, type, title, body, link = '') => {
  const n = await Notification.create({ userId, type, title, body, link });
  sendNotification(userId, n);
};

// POST /api/v1/applications
exports.submitApplication = async (req, res) => {
  const { propertyId, message } = req.body;

  const property = await Property.findById(propertyId).populate('ownerId', 'name email');
  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  // Guard — Kaggle imported properties have no owner
  if (!property.ownerId) {
    return res.status(400).json({ 
      success: false, 
      message: 'This property cannot accept applications — no owner assigned.' 
    });
  }

  const documents = req.files ? req.files.map(f => ({ label: f.originalname, url: f.path })) : [];

  const application = await Application.create({
    tenantId:   req.user._id,
    propertyId,
    ownerId:    property.ownerId._id,
    message,
    documents,
  });

  // Notify owner
  await notify(
    property.ownerId._id,
    'application',
    'New Application Received',
    `${req.user.name} applied for ${property.title}`,
    '/dashboard/applications'
  );

  res.status(201).json({ success: true, data: application });
};

// GET /api/v1/applications/my-applications
exports.getMyApplications = async (req, res) => {
  const apps = await Application.find({ tenantId: req.user._id })
    .populate('propertyId', 'title suburb images rentPrice').sort('-createdAt');
  res.json({ success: true, data: apps });
};

// GET /api/v1/applications/:id
exports.getApplication = async (req, res) => {
  const app = await Application.findById(req.params.id)
    .populate('tenantId', 'name email avatar phone')
    .populate('propertyId', 'title suburb images rentPrice');
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
  const isOwner  = app.ownerId.toString()  === req.user._id.toString();
  const isTenant = app.tenantId._id.toString() === req.user._id.toString();
  if (!isOwner && !isTenant && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorised' });
  }
  res.json({ success: true, data: app });
};

// PATCH /api/v1/applications/:id/withdraw
exports.withdrawApplication = async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, tenantId: req.user._id, status: 'pending' });
  if (!app) return res.status(404).json({ success: false, message: 'Application not found or cannot be withdrawn' });
  app.status = 'withdrawn';
  await app.save();
  res.json({ success: true, data: app });
};

// GET /api/v1/applications/received
exports.getReceivedApplications = async (req, res) => {
  const apps = await Application.find({ ownerId: req.user._id })
    .populate('tenantId', 'name email avatar').populate('propertyId', 'title suburb').sort('-createdAt');
  res.json({ success: true, data: apps });
};

// PATCH /api/v1/applications/:id/approve
exports.approveApplication = async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, ownerId: req.user._id })
    .populate('tenantId', 'name email').populate('propertyId', 'title suburb street_address rentPrice');
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

  app.status = 'approved';

  // Generate PDF lease in memory
  const PDFDoc = new PDFDocument({ margin: 50 });
  const chunks = [];
  PDFDoc.on('data', c => chunks.push(c));
  PDFDoc.on('end', async () => {
    const pdfBuffer = Buffer.concat(chunks);
    // In production, upload pdfBuffer to Cloudinary here
    // For now, attach as base64 data URL
    app.leaseUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;
    await app.save();

    // Notify tenant
    await notify(app.tenantId._id, 'application', 'Application Approved! 🎉',
      `Your application for ${app.propertyId.title} has been approved.`, '/dashboard/applications');
    await sendEmail({
      to: app.tenantId.email,
      subject: 'Your RentEase Application was Approved!',
      html: `<h2>Congratulations ${app.tenantId.name}!</h2>
             <p>Your application for <strong>${app.propertyId.title}</strong> in <strong>${app.propertyId.suburb}</strong> has been approved.</p>
             <p>Log in to your dashboard to download your lease agreement.</p>`,
    }).catch(() => {});

    res.json({ success: true, data: app });
  });

  // Build PDF content
  PDFDoc.fontSize(20).text('RENTAL LEASE AGREEMENT', { align: 'center' });
  PDFDoc.moveDown();
  PDFDoc.fontSize(12).text(`Tenant: ${app.tenantId.name}`);
  PDFDoc.text(`Property: ${app.propertyId.title}`);
  PDFDoc.text(`Address: ${app.propertyId.street_address || app.propertyId.suburb}`);
  PDFDoc.text(`Weekly Rent: AUD $${app.propertyId.rentPrice}`);
  PDFDoc.text(`Date: ${new Date().toDateString()}`);
  PDFDoc.moveDown();
  PDFDoc.text('This lease is generated automatically by RentEase. Both parties agree to the standard terms and conditions.');
  PDFDoc.end();
};

// PATCH /api/v1/applications/:id/reject
exports.rejectApplication = async (req, res) => {
  const app = await Application.findOne({ _id: req.params.id, ownerId: req.user._id })
    .populate('tenantId', 'name email').populate('propertyId', 'title');
  if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
  app.status       = 'rejected';
  app.rejectReason = req.body.reason || '';
  await app.save();
  await notify(app.tenantId._id, 'application', 'Application Update',
    `Your application for ${app.propertyId.title} was not successful.`, '/dashboard/applications');
  res.json({ success: true, data: app });
};

// GET /api/v1/applications  [admin]
exports.getAllApplications = async (req, res) => {
  const apps = await Application.find()
    .populate('tenantId', 'name email').populate('propertyId', 'title suburb').sort('-createdAt');
  res.json({ success: true, data: apps });
};
