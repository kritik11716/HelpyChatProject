const OPENAI_API_KEY =
//  "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"
"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";
// "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"; 
//
//
//
const express = require("express");
const mongoose = require("mongoose");
const { Configuration, OpenAIApi } = require("openai");
const cors = require("cors");
const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();
app.use(express.json());
app.use(cors());


// connection to database
const mongoUrl = "mongodb://0.0.0.0:27017/HelpyChat";
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));

require("./userDetail.js");
const User = mongoose.model("UserInfo");
require("./contact.js");
const contact = mongoose.model("contact");


//User SignUp

app.post("/Signup", async (req, res) => {
  const { fname, lname, email, password } = req.body;
  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.json({ error: "User Exists" });
    }
    await User.create({
      fname,
      lname,
      email,
      password,
    });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error" });
  }
});

//contact us

app.post("/Contact", async (req, res) => {
  const { name, email, subject, message } = req.body;
  try {
    await contact.create({
      name,
      email,
      subject,
      message,
    });
    res.send({ status: "ok" });
  } catch (error) {
    res.send({ status: "error" });
  }
});

//User Login

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    if (user.password === password) {
      res.send("ok");
    } else {
      res.send("pass");
    }
  } else {
    res.send("ne");
  }
});

//Handeling user question
app.post("/chat", (req, res) => {
  const question = req.body.question;

  openai
    .createCompletion({
      model: "text-davinci-003",
      prompt: question,
      max_tokens: 4000,
      temperature: 0,
    })
    .then((response) => {
      return response.data.choices?.[0].text;
    })
    .then((answer) => {
      console.log({ answer });
      const array = answer
        ?.split("\n")
        .filter((value) => value)
        .map((value) => value.trim());

      return array;
    })
    .then((answer) => {
      res.json({
        answer: answer,
        propt: question,
      });
    });
  console.log({ question });
});

//starting the server
app.listen(4000, () => {
  console.log("Server is listening on port 4000");
});
