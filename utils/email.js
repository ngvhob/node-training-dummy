const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  const emailOptions = {
    from: 'node-dummy@node.com',
    to: options.to,
    subject: options.subject,
    text: options.text
  };

  const mail = await transporter.sendMail(emailOptions); // Corrected method name
  if (mail) {
    console.log('Mail Sent');
  }
};

module.exports = sendEmail;
