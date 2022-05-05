const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

mongoose
  .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
  .catch((e) => {
    console.error("Connection Fail", e.message);
  });

// mongoose
//     .connect("mongodb://mongodb:27017/docs", {useNewUrlParser: true})
//     .catch(e => {
//         console.error("Connection Fail", e.message)
//     })

module.exports = mongoose.connection;
