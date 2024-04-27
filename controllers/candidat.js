const Candidat = require("../models/candidat");
const User = require("../models/user");
const mailSender = require("../utils/mailsender");
const bcrypt = require("bcrypt");
const Candidattest = require("../models/Candidattest");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const {
  acceptCandidatEmailTemplate,
} = require("../utils/acceptationEmailTemplate");
const { accountEmailTemplate } = require("../utils/accountEmailTemplate");
const { generateRandomPassword, hashPassword } = require("../utils/passwords");

//   const { nom, prenom, email } = req.body;
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "cyrinemechmech11@gmail.com",
//       pass: "psaz iedp yyxu fewu",
//     },
//     tls: {
//       rejectUnauthorized: false, // Désactiver la vérification du certificat
//     },
//   });

//   try {
//     const existingEmail = await Candidattest.findOne({ email });

//     if (existingEmail) {
//       console.log("Email déjà existant dans la base de données");
//       return res.status(200).json({
//         message: "Adresse e-mail valide mais existante dans la base de données.",
//         emailExists: true
//       });
//     } else {
//       // Générer le token JWT uniquement si l'email est nouveau
//       jwt.sign(
//         { nom: nom, prenom: prenom, email: email },
//         process.env.ACCESSTOKENSECRET,
//         { expiresIn: "365d" },
//         async (err, token) => {
//           if (err) {
//             console.error(err);
//             return res.status(500).send("Error creating token");
//           }

//           const confirmation = `http://localhost:5000/api/candidat/confirmation?token=${token}`;

//           const mailOptions = {
//             from: "cyrinemechmech11@gmail.com",
//             to: email,
//             subject: "email de confirmation",
//             text: `Hello ${nom} ${prenom},\n\n your email is valid, press this link to register <a href="${confirmation}">Confirmer</a>.`,
//           };

//           transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//               console.error(error);
//               return res.status(500).send("Error sending email");
//             }
//             res.cookie("token", token, {
//   // const sentmail = async (req, res) => {            path: "/",
//               maxAge: 24 * 30 * 10,
//             });
//             console.log("Email sent: " + info.response);
//             // Supprimez la ligne ci-dessous qui envoie une réponse après l'envoi du courriel.
//           });

//           return res.status(200).json({
//             message: "Adresse e-mail valide et mail sent successfully",
//           });
//         }
//       );
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "Erreur lors de la validation de l'adresse e-mail.",
//     });
//   }
// };

const sentmail = async (req, res) => {
  const { nom, prenom, email } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "ghaly4045@gmail.com",
      pass: "fppb rqus basw bxtw",
    },
    tls: {
      rejectUnauthorized: false, // Désactiver la vérification du certificat
    },
  });

  try {
    const existingEmail = await Candidattest.findOne({ email });
    console.log(existingEmail);

    if (existingEmail) {
      console.log("Email déjà existant dans la base de données");
      return res.status(200).json({
        message:
          "Adresse e-mail valide mais existante dans la base de données.",
        emailExists: true,
      });
    } else {
      // Générer le token JWT uniquement si l'email est nouveau
      jwt.sign(
        { nom: nom, prenom: prenom, email: email },
        process.env.ACCESSTOKENSECRET,
        { expiresIn: "365d" },
        async (err, token) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Error creating token");
          }
          const confirmation = `http://localhost:3000/confirmation/${token}`;

          const mailOptions = {
            from: "ghaly4045@gmail.com",
            to: email,
            subject: "email de confirmation",
            html: `
              <p>Hello ${nom} ${prenom},</p>
              <p>Votre email est valide. Cliquez sur le lien suivant pour confirmer votre inscription :</p>
              <a href="${confirmation}">Confirmation</a>
            `,
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(error);
              return res.status(500).send("Error sending email");
            }
            res.cookie("token", token, {
              path: "/",
              maxAge: 24 * 30 * 10,
            });
            console.log("Email sent: " + info.response);
          });

          return res.status(200).json({
            message: "Adresse e-mail valide et mail sent successfully",
          });
        }
      );
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erreur lors de la validation de l'adresse e-mail.",
    });
  }
};

// const confirmation = (req, res) => {
//   try {
//     const { token } = req.query;
//     if (!token) {
//       return res.status(400).json({ message: "Token not found in cookies." });
//     }
//     jwt.verify(
//       token,
//       process.env.ACCESSTOKENSECRET,
//       {},
//       async (err, decoded) => {
//         if (err) throw err;
//         const existingEmail = await Candidattest.findOne({
//           email: decoded.email,
//         });

//         if (existingEmail) {
//           return res.status(200).json({
//             message:
//               "Adresse e-mail valide et existante dans la base de données.",
//           });
//           //return res.redirect('http//validation/mailexistant');
//         }

//         const newCandidat = new Candidattest({
//           nom: decoded.nom,
//           prenom: decoded.prenom,
//           email: decoded.email,
//         });

