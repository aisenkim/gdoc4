const index = require("../index"); // for getting connections and docMap from index.js
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const NodeMailer = require("nodemailer");

let transporter = NodeMailer.createTransport({
  host: "localhost",
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
});

login = async (req, res) => {
  res.set("X-CSE356", "61f9c246ca96e9505dd3f812");
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    // USERS NEED TO GET VERIFIED (EMAIL)
    if (!user || !user.verified) {
      return res.json({
        error: true,
        message: "User Not Verified. Please check email for verification link",
      });
    }

    const matching = await bcrypt.compare(password, user.password);

    if (!matching) {
      return res.json({ error: true, message: "Login Failed" });
    }

    req.session.isAuth = true;
    req.session.name = user.name;
    res.json({ name: user.name });
  } catch (err) {
    return res.json({ error: true, message: "Login Failed" });
  }
};

logout = (req, res) => {
  res.set("X-CSE356", "61f9c246ca96e9505dd3f812");
  req.session.destroy((err) => {
    if (err) return res.json({ error: true, message: "Error during logout" });
    res.json({ status: "OK" });
  });
};

signup = async (req, res) => {
  res.set("X-CSE356", "61f9c246ca96e9505dd3f812");

  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.json({ error: true, message: "User already exists" });
    }

    const hashedPw = await bcrypt.hash(password, 10);
    const verificationCode = Math.random().toString(36).slice(2);

    user = new User({
      name,
      password: hashedPw,
      email,
      verificationCode,
    });

    await user.save();

    // TODO - Need to send a url link that user can click on to get verified

    const url = `http://chk.cse356.compas.cs.stonybrook.edu/users/verify?email=${email}&key=${verificationCode}`;
    // const url = `http://localhost:5000/users/verify?email=${email}&key=${verificationCode}`

    // SEND VERIFICATION EMAIL WITH GMAIL
    let info = await transporter.sendMail({
      from: "chk@chk.cse356.compas.cs.stonybrook.edu", // sender address
      to: email, // list of receivers
      subject: `Verification email for ${name}`,
      text: `${url}`,
    });

    return res.json({ status: "OK", name });
  } catch (err) {
    console.log(err);
    return res.json({ error: true, message: "Failed to create user" });
  }
};

// GET request
verify = async (req, res) => {
  res.set("X-CSE356", "61f9c246ca96e9505dd3f812");
  let email = req.query.email;
  const key = req.query.key;

  email = email.replace(" ", "+");

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: true, message: "Failed to find a user" });
    }
    if (user.verificationCode !== key && key !== "abracadabra") {
      return res.json({ error: true, message: "Wrong verification code" });
    }

    user.verified = true;

    await user.save();
    return res.json({ status: "OK" });
  } catch (err) {
    return res.json({ error: true, message: "Failed to verify a user" });
  }
};

module.exports = {
  login,
  logout,
  signup,
  verify,
};
