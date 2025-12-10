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

// exports.sendWelcomeEmail = async (to, prenom) => {
//   await transporter.sendMail({
//     from: `"CRM Madagascar" <${process.env.SMTP_USER}>`,
//     to,
//     subject: "Votre compte CRM est maintenant actif",
//     html: `
//       <h2>Bienvenue ${prenom} !</h2>
//       <p>Votre compte client sur la plateforme CRM est maintenant <strong>activé</strong>.</p>
//       <p>Vous pouvez maintenant vous connecter et accéder à vos fonctionnalités.</p>
//       <br/>
//       <p><strong>Bonne expérience sur notre plateforme.</strong></p>
//     `,
//   });
// };

exports.sendWelcomeEmail = async (to, prenom) => {
  await transporter.sendMail({
    from: `"CRM Madagascar" <${process.env.SMTP_USER}>`,
    to,
    subject: "Activation de votre compte CRM Madagascar",
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        
        <!-- En-tête -->
        <div style="background: #2C3E50; padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">CRM Madagascar</h1>
          <p style="color: #B0BEC5; margin: 10px 0 0; font-size: 16px;">Plateforme de Gestion de la Relation Client</p>
        </div>
        
        <!-- Contenu -->
        <div style="padding: 40px 30px; background: #ffffff;">
          
          <!-- Salutation -->
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2C3E50; font-size: 20px; margin-bottom: 10px;">
              Madame, Monsieur ${prenom},
            </h2>
            <p style="color: #546E7A; line-height: 1.6; margin: 0;">
              Nous avons le plaisir de vous informer que votre compte sur la plateforme CRM Madagascar a été activé avec succès.
            </p>
          </div>
          
          <!-- Message principal -->
          <div style="background: #F8F9FA; border-left: 4px solid #3498DB; padding: 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
            <p style="color: #2C3E50; margin: 0 0 10px; font-weight: 600;">
              ✅ Accès activé
            </p>
            <p style="color: #546E7A; margin: 0; line-height: 1.6;">
              Vous pouvez désormais accéder à l'ensemble des fonctionnalités de notre plateforme de gestion client.
            </p>
          </div>
          
          <!-- Instructions -->
          <div style="margin: 30px 0;">
            <p style="color: #546E7A; margin-bottom: 15px;">
              <strong>Pour vous connecter :</strong>
            </p>
            <ul style="color: #546E7A; padding-left: 20px; margin: 0;">
              <li style="margin-bottom: 8px;">Utilisez vos identifiants précédemment communiqués</li>
              <li style="margin-bottom: 8px;">Accédez à l'interface de connexion sécurisée</li>
              <li>Explorez les différents modules à votre disposition</li>
            </ul>
          </div>
          
          <!-- Fonctionnalités -->
          <div style="margin: 30px 0; padding: 20px; background: #E8F4FD; border-radius: 6px;">
            <p style="color: #2C3E50; font-weight: 600; margin-bottom: 15px;">
              📋 Fonctionnalités disponibles :
            </p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #546E7A; border-bottom: 1px solid #CFD8DC;">
                  <span style="color: #3498DB;">•</span> Gestion centralisée des clients
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #546E7A; border-bottom: 1px solid #CFD8DC;">
                  <span style="color: #3498DB;">•</span> Facturation et suivi des paiements
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #546E7A; border-bottom: 1px solid #CFD8DC;">
                  <span style="color: #3498DB;">•</span> Système de tickets de support
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #546E7A;">
                  <span style="color: #3498DB;">•</span> Tableaux de bord analytiques
                </td>
              </tr>
            </table>
          </div>
          
          <!-- Support -->
          <div style="margin: 30px 0; text-align: center;">
            <p style="color: #546E7A; margin-bottom: 10px;">
              <strong>Assistance technique :</strong>
            </p>
            <p style="color: #3498DB; margin: 5px 0;">
              📧 support@crm-madagascar.mg
            </p>
            <p style="color: #3498DB; margin: 5px 0;">
              📞 +261 34 12 345 67
            </p>
          </div>
          
          <!-- Message de fin -->
          <div style="border-top: 1px solid #ECEFF1; padding-top: 20px; margin-top: 30px;">
            <p style="color: #546E7A; font-style: italic; margin: 0;">
              Nous restons à votre disposition pour toute question relative à l'utilisation de la plateforme.
            </p>
          </div>
          
        </div>
        
        <!-- Pied de page -->
        <div style="background: #263238; padding: 25px 20px; text-align: center;">
          <p style="color: #B0BEC5; margin: 0 0 10px; font-size: 14px;">
            © ${new Date().getFullYear()} CRM Madagascar. Tous droits réservés.
          </p>
          <p style="color: #78909C; margin: 0; font-size: 12px;">
            Cet email est envoyé automatiquement, merci de ne pas y répondre.
          </p>
          <p style="color: #78909C; margin: 10px 0 0; font-size: 12px;">
            <a href="#" style="color: #4FC3F7; text-decoration: none;">Politique de confidentialité</a> | 
            <a href="#" style="color: #4FC3F7; text-decoration: none;">Conditions d'utilisation</a>
          </p>
        </div>
        
      </div>
    `,
  });
};
