
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

app.use("/api/imam", require("./routes/imamRoutes"))
app.use("/api/mosque", require("./routes/mosqueRoutes"))
app.use("/api/announcement", require("./routes/announcementRoutes"))

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server is working on port no: ${PORT}`)
})