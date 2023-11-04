const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `Service Natours <${process.env.EMAIL_FROM}>`;
  }

  createTransporter() {
    if (process.env.NODE_ENV === 'production') {
      //SENDGRID
      return 1;
    } else {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    }
  }

  async send(template, mailSubject) {
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstname: this.firstname,
        url: this.url,
        subject: this.mailSubject
      }
    );

    const emailOptions = {
      from: this.from,
      to: this.to,
      subject: mailSubject,
      html: html,
      text: htmlToText.convert(html)
    };

    const status = await this.createTransporter().sendMail(emailOptions);
    if (status) {
      console.log('Email Sent');
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome To The Family.');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your Password Change Valid for 10 minuted!'
    );
  }
};
