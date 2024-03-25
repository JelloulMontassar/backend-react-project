const accountEmailTemplate = (email,password) => {
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
             
              text-decoration:none;
          }
          </style>
      </head>
      <body>
          <div class="container">
          <header>
              <h1 class="title">Votre compte chœur</h1>
          </header>
          <div class="content">
              <p>Bonjour ,</p>
              <p>
              email : <strong>${email}</strong>
              </p>
              <p>
              mot de passe : <strong>${password}</strong>
              </p>
              <p>
              L'équipe du chœur
              </p>
          </div>
          </div>
      </body>
      </html>
    
      `;
  
    c;
  };

  module.exports = {
    accountEmailTemplate
  }