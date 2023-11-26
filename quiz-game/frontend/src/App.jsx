import { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";
function App() {
  const [start, setStart] = useState(false);
  const [username, setUsername] = useState("Ano"); // [1
  const [question, setQuestion] = useState("");
  const [board, setBoard] = useState([]); // [2
  const [newMessage, setNewMessage] = useState(""); // [3
  const [answer, setAnswer] = useState("");
  const [users, setUsers] = useState([]);
  const [incorrect, setIncorrect] = useState(false);

  const socket = io.connect("http://localhost:3000");

  socket.on("question", (question) => {
    setQuestion(question.question);
  });

  socket.on("correct", () => {
    alert("Correct answer!");
  });

  socket.on("incorrect", () => {
    setIncorrect(true);
  });

  socket.on("users", (users) => {
    console.log(users);
    setUsers(users);
  });

  socket.on("next-question", () => {
    setIncorrect(false);
  });

  socket.on("end", () => {
    alert("Congratulations! You answered all questions correctly.");
  });
  socket.on("messages", (messages) => {
    setBoard(messages);
  });
  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, []);

  if (!start) {
    return (
      <div className="App">
        <h1>Quiz Game</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={() => {
            setStart(true);
            socket.connect();
            socket.emit("start", { user: username, score: 0 });
          }}
        >
          Start
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="player-name">
        <h1>Username: {username}</h1>
        {incorrect ? (
          <p>Incorrect answer, please wait til next question</p>
        ) : (
          <>
            <p className="read-the-docs">{question}</p>
            <input
              className="name-input"
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <button
              className="name-button"
              onClick={() => {
                socket.emit("answer", { answer: answer, user: username });
                setAnswer("");
              }}
            >
              Submit
            </button>
          </>
        )}
      </div>
      {users && (
        <div>
          <h2>Leaderboard</h2>
          <ol>
            {users.map((user) => (
              <li key={user.id}>
                {user.id} Score: {user.score}
              </li>
            ))}
          </ol>
        </div>
      )}
      <button
        onClick={() => {
          socket.emit("end", username);
          socket.disconnect();
          setStart(false);
        }}
      >
        End Game
      </button>
      <div className="chat-box">
        {board && (
          <div
            className="chat-frame"
            style={{
              border: "1px solid black",
              width: "300px",
              height: "300px",
            }}
          >
            <h2>Messages</h2>
            <ol>
              {board.map((user, index) => (
                <li key={index}>
                  {user.user} : {user.message}
                </li>
              ))}
            </ol>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            ></textarea>
            <button
              onClick={() => {
                socket.emit("message", { message: newMessage, user: username });
                setNewMessage("");
              }}
            >
              Send
            </button>
          </div>
        )}{" "}
      </div>
    </>
  );
}

export default App;
