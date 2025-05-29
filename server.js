const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

// Log environment variables for debugging
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
}));

// Nodemailer configuration for Namecheap Private Email
const transporter = nodemailer.createTransport({
  host: 'business94.web-hosting.com',
  port: 465,
  secure: true, // Use TLS
  auth: {
    user: process.env.EMAIL_USER, // info@meetsuite.io
    pass: process.env.EMAIL_PASS, // Password for info@meetsuite.io
  },
  tls: {
    // Ensure compatibility with Namecheap's TLS requirements
    ciphers: 'SSLv3',
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
  } = req.body;

  const mailOptions = {
    from: `"MeetSuite" <${process.env.EMAIL_USER}>`, // Sender name and email
    to: 'ops@ftsaero.com', // Recipient email
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
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Booking submitted successfully and email sent!' });
  } catch (error) {
    console.error('Error sending email:', error.message, error.code, error.response);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

