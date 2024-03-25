const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();
module.exports.loggedMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET);
    const userId = decodedToken.userId;
    User.findOne({ _id: userId }).then((result) => {
      if (result) {
        req.auth = {
          userId: userId,
          role: result.role,
        };
        //console.log("req.auth set:", req.auth);
        next();
      } else {
        res.status(404).json({ error: "user does not exist" });
      }
    });
  } catch (error) {
    res.status(401).json({ error: "You have to sign in !" });
  }
};

module.exports.checkUserRole = (roles) => {
  return (req, res, next) => {
    try {
      if (req.auth && roles.includes(req.auth.role)) {
        next();
      } else {
        res.status(403).json({ error: "No access for this route" });
      }
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };
};

module.exports.isChoristeOrAdmin = module.exports.checkUserRole(["choriste", "admin"]);


module.exports.isChoriste = module.exports.checkUserRole("choriste");
module.exports.isChefDePupitre = module.exports.checkUserRole("chef de pupitre");
module.exports.isChefDeChoeur = module.exports.checkUserRole("chef de choeur");
module.exports.isManager = module.exports.checkUserRole("manager");
module.exports.isAdmin = module.exports.checkUserRole("admin");
