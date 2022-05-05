const express = require("express");
const cors = require("cors")
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const session = require("express-session")
const MongoDBSession = require('connect-mongodb-session')(session)

dotenv.config()

const app = express();
app.use(cors({
     origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(express.json({limit: '50mb', extended: true}));
app.use(cookieParser());

// CONNECT MONGODB
const db = require("./db")
db.on("error", console.error.bind(console, "MONGODB CONNECTION ERROR!!: "))

// DB SESSION
const store = new MongoDBSession({
    uri: process.env.DB_CONNECT,
    collection: 'userSessions'
})

// Session Config
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store
}))

const PORT = process.env.PORT || 7000;

// ROUTE SETUP
const imageRouter = require("./routes/imageRouter")

app.use("/media", imageRouter)


app.listen(PORT, () => {
    console.log(`Connected on port: ${PORT}`)
})
