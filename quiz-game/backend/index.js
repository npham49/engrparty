const express = require("express");
const http = require("http");
const { addUser, correctAnswer, removeUser, getUsersCouhnt } = require("./user");
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
    origin: "http://localhost:5173"
  }
});

const questions = [
  { question: "What is 2 + 2?", answer: "4" },
  { question: "Capital of England?", answer: "London" },
  { question: 'Who wrote the book "1984"?', answer: "George Orwell" },
  {
    question:
      "What is the Answer to the Ultimate Question of Life, The Universe, and Everything?",
    answer: "42",
  },
  { question: "In which year was the first moon landing?", answer: "1969" },
  { question: "What is the square root of 144?", answer: "12" },
  // Add as many questions as you like...
];

io.on("connection", (socket) => {
  socket.on("start", ({user,score}) => {
    if (score === undefined) {
      score = 0;
    }
    let users = addUser(user, score);
    socket.emit("users", users);
    socket.broadcast.emit("users", users);
  })

  socket.on("message", (message) => {
    let messages = addMessage(message);
    socket.broadcast.emit("messages", messages);
    socket.emit("messages", messages);
  }

  );

  socket.on("get-messages", () => {
    let messages = getMessages();
    socket.emit("messages", messages);
  }
  );

  socket.emit("question", questions[questionIndex]);

  socket.on("answer", ({answer,user}) => {
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
        socket.emit("end");
      }
    } else {
      socket.emit("incorrect");
    }
  });

  socket.on("end", (user)=> {
    questionIndex = 0;
    getUsersCouhnt();
    let users = removeUser(user);
    socket.broadcast.emit("users", users);
    console.log("A player has disconnected");
  })

  socket.on("disconnect", () => {
    getUsersCouhnt();
    console.log("A player has disconnected");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));