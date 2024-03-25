const socketIoClient = require("socket.io-client");
const socket_client = socketIoClient("http://localhost:3000");
const User = require("./models/user");
const Repetition = require("./models/repetition");
const Notification = require("./models/notification");

async function notifDanger(socket, io) {
  socket.on("setClientId", async (clientId) => {
    console.log(`Client with ID ${clientId} connected`);
    const user = await User.findOne({ _id: clientId, status: "actif" });
    if (user) {
      const repetitionIds = user.Repetitions.map((item) =>
        item.repetition.toString()
      );

      console.log(repetitionIds);

      await Repetition.watch().on("change", async (data) => {
        let updatedocument = {};
        let updaterep = {};
        if (repetitionIds.includes(data.documentKey._id.toString())) {
          console.log(data.documentKey._id.toString());
          if (data.operationType === "update") {
            const updatedrep = await Repetition.findById(data.documentKey._id);
            updaterep = updatedrep;
            updatedocument = {
              document: updatedrep._id,
              updatedFields: data.updateDescription.updatedFields,
            };
          }

          const notif = await Notification({
            message: envoienotification(updatedocument),
            recipients: updaterep.participants,
          });
          await notif.save();

          io.emit(
            "repetitionChange",
            envoienotification(updatedocument),
            (acknowledgement) => {
              if (acknowledgement) {
                console.log("Message successfully sent to all clients");
              } else {
                console.error("Failed to send message to clients");
              }
            }
          );

          function envoienotification(updatedocument) {
            let message = `urgent update :\Repitition : ${updatedocument.document}\n`;
            if (
              updatedocument.updatedFields.lieu &&
              updatedocument.updatedFields.date
            ) {
              message += `lieu :  ${updatedocument.updatedFields.lieu}\ndate:  ${updatedocument.updatedFields.date}`;
            } else if (updatedocument.updatedFields.lieu) {
              message += `lieu :  ${updatedocument.updatedFields.lieu}`;
            } else if (updatedocument.updatedFields.date) {
              message += `date :  ${updatedocument.updatedFields.date}`;
            }
            return message;
          }
        }
      });
    } else {
      console.log("user not found");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
}

socket_client.on("repetitionChange", (data) => {
  console.log("Received from server:", data);
});

module.exports = { notifDanger };
