require("dotenv").config()
const acceptCandidatEmailTemplate = (nom,prenom,id) => {
    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <title>Votre candidature au chœur</title>
          <style>
          body {
              font-family: sans-serif;
              font-size: 16px;
          }
      
          .container {
              width: 600px;
              margin: 0 auto;
          }
      
          .header {
              background-color: #ffffff;
              padding: 20px;
              border-bottom: 1px solid #e0e0e0;
          }
      
          .content {
              padding: 20px;
          }
      
          .footer {
              background-color: #ffffff;
              padding: 20px;
          }
      
          .logo {
              width: 100px;
              height: 100px;
              float: left;
          }
      
          .title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
          }
      
          .subtitle {
              font-size: 16px;
              margin-bottom: 20px;
          }
      
          .text {
              margin-bottom: 20px;
          }
      
          a {
              background-color: #0080ff;
              color: #ffffff;
              font-weight: bold;
              padding: 10px 20px;
              border-radius: 10px;
              text-decoration:none;
          }
          </style>
      </head>
      <body>
          <div class="container">
          <header>
              <h1 class="title">Votre candidature au chœur</h1>
          </header>
          <div class="content">
              <p>Bonjour <strong>${nom} ${prenom}</strong>,</p>
              <p>
              Nous avons le plaisir de vous informer que votre candidature au chœur a été acceptée.
              </p>
              <p>
              Vous trouverez ci-joint la charte du chœur, que nous vous invitons à lire attentivement.
              </p>
              <p>
              Dans l'attente de votre réponse,
              Bien cordialement,
              L'équipe du chœur
              </p>
          </div>
          <footer>
               <a href="${process.env.APP_URL}candidat/confirm/${id}" class="button">Accepter</a>
               <a href="${process.env.APP_URL}candidat/reject/${id}" class="button">Rejeter</a>
          </footer>
          </div>
      </body>
      </html>
    
      `;
  
    c;
  };

  module.exports = {
    acceptCandidatEmailTemplate
  }