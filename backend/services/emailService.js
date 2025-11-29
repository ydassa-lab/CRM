const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendWelcomeEmail = async (to, prenom) => {
  await transporter.sendMail({
    from: `"CRM Madagascar" <${process.env.SMTP_USER}>`,
    to,
    subject: "Votre compte CRM est maintenant actif",
    html: `
      <h2>Bienvenue ${prenom} !</h2>
      <p>Votre compte client sur la plateforme CRM est maintenant <strong>activé</strong>.</p>
      <p>Vous pouvez maintenant vous connecter et accéder à vos fonctionnalités.</p>
      <br/>
      <p><strong>Bonne expérience sur notre plateforme.</strong></p>
    `,
  });
};
