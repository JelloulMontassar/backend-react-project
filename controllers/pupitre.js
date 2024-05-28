const Pupitre = require("../models/pupitre");
const User = require("../models/user");
const Concert = require("../models/concert");
const Oeuvre = require("../models/oueuvre");
const Repitition = require("../models/repetition");
const { io } = require("../socket");
const defineNeeds = async (req, res) => {
  try {
    const [pupitre] = await Pupitre.find({ type_voix: req.params.name });

    if (pupitre) {
      try {
        pupitre.besoin = req.body.besoin;
        await pupitre.save();
        res.status(200).json({
          payload: pupitre,
        });
      } catch (error) {
        res.status(500).json({
          message: "bad value of 'besoin' ",
          error: error.message,
        });
      }
    } else {
      res.status(404).json({
        message: "pupitre not found !",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "server error ",
      error: error.message,
    });
  }
};
const getAll = async (req, res) => {
  try {
    const pupitre = await Pupitre.find({});

    res.status(200).json({
      payload: pupitre,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "server error ",
      error: error.message,
    });
  }
};
const designer2Chefs = async (req, res) => {
  const { pupitreId, chef1Id, chef2Id } = req.body;

  if (!chef1Id || !chef2Id) {
    return res
      .status(400)
      .json({ message: "Both chef1Id and chef2Id are required" });
  }

  try {
    const pupitre = await Pupitre.findById(pupitreId)
      .populate("membres chef_pupitre");
    if (!pupitre) {
      return res.status(404).json({ message: "Pupitre not found" });
    }

    // Demote old chefs to members
    const oldChefs = pupitre.chef_pupitre;
    for (let oldChefId of oldChefs) {
      const oldChef = await User.findById(oldChefId);
      if (oldChef) {
        oldChef.role = "choriste";
        await oldChef.save();
        pupitre.membres.push(oldChefId);
      }
    }

    pupitre.chef_pupitre = [];

    const isChef1Member = pupitre.membres.some((member) =>
      member._id.equals(chef1Id)
    );
    const isChef2Member = pupitre.membres.some((member) =>
      member._id.equals(chef2Id)
    );
    if (!isChef1Member || !isChef2Member) {
      return res.status(400).json({
        message: "Both users must be members of the pupitre to be chefs",
      });
    }

    const chef1 = await User.findById(chef1Id);
    const chef2 = await User.findById(chef2Id);
    if (!chef1 || !chef2) {
      return res.status(404).json({ message: "One or both users not found" });
    }
    chef1.role = "chef de pupitre";
    chef2.role = "chef de pupitre";
    await chef1.save();
    await chef2.save();

    // Add new chefs to chef_pupitre and remove them from membres
    pupitre.chef_pupitre.push(chef1Id, chef2Id);
    pupitre.membres = pupitre.membres.filter(
      (member) => !member._id.equals(chef1Id) && !member._id.equals(chef2Id)
    );

    await pupitre.save();

    res.status(200).json({ message: "Chefs assigned successfully", pupitre });
  } catch (error) {
    console.error("Error assigning chefs:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getListeChoristesPresProgRep = async (req, res) => {
  // choix de type de pupitre
  try {
    const { Type_voix } = req.body;

    const pupitre = await Pupitre.findOne({ type_voix: Type_voix }).populate(
      "membres"
    );

    const membres = pupitre.membres;
    console.log(membres);
    const membreChoriste = membres.filter(
      (membre) => membre.role === "choriste"
    );
    console.log(membreChoriste);
    // Populate the "Concerts" field for each chorister
    const populatedMembres = await Concert.populate(membreChoriste, {
      path: "Concerts.Concert",
    });

    populatedMembresProgramme = await Oeuvre.populate(populatedMembres, {
      path: "Concerts.Concert.programme",
    });

    const result = populatedMembresProgramme.map((item) => ({
      nom: item.nom,
      prenom: item.prenom,
      email: item.email,
      Concerts: item.Concerts.map((concert) => ({
        id_concert: concert._id,
        programme: concert.Concert.programme,
        presence: concert.presence,
      })),
      Repetitions: item.Repetitions.map((repetition) => ({
        repetion: repetition.repetition,
        presence: repetition.presence,
      })),
      role: item.role,
    }));

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getChoristesseuilpres = async (req, res) => {
  // choix de type de pupitre
  try {
    const { Type_voix } = req.body;

    const pupitre = await Pupitre.findOne({ type_voix: Type_voix }).populate(
      "membres"
    );

    const membres = pupitre.membres;

    const membreChoriste = membres.filter(
      (membre) => membre.role === "choriste"
    );

    // Populate the "Concerts" field for each chorister
    const populatedMembres = await Concert.populate(membreChoriste, {
      path: "Concerts.Concert",
    });

    let userfinale = [];

    for (let user of populatedMembres) {
      for (let concert of user.Concerts) {
        if (concert.Concert._id.toString() === req.params.id) {
          const repetitions = concert.Concert.repetitions;
          let repetitionsconcert = [];
          for (let repetitionsuser of user.Repetitions) {
            if (repetitions.includes(repetitionsuser.repetition)) {
              repetitionsconcert.push(repetitionsuser);
            }
          }
          const totalerepetitions = repetitionsconcert.length;
          let presencerepetitions = 0;
          for (let rep of repetitionsconcert) {
            if (rep.presence === true) {
              presencerepetitions = presencerepetitions + 1;
            }
          }
          const tauxpresence = (presencerepetitions / totalerepetitions) * 100;
          console.log(tauxpresence);
          if (
            tauxpresence >= concert.Concert.seuil &&
            concert.disponibilite === true
          ) {
            let userfinal = { ...user.toObject() };
            userfinal.tauxpresence = tauxpresence;
            const msg = {
              msg: `l'utilisateur ${user.nom} va etre present dans le concert ${concert.Concert._id} avec un taux de presence de ${tauxpresence}`,
              tauxpresence: tauxpresence,
            };
            userfinale.push(msg);
          }
        }
      }
    }
    userfinale.sort((a, b) => b.tauxpresence - a.tauxpresence);

    if (userfinale.length === 0) {
      return res.status(200).json({ msg: "Empty list" });
    } else {
      return res.status(200).json({ userfinale });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const changeTissiture = async (req, res) => {
  try {
    const { userId, type_voix } = req.body;
    const pupitres = await Pupitre.find({});
    const [pupitre] = pupitres.filter((item) => item.membres.includes(userId));
    if (!pupitre) {
      res.status(404).json({
        message: "User has not a pupitre ! ",
      });
    } else {
      if (pupitre.type_voix == type_voix) {
        res.status(200).json({
          message: "User already in this pupitre ! ",
        });
      } else {
        const oldTypeVoix = pupitre.type_voix;
        pupitre.membres = pupitre.membres.filter((item) => item != userId);
        pupitre.save();

        const pupitreDestination = await Pupitre.findOne({ type_voix });
        pupitreDestination.membres = [...pupitreDestination.membres, userId];
        pupitreDestination.save();

        const oldPupitreChef = await User.findOne({
          _id: pupitre.chef_pupitre[0],
        });
        const choriste = await User.findOne({ _id: userId });
        io.emit(`notif-${oldPupitreChef._id.toString()}`, {
          message: `Le choriste ${choriste.nom} ${choriste.prenom} a changé de tessiture de ${oldTypeVoix} à ${type_voix}`,
        });

        res.status(200).json({
          message: `changed from ${oldTypeVoix} to ${type_voix}`,
          payload: "User change tessiture successfully!",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getChoristesseuilpres,
  getListeChoristesPresProgRep,
  defineNeeds,
  designer2Chefs,
  changeTissiture,
  getAll,
};
