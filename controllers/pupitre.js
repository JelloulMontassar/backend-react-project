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
const designer2Chefs = async (req, res) => {
  try {
    const { pupitreId, chef1Id, chef2Id } = req.body;

    const updatedPupitre = await Pupitre.findByIdAndUpdate(
      pupitreId,
      { $addToSet: { chef_pupitre: [chef1Id, chef2Id] } },
      { new: true }
    );

    if (!updatedPupitre) {
      return res.status(404).json({ error: "Pupitre non trouvé." });
    }

    const user1Exists = await User.exists({ _id: chef1Id });
    const user2Exists = await User.exists({ _id: chef2Id });

    if (!user1Exists && !user2Exists) {
      return res
        .status(404)
        .json({ error: "Les deux ID d'utilisateurs n'existent pas." });
    } else if (!user1Exists) {
      return res.status(404).json({
        error: "ID d'utilisateur pour chef de pupitre 1 n'existe pas.",
      });
    } else if (!user2Exists) {
      return res.status(404).json({
        error: "ID d'utilisateur pour chef de pupitre 2 n'existe pas.",
      });
    } else {
      // màj role chef 1
      await User.findByIdAndUpdate(
        chef1Id,
        { $set: { role: "chef de pupitre" } },
        { new: true }
      );

      // màj role chef 2
      await User.findByIdAndUpdate(
        chef2Id,
        { $set: { role: "chef de pupitre" } },
        { new: true }
      );

      return res
        .status(200)
        .json({ message: "Pupitre mis à jour avec succès" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
};