//         newCandidat.save();
//         res.status(200).json({
//           message: "Email confirmed successfully. Nouvel utilisateur créé",
//         });
//         //return res.redirect('/validation');

//       }
//     );
//   } catch (err) {
//     return res.status(500).json({ msg: err.message });
//   }
// };

const confirmation = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token not found in cookies." });
    }
    jwt.verify(
      token,
      process.env.ACCESSTOKENSECRET,
      {},
      async (err, decoded) => {
        if (err) throw err;
        const existingEmail = await Candidattest.findOne({
          email: decoded.email,
        });

        if (existingEmail) {
          return res.status(200).json({
            success: true,
            message:
              "Adresse e-mail valide et existante dans la base de données.",
          });
        }

        const newCandidat = new Candidattest({
          nom: decoded.nom,
          prenom: decoded.prenom,
          email: decoded.email,
        });

        await newCandidat.save();

        // Au lieu de la redirection, renvoyer un message JSON avec le statut de succès
        return res.status(200).json({
          success: true,
          message: "Email confirmé avec succès.",
        });
      }
    );
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getCandidats = async (req, res) => {
  try {
    const filter = {};

    if (req.query.sexe) {
      filter.sexe = { $eq: req.query.sexe };
    }
    if (req.query.taillemin && req.query.taillemax) {
      filter.taille = { $gte: req.query.taillemin, $lte: req.query.taillemax };
    }
    if (req.query.nom) {
      filter.nom = { $regex: req.query.nom, $options: "i" };
    }
    if (req.query.prenom) {
      filter.prenom = { $regex: req.query.prenom, $options: "i" };
    }
    if (req.query.telephone) {
      filter.telephone = { $regex: req.query.telephone, $options: "i" };
    }
    if (req.query.email) {
      filter.email = { $regex: req.query.email, $options: "i" };
    }
    if (req.query.id_national) {
      filter.id_national = { $regex: req.query.id_national, $options: "i" };
    }
    if (req.query.nationalite) {
      filter.nationalite = { $regex: req.query.nationalite, $options: "i" };
    }
    if (req.query.date_de_naissance) {
      filter.date_de_naissance = req.query.date_de_naissance;
    }
    if (req.query.situation_professionnelle) {
      filter.situation_professionnelle = {
        $regex: req.query.situation_professionnelle,
        $options: "i",
      };
    }

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    let candidats = [];
    if (page) {
      candidats = await Candidat.find(filter)
        .skip(skip)
        .limit(limit)
        .populate({
          path: "audition",
          populate: {
            path: "saison",
          },
        });
    } else {
      candidats = await Candidat.find(filter).populate({
        path: "audition",
        populate: {
          path: "saison",
        },
      });
    }
    res.status(200).json({
      success: true,
      payload: candidats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
const SaisieInfos = async (req, res, next) => {
  try {
    const candidatId = req.params.id;

    const CandidatExistant = await Candidat.findById(candidatId).populate(
      "audition"
    );

    if (!CandidatExistant) {
      return res.status(404).json({ message: "Candidat non trouvée" });
    }

    const {
      heure_debut_audition,
      heure_fin_audition,
      date_audition,
      decision,
      confirmation,
      note,
      extrait_chante,
      tessiture,
      remarque,
      audition,
    } = req.body;
    CandidatExistant.heure_debut_audition = heure_debut_audition;
    CandidatExistant.heure_fin_audition = heure_fin_audition;
    CandidatExistant.date_audition = date_audition;
    CandidatExistant.extrait_chante = extrait_chante;
    CandidatExistant.tessiture = tessiture;
    CandidatExistant.decision = decision;
    CandidatExistant.remarque = remarque;
    (CandidatExistant.confirmation = confirmation),
      (CandidatExistant.note = note),
      (CandidatExistant.audition = audition);

    const auditionMiseAJour = await CandidatExistant.save();

    res.status(200).json({
      message: "Saisie des informations de l'audition du candidat réussie",
      audition: auditionMiseAJour,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message:
        "Erreur lors de la saisie des informations de l'audition du candidat",
    });
  }
};

const filterAcceptedCandidates = async (req, res) => {
  try {
    const { order } = req.query;
    const sort = {};
    if (order) {
      console.log(order);
      sort.note = parseInt(order);
    }
    const candidats = await Candidat.find({ decision: "retenu" })
      .sort(sort)
      .exec();
    console.log(candidats);
    res.status(200).json({
      payload: candidats,
    });
  } catch (error) {
    res.status(500).json({
      message: "server error ",
      error: error.message,
    });
  }
};
const acceptCandidat = async (req, res) => {
  try {
    const [candidat] = await Candidat.find({ _id: req.params.id });

    if (candidat) {
      if (candidat.decision != "retenu") {
        candidat.decision = "retenu";
        await candidat.save();
        mailSender.sendEmail(
          "subject",
          candidat.email,
          acceptCandidatEmailTemplate(
            candidat.nom,
            candidat.prenom,
            candidat._id
          )
        );
        res.status(200).json({
          payload: candidat,
        });
      } else {
        res.status(400).json({
          message: "candidat already accepted !",
        });
      }
    } else {
      res.status(404).json({
        message: "candidat not found !",
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
const updateCandidat = async (req, res) => {
  try {
    const candidatId = req.params.id;
    const updatedCandidat = await Candidat.findByIdAndUpdate(
      candidatId,
      req.body,
      { new: true }
    );
    if (!updatedCandidat) {
      return res.status(404).json({ message: "Candidat non trouvée" });
    }
    await updatedCandidat.save();
    if (updatedCandidat.decision === "retenu") {
      mailSender.sendEmail(
        "subject",
        updatedCandidat.email,
        acceptCandidatEmailTemplate(
          updatedCandidat.nom,
          updatedCandidat.prenom,
          updatedCandidat._id
        )
      );
    }
    await updatedCandidat.populate({
      path: "audition",
      populate: {
        path: "saison",
      },
    });
    res.status(200).json({
      message: "Candidat mise à jour avec succès",
      payload: updatedCandidat,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour l'audition" });
  }
};
const deleteCandidat = async (req, res) => {
  try {
    await Candidat.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Candidat supprimé avec succès",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la supprission de l'audition" });
  }
};

const confirm = async (req, res) => {
  try {
    const [candidat] = await Candidat.find({ _id: req.params.id });
    if (candidat) {
      if (candidat.confirmation == null) {
        candidat.confirmation = true;
        candidat.save().then(async (condidat) => {
          const password = generateRandomPassword();
          const hashedPassword = await bcrypt.hash(password, 10);
          console.log(password);
          const newUser = new User({
            nom: condidat.nom,
            prenom: condidat.prenom,
            telephone: condidat.telephone,
            email: condidat.email,
            password: hashedPassword,
            niveauExperience: "junior",
            id_national: condidat.id_national,
            nationalite: condidat.nationalite,
            date_de_naissance: condidat.date_de_naissance,
            situation_professionnelle: condidat.situation_professionnelle,
            taille: condidat.taille,
            sexe: condidat.sexe,
            role: "choriste",
          });
          newUser.save().then((_) => {
            mailSender.sendEmail(
              "Votre informations d'identification sur notre platform",
              candidat.email,
              accountEmailTemplate(candidat.email, password)
            );
            res.status(201).json({
              message: "user created !",
            });
          });
        });
      } else {
        res.status(404).json({
          message: "candidat already confirmed !",
        });
      }
    } else {
      res.status(404).json({
        message: "candidat not found !",
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
const reject = async (req, res) => {
  try {
    const [candidat] = await Candidat.find({ _id: req.params.id });

    if (candidat) {
      if (candidat.confirmation === null) {
        candidat.confirmation = false;
        await candidat.save();
        res.status(200).json({
          payload: candidat,
        });
      } else {
        res.status(400).json({
          message: "can't rejected !",
        });
      }
    } else {
      res.status(404).json({
        message: "candidat not found !",
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
const notifieradmin = async () => {
  const today10am = new Date();
  today10am.setHours(15, 0, 0, 0);

  const yesterday10am = new Date();
  yesterday10am.setDate(yesterday10am.getDate() - 1);
  yesterday10am.setHours(10, 0, 0, 0);

  try {
    const documents = await Candidat.findOne({
      createdAt: {
        $gte: yesterday10am,
        $lt: today10am,
      },
    })
      .select(" email nom prenom ")
      .exec();
    console.log(documents);

    return documents;
  } catch (error) {
    console.log(error.message);
  }
};
const moment = require("moment");

const postCandidat = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      telephone,
      email,
      id_national,
      nationalite,
      date_de_naissance,
      situation_professionnelle,
      taille,
      sexe,
    } = req.body;

    const candidatExistant = await Candidat.findOne({ email });

  if (candidatExistant) {
    console.log("existe déja");
    res.status(201).json({ success: true, isNew: false, message: "Un candidat avec cet email existe déjà" });
  } 
  else 
  {
    // Candidat nouvellement ajouté
    //const candidatEnregistre = await nouveauCandidat.save();
    //res.status(201).json({ success: true, isNew: true, data: candidatEnregistre });

    const dateNaissanceFormatee = moment(
      date_de_naissance,
      "DD/MM/YYYY"
    ).toISOString();

    const nouveauCandidat = new Candidat({
      nom,
      prenom,
      telephone,
      email,
      id_national,
      nationalite,
      date_de_naissance: dateNaissanceFormatee, // Utiliser la date formatee
      situation_professionnelle,
      taille,
      sexe,
    });

    const candidatEnregistre = await nouveauCandidat.save();

    res.status(201).json({
      success: true,
      data: candidatEnregistre,
    });
  }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};


module.exports = {
  sentmail,
  confirmation,
  getCandidats,
  SaisieInfos,
  filterAcceptedCandidates,
  acceptCandidat,
  confirm,
  reject,
  notifieradmin,
  postCandidat,
  updateCandidat,
  deleteCandidat,
};
