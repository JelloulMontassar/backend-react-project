const mailSender = require("./mailsender");

const sendNominatedEmails = async (nominatedChoristes) => {
    try {
      nominatedChoristes.forEach(async (choriste) => {
        const subject = 'Information importante concernant votre statut dans le chœur';
        const content = `<p>Cher/Chère ${choriste.nom} ${choriste.prenom},\n\n<br/>
        Nous vous informons qu'en raison de vos absences, vous avez dépassé le seuil de nomination et êtes désormais nominé(e) pour l'élimination du chœur.<br/>
        Veuillez prendre note de cette information importante.
        \n\nCordialement,<br/>\nOrchestre symphonique de Carthage</p>`;
  
        // send email
        await mailSender.sendEmail(subject, choriste.email, content);
      });
  
      console.log('Nominated choristers emails sent successfully');
    } catch (error) {
      console.error("Error sending nominated choristers emails:", error);
      throw new Error("Error sending nominated choristers emails");
    }
  };
  module.exports = {
    sendNominatedEmails
  }