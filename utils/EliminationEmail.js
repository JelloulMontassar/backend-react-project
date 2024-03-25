const mailSender = require("./mailsender");

const sendEliminatedEmails = async (nominatedChoristes) => {
    try {
      nominatedChoristes.forEach(async (choriste) => {
        const subject = 'Elimination du chœur';
        const content = `<p>Cher/Chère ${choriste.nom} ${choriste.prenom},\n\n<br/>
        Nous vous informons qu'en raison de vos absences, vous avez dépassé le seuil de l'élimination et êtes désormais exlus(e) du chœur.<br/>
        \n\nCordialement,<br/>\nOrchestre symphonique de Carthage</p>`;
  
        // send email
        await mailSender.sendEmail(subject, choriste.email, content);
      });
  
      console.log('Eliminated choristers emails sent successfully');
    } catch (error) {
      console.error("Error sending Eliminated choristers emails:", error);
      throw new Error("Error sending Eliminated choristers emails");
    }
  };
  module.exports = {
    sendEliminatedEmails
  }