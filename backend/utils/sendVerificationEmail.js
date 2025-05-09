const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // Configura en tu .env
      pass: process.env.EMAIL_PASS
    }
  });

  const verificationLink = `http://localhost:5000/api/verify-email/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verifica tu cuenta en SocialBkland',
    html: `<h2>¡Bienvenido!</h2><p>Haz clic en el siguiente enlace para verificar tu correo:</p><a href="${verificationLink}">${verificationLink}</a>`
  });
};

module.exports = sendVerificationEmail;
