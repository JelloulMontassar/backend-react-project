const mailSender = require("./mailsender"); 

async function envoyerEmail(candidat, dateDebut, dateFin) {
  try {
    const sujetEmail = "Détails de votre audition";
    const contenuEmail = `
      <p>Bonjour ${candidat.prenom} ${candidat.nom},</p>
      <p>Votre audition est prévue le ${dateDebut.format('DD/MM/YYYY')} de ${dateDebut.format('HH:mm')} à ${dateFin.format('HH:mm')}.</p>
      <p>Cordialement,<br/>Votre équipe d'audition</p>
    `;

    await mailSender.sendEmail(sujetEmail, candidat.email, contenuEmail);

    console.log(`E-mail envoyé à ${candidat.email}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail:", error);
    throw new Error("Erreur lors de l'envoi de l'e-mail");
  }
}
async function envoyerEmail2(candidat, dateDebut, dateFin) {
  try {
    const sujetEmail = "Détails de votre audition";
    const contenuEmail = `
      <p>Bonjour ${candidat.prenom} ${candidat.nom},</p>
      <p>Vous n'avez pas assisté à la precedente audition votre nouvelle audition aura lieu le ${dateDebut.format('DD/MM/YYYY')} de ${dateDebut.format('HH:mm')} à ${dateFin.format('HH:mm')}.</p>
      <p>Cordialement,<br/>Votre équipe d'audition</p>
    `;

    await mailSender.sendEmail(sujetEmail, candidat.email, contenuEmail);

    console.log(`E-mail envoyé à ${candidat.email}`);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail:", error);
    throw new Error("Erreur lors de l'envoi de l'e-mail");
  }
}
module.exports = {
    envoyerEmail,
    envoyerEmail2
  }