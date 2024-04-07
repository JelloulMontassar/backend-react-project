const { notifDanger } = require("./notifinfourgente");
const server = require("http").createServer();

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});


io.on("connection", (socket) => {
  console.log("a user connected");
  notifDanger(socket, io);
});

server.listen(4000);
module.exports.io = io;
