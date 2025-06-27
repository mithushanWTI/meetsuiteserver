const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 443;

// Log environment variables for debugging
console.log('Environment variables:', {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? '****' : 'Not set',
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY ? '****' : 'Not set',
});

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://meetsuite.io', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Explicitly handle OPTIONS for /api/book
app.options('/api/book', cors({
  origin: ['https://meetsuite.io', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}), (req, res) => {
  res.status(204).send();
});

// Nodemailer configuration for Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Transporter is ready to send emails');
  }
});

// Endpoint to handle form submission
app.post('/api/book', async (req, res) => {
  console.log('Received request:', {
    origin: req.get('Origin'),
    method: req.method,
    headers: req.headers,
    body: req.body,
  });

  const {
    tripType,
    country,
    airportCode,
    service,
    name,
    email,
    phone,
    whatsapp,
    guests,
    baggageCount,
    flightNumber,
    travelDate,
    transitDetails,
    comments,
    recaptchaToken,
  } = req.body;

  // Validate required fields
  if (!name || !email || !recaptchaToken) {
    console.error('Missing required fields:', { name, email, recaptchaToken });
    return res.status(400).json({ error: 'Name, email, and reCAPTCHA token are required' });
  }

  // Verify reCAPTCHA v2 token
  try {
    const recaptchaResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { success } = recaptchaResponse.data;
    console.log('reCAPTCHA v2 verification response:', recaptchaResponse.data);

    if (!success) {
      console.error('reCAPTCHA verification failed:', recaptchaResponse.data);
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error.message, error.response?.data);
    return res.status(500).json({ error: 'Failed to verify reCAPTCHA', details: error.message });
  }

  // Prepare email content
  const mailOptions = {
    from: `"MeetSuite" <${process.env.EMAIL_USER}>`,
    to: 'mithushan0099@gmail.com',
    subject: 'New Booking Form Submission',
    text: `
      New Booking Submission:
      Trip Type: ${tripType || 'Not specified'}
      Country: ${country || 'Not specified'}
      Airport: ${airportCode || 'Not specified'}
      Service: ${service || 'Not specified'}
      Name: ${name || 'Not specified'}
      Email: ${email || 'Not specified'}
      Phone: ${phone || 'Not specified'}
      WhatsApp: ${whatsapp || 'Not specified'}
      Guests: Adults: ${guests?.adults || 0}, Children: ${guests?.children || 0}, Infants: ${guests?.infants || 0}
      Baggage Count: ${baggageCount || 'Not specified'}
      Flight Number: ${flightNumber || 'Not specified'}
      Travel Date: ${travelDate || 'Not specified'}
      Transit Details: ${transitDetails || 'Not applicable'}
      Comments: ${comments || 'Not specified'}
    `,
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', mailOptions.to);
    res.status(200).json({ message: 'Booking submitted successfully and email sent!' });
  } catch (error) {
    console.error('Error sending email:', error.message, error.code, error.response?.data);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});  