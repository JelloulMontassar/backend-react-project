const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Saison = require("../models/saison");
const { generateRandomPassword } = require("../utils/passwords");
require("dotenv").config();

exports.registerUser = async (req, res) => {
  try {
    const userData = req.body;
    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("password" + password);
    const newUser = new User({
      ...userData,
      password: hashedPassword,
    });
    await newUser.save();
    res.status(201).json({ message: "user created successfully !", password });
    console.log("success");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({ message: "Invalid login !" });
    }

    const saison = await Saison.findOne();
    const isEliminated = saison.ListeDesElimines.some(
      (elimination) => elimination.choriste.toString() === user._id.toString()
    );
    console.log(isEliminated);
    if (isEliminated) {
      // Check if the elimination period is over
      const eliminationInfo = saison.ListeDesElimines.find(
        (elimination) => elimination.choriste.toString() === user._id.toString()
      );
      console.log(eliminationInfo);
      if (
        eliminationInfo.dateFinElimination &&
        new Date() < new Date(eliminationInfo.dateFinElimination)
      ) {
        // User is still eliminated
        return res
          .status(403)
          .json({
            message:
              "You are temporarily eliminated. Please try again after the elimination period.",
          });
      } else {
        // Reactivate the user
        await Saison.updateOne(
          { _id: saison._id },
          {
            $pull: {
              ListeDesElimines: {
                choriste: user._id,
              },
            },
          }
        );
        eliminationInfo.dateFinElimination = null;
        await saison.save();
        await user.save();
      }
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password !" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.RANDOM_TOKEN_SECRET,
      {
        expiresIn: process.env.EXPIRES_IN,
      }
    );

    res.status(200).json({ token: token, role: user.role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
/*   // Check if the user is eliminated
const saison = await Saison.findOne(); // You may need to adjust how you retrieve the season
const isEliminated = saison.ListeDesElimines.some(
  (elimination) => elimination.choriste.toString() === user._id.toString()
);

if (isEliminated) {
  // Check if the elimination period is over
  const eliminationInfo = saison.ListeDesElimines.find(
    (elimination) => elimination.choriste.toString() === user._id.toString()
  );

  if (
    eliminationInfo.dateFinElimination &&
    new Date() < new Date(eliminationInfo.dateFinElimination)
  ) {
    // User is still eliminated
    return res.status(403).json({ error: 'You are temporarily eliminated. Please try again after the elimination period.' });
  } else {
    // Reactivate the user
    user.isEliminated = false;
    eliminationInfo.dateFinElimination = null;
    await saison.save();
    await user.save();
  }
}*/
