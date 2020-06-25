const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url = '', code = '') {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.code = code;
    this.from = process.env.EMAIL_FROM;
  }

  newTransport() {
    // 1) Create a transporter (Service that will actually send the email)
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD
      }
    });
  }

  async send(template, subject) {
    // Send the actual email
    // 1) Render HTML based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      code: this.code,
      subject
    });
    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      `${this.code} is your Natours account recovery code (Valid for 10 minutes)`
    );
  }

  async sendVerificationCode() {
    await this.send('verificationCode', 'Your verification code (Valid for 10 minutes)');
  }
};
