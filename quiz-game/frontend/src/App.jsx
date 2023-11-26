import { useEffect, useState } from "react";
import io from "socket.io-client";
import "./App.css";
function App() {
  const [gameType, setGameType] = useState("Quiz"); // [1
  const [race, setRace] = useState("");
  const [target, setTarget] = useState(""); // [1
  const [start, setStart] = useState(false);
  const [races, setRaces] = useState([]); // [1
  const [racerWinner, setRacerWinner] = useState(""); // [1
  const [username, setUsername] = useState("Ano"); // [1
  const [question, setQuestion] = useState("");
  const [board, setBoard] = useState([]); // [2
  const [newMessage, setNewMessage] = useState(""); // [3
  const [answer, setAnswer] = useState("");
  const [users, setUsers] = useState([]);
  const [incorrect, setIncorrect] = useState(false);

  const socket = io.connect("http://localhost:3000");

  const handleChange = (e) => {
    setRace(e.target.value);
    socket.emit("race", { race: race, user: username });
  };

  const handleMessage = (e) => {
    setNewMessage(e.target.value);
  };

  socket.on("question", (question) => {
    if (!question) {
      setGameType("Racer");
      return;
    }
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

  socket.on("start-racer", (term) => {
    setGameType("Racer");
    setTarget(term);
  });

  socket.on("update-races", (races) => {
    setRaces(races);
  });

  socket.on("racer-done", () => {
    // get persojn with biggest score from user list
    users.forEach((user) => {
      if (user.score === Math.max(...users.map((user) => user.score))) {
        setRacerWinner(user.id);
      }
    });
  });

  socket.on("messages", (messages) => {
    setBoard(messages);
  });
  useEffect(() => {
    socket.emit("question");
    return () => {
      socket.disconnect();
    };
  }, []);

  if (!start) {
    return (
      <div className="App">
        <h1>Quiz Game</h1>
        <input
          className="name-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={() => {
            setStart(true);
            setGameType("Quiz");
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
      <div></div>
      <h1>Username: {username}</h1>
      {gameType === "Quiz" && (
        <>
          {incorrect ? (
            <p className="incorrect">
              Incorrect answer, please wait til next question
            </p>
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
        </>
      )}
      {gameType === "Racer" && racerWinner === "" && (
        <>
          <h1>Racer</h1>
          <h2>Enter after finished typing</h2>
          <p>Word: {target}</p>
          <textarea className='name-input' onChange={handleChange}></textarea>
        </>
      )}
      <ul>
        {gameType === "Racer" &&
          races.length > 0 &&
          races.map((race, index) => (
            <li key={index}>
              {race.name} : {race.race}
            </li>
          ))}
      </ul>
      {racerWinner !== "" && (
        <>
          <h1>Racer</h1>
          <p>Winner: {racerWinner}</p>
        </>
      )}
      <button
        onClick={() => {
          socket.emit("leave", username);
          socket.disconnect();
          setStart(false);
        }}
      >
        End Game
      </button>
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
      )}{" "}
      {board && (
        <div
          className="chat-frame"
          style={{
            border: "1px solid black",
            width: "300px",
            height: "300px",
          }}
        >
          <div>
            <h2>Messages</h2>
            <ol>
              {board.map((user, index) => (
                <li key={index}>
                  {user.user} : {user.message}
                </li>
              ))}
            </ol>
            <textarea
              className="chat-input"
              value={newMessage}
              onChange={handleMessage}
            ></textarea>
            <br />
            <button
              className="chat-button"
              onClick={() => {
                socket.emit("message", { message: newMessage, user: username });
                setNewMessage("");
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}{" "}
    </>
  );
}

export default App;
