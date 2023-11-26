const { reset } = require("./message");

let users = [];
let userscount = 0;
const addUser = (id, score) => {
  if (score === undefined) {
    score = 0;
  }
  // if user is not in users array, add them
  if (!users.find(user => user.id === id)) {
    users.push({ id, score });
    userscount++;
  }
  return users;
}

const correctAnswer = (id) => {
  console.log(users,id)
  // increase user score
  users = users.map(user => {
    let newScore = user.score;
    if (user.id === id) {
      newScore = user.score + 1;
      console.log(newScore);
    }
    return { id: user.id, score: newScore };
  });
  return users;
}

const getUsers = () => {
  return users;
}

const removeUser = (id) => {
  users = users.filter(user => user.id !== id);
  userscount--;
  console.log("A player has disconnected");
}

const getUsersCouhnt = () => {
  if (userscount <=0) {
    users = [];
    reset();
  }
  return userscount;
}

module.exports = { addUser, correctAnswer, removeUser, getUsersCouhnt, getUsers };
