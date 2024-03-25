const cron = require("node-cron");
const Repetition = require("./models/repetition");
const { io } = require("./socket.js");
const Notification = require("./models/notification");
const Users = require("./models/user");
const socketIoClient = require("socket.io-client");
const socket_client = socketIoClient("http://localhost:3000");
const startScheduler = () => {
  cron.schedule("48 14 * * *", async () => {
    try {
      const nearestRepetition = await Repetition.findOne({
        date: { $gte: new Date() },
      }).sort({ date: 1 });
      if (nearestRepetition) {
        const timeDifference = nearestRepetition.date - new Date();
        const daysDifference = Math.floor(
          timeDifference / (1000 * 60 * 60 * 24)
        );

        const users = await Users.find({ status: "actif" });

        const usersActif = users.map((item) => item._id);

        const notif = await Notification({
          message: `votre prochaine repetition va commancer dans ${daysDifference} jours a ${nearestRepetition.date}. Le lieu de repetition est : ${nearestRepetition.lieu}`,
          recipients: usersActif,
        });

        await notif.save();

        io.emit(
          "Rppel",
          `votre prochaine repetition va commancer dans ${daysDifference} jours a ${nearestRepetition.date}. Le lieu de repetition est : ${nearestRepetition.lieu}`
        );
      }
      console.log("La tâche cron s'est exécutée !");
    } catch (error) {
      console.error("Error querying MongoDB:", error);
    }
  });
};

socket_client.on("Rppel", (data) => {
  console.log("Received from server:", data);
});

module.exports = {
  startScheduler,
};
