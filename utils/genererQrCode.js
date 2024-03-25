const QRCode = require("qrcode");

async function genererQrCodeAleatoire() {
  try {
    const donneesAleatoires = Math.random().toString(36).substring(2, 10);

    const qrCode = await QRCode.toDataURL(donneesAleatoires);
    return [qrCode,donneesAleatoires];
  } catch (error) {
    console.error("Erreur lors de la génération du code QR :", error);
    throw error;
  }
}
function isQRCodeUnique(code, concerts) {
    return !concerts.some(concert => concert.qrCode && concert.qrCode.code === code);
  }
// genererQrCodeAleatoire()
//   .then(qrCode => {
//     console.log('Code QR généré avec des données aléatoires :', qrCode);
//   })
//   .catch(error => {
//     console.error('Erreur :', error);
//   });
module.exports = {genererQrCodeAleatoire,isQRCodeUnique};