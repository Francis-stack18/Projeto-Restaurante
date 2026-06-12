const nodemailer = require("nodemailer");

module.exports = {
  send(to, subject, html) {
    return new Promise((resolve, reject) => {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      });

      let mailOptions = {
        from: '"Restaurante Saboroso" <nao-responda@saboroso.com.br>',
        to: to,
        subject: subject,
        html: html,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  },
};
