// routes/contact.js
import express from 'express';
import Joi from 'joi';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Validation schema
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  company: Joi.string().allow('', null),
  message: Joi.string().min(10).required()
});

router.post('/', async (req, res) => {
  const { error, value } = contactSchema.validate(req.body);
  if (error)
    return res.status(400).json({ success: false, message: error.details[0].message });

  const { name, email, company, message } = value;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `📨 Contact from ${name} (${company || 'No Company'})`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-line;">${message}</p>
        <hr />
        <p style="font-size: 12px;">You received this from the OMS Contact Form.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Email sending error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send message. Try again later.' });
  }
});

export default router;
