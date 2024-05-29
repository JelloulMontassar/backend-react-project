const http = require("http")
const app =require("./app")
const mongoose = require('mongoose');
const Pupitre = require("./models/pupitre");
const User = require("./models/user");
const Concert = require("./models/concert");


require('dotenv').config();

const port = process.env.PORT || process.env.PORT
app.set("port",5000)

const server = http.createServer(app)
server.listen(port, () => {
    console.log("listening on " + port)
})
async function createMockData() {
    const user1 = new User({
        nom: 'Test User 1',
        prenom: 'Prenom 1',
        telephone: '1234567890',
        email: 'test112331@example.com',
        password: 'password1',
        id_national: 'ID1',
        nationalite: 'Nationality1',
        date_de_naissance: new Date(),
        situation_professionnelle: 'Employed',
        taille: 180,
        sexe: 'homme',
        role: 'choriste',
        Concerts: [{ Concert: "665612e72cfc1a25ed0b67f1", presence: true, disponibilite: true }],
    });
    await user1.save();

    const user2 = new User({
        nom: 'Test User 2',
        prenom: 'Prenom 2',
        telephone: '0987654321',
        email: 'test24564@example.com',
        password: 'password2',
        id_national: 'ID2',
        nationalite: 'Nationality2',
        date_de_naissance: new Date(),
        situation_professionnelle: 'Employed',
        taille: 175,
        sexe: 'homme',
        role: 'choriste',
        Concerts: [{ Concert: "665612e72cfc1a25ed0b67f1", presence: true, disponibilite: true }],
    });
    await user2.save();

    const pupitreId = '6613307015857946da48e4bd';

await Pupitre.findByIdAndUpdate(
    pupitreId,
    { $addToSet: { membres: [user1._id, user2._id] } },
    { new: true, useFindAndModify: false }
);
}

