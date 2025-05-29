const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER, // info@meetsuite.io
    pass: process.env.EMAIL_PASS, // Password for info@meetsuite.io
  },
  tls: {
    ciphers: 'SSLv3',
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Transporter is ready to send emails');
  }
});

const mailOptions = {
  from: `"Meet Suite" <${process.env.EMAIL_USER}>`,
  to: 'mithushan0099@gmail.com', // Replace with a valid recipient email
  subject: 'Test Email from Nodemailer',
  text: 'This is a test email to verify Nodemailer setup with Namecheap Private Email.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent:', info.response);
  }
});