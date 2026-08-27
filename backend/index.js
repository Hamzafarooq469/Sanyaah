
const express = require("express")
const dotenv = require("dotenv")
const db = require("./config/db")
const cors = require("cors")

dotenv.config({
    path: "./config/.env"
})


const app = express()
db

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.get("/", (req, res) => {
    res.send("Api is working")
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Server is working on port no: ${PORT}`)
})