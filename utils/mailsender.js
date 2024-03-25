const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL_ADDRESS,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});

const sendEmail = (subject, reciever,content) => {
  const mailOptions = {
    from: process.env.SENDER_EMAIL_ADDRESS,
    to: reciever,
    subject: subject,
    html: content,
  };

  transporter.sendMail(mailOptions)
};

module.exports = {
  sendEmail,
};
