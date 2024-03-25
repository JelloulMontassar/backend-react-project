const mailSender = require("./mailsender");

async function envoyerEmail(user) {
  try {
    const sujetEmail = "Confirmation de présence pour un concert";
    const contenuEmail = `
      <p>Bonjour ${user.prenom} ${user.nom},</p>
      <p>Vous avez indiqué votre disponibilité au prochain concert </p>
      <p>Cordialement,<br/>Orchestre symphonique de Carthage</p>
    `;
      await mailSender.sendEmail(sujetEmail, user.email, contenuEmail);
    
    console.log(`E-mail envoyé à ${user.email}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail:", error);
    throw new Error("Erreur lors de l'envoi de l'e-mail");
  }
}
module.exports = {
  envoyerEmail,
};
