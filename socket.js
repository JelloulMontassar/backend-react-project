const { notifDanger } = require("./notifinfourgente");
const server = require("http").createServer();
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("a user connected");
  notifDanger(socket, io);
});

server.listen(3000);
module.exports.io = io;
