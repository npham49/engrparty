const express = require("express");
const http = require("http");
const {
  addUser,
  correctAnswer,
  removeUser,
  getUsersCouhnt,
} = require("./user");
const { addMessage, getMessages } = require("./message");
const { Server } = require("socket.io");

// Our Express app
const app = express();
let questionIndex = 0;

// Our server
const server = http.createServer(app);

// Setup socket.io to use our server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const questions = [
  { question: "What is 2 + 2?", answer: "4" },
  { question: "Capital of England?", answer: "London" },
  { question: 'Who wrote the book "1984"?', answer: "George Orwell" },
  // Add as many questions as you like...
];

io.on("connection", (socket) => {
  socket.on("start", ({ user, score }) => {
    if (score === undefined) {
      score = 0;
    }
    let users = addUser(user, score);
    socket.emit("users", users);
    socket.broadcast.emit("users", users);
    socket.broadcast.emit("question",questions[questionIndex]);
  });

  socket.on("message", (message) => {
    let messages = addMessage(message);
    socket.broadcast.emit("messages", messages);
    socket.emit("messages", messages);
  });

  socket.on("get-messages", () => {
    let messages = getMessages();
    socket.emit("messages", messages);
  });

  socket.on("race", ({race,user}) => {
    console.log(race)
    if (race === "hello world") {
      socket.broadcast.emit("racer-done",user);
      let users = correctAnswer(user);
      socket.broadcast.emit("users", users);
    }
  })

  socket.on("question", ()=>{
    socket.emit("question",questions[questionIndex])});

  socket.on("answer", ({ answer, user }) => {
    if (answer === questions[questionIndex].answer) {
      questionIndex++;
      // increase user score
      let users = correctAnswer(user);
      socket.broadcast.emit("users", users);
      socket.emit("correct");
      if (questionIndex < questions.length) {
        socket.broadcast.emit("question", questions[questionIndex]);
        socket.broadcast.emit("next-question");
      } else {
        socket.broadcast.emit("end");
        socket.broadcast.emit("start-racer", "hello world");
      }
    } else {
      socket.emit("incorrect");
    }
  });

  socket.on("leave", (user) => {
    questionIndex = 0;
    getUsersCouhnt();
    let users = removeUser(user);
    socket.broadcast.emit("users", users);
    console.log("A player has disconnected");
  });

  socket.on("disconnect", () => {
    getUsersCouhnt();
    console.log("A player has disconnected");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
