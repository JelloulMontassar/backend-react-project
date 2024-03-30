const express = require("express");
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");
require("dotenv").config();
app.use(express.urlencoded({ extended: true }));
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const candidatRoutes = require("./routes/candidat");
const auditionRoutes = require("./routes/audition");
const concertRoutes = require("./routes/concert");
const pupitreRoutes = require("./routes/pupitre");
const saisonRouter = require("./routes/saison");
const repititionRouter = require("./routes/repitition");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const ouvresRoutes = require("./routes/oeuvres");
const saisonRoutes = require("./routes/saison");
const congeRoutes = require("./routes/conge");
const { notifieradmin } = require("./controllers/candidat.js");
const cron = require("node-cron");
const { io } = require("./socket.js");
const { startScheduler } = require("./notifRappel");
const User = require("./models/user");

startScheduler();
app.use(cors());

cron.schedule("00 10 * * *", async () => {
  console.log("Cron job started");
  try {
    const liste = await notifieradmin();

    if (liste) {
      io.emit("notif-659082e55ad0d1b3ddfbf909", {
        message: "liste des candidatures",
        liste,
      });
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
});
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Projet Backend",
      version: "1.0.0",
      description: "lorem ipsum",
      contact: {
        name: "ala gtari",
        url: "https:www.facebook.com/profile.php?id=100007810788179",
        email: "agtari957@gmail.com",
      },
    },
    servers: [
      {
        url: process.env.APP_URL,
        description: "dev server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  apis: ["./routes/*.yaml"],
};


const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;

db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

db.once("open", () => {
  console.log("Connected to MongoDB");
});

app.use(express.json());
app.use("uploads", express.static("uploads"));
app.use((req, res, next) => {
  res.setHeader("Acces-Control-Allow-Origin", "*");
  res.setHeader(
    "Acces-Control-Allow-Header",
    "Origin, X-Requested-With, Content, Accept, Content-Type ,Authorization"
  );
  res.setHeader(
    "Acces-Control-Allow-Methods",
    "GET, POST, PUT , DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/api/candidat", candidatRoutes);
app.use("/api/audition", auditionRoutes);
app.use("/api/concert", concertRoutes);
app.use("/api/pupitre", pupitreRoutes);
app.use("/api/saison", saisonRouter);
app.use("/api/repetition", repititionRouter);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/oeuvres", ouvresRoutes);
app.use("/api/conge", congeRoutes);
app.use("/api/", (req, res) => {
  res.json(
    `hello world ! ${process.env.PORT} ${process.env.SENDER_EMAIL_ADDRESS} ${process.env.SENDER_EMAIL_PASSWORD} ${process.env.RANDOM_TOKEN_SECRET} ${process.env.EXPIRES_IN} ${process.env.MONGODB_URI} `
  );
});

module.exports = app;
