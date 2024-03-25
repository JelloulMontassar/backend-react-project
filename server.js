const http = require("http")
const app =require("./app")
require('dotenv').config();

const port = process.env.PORT || process.env.PORT
app.set("port",port)
const server = http.createServer(app)
server.listen(port, () => {
    console.log("listening on " + port)
})