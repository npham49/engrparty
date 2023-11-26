const {getUsers} = require("./user");

let races = [];

const typeRacing = () => {
  let users = getUsers();
  users.forEach(user => {
    races.push({name:user.id,race:""})
  })
}

const updateRace = ({name,race}) => {
  console.log(name,race)
  races = races.map(racer => {
    let newRace = racer.race
    if (racer.name === name) {
      newRace = race
    }
    return {name: racer.name,race: newRace}
  });
  console.log(races)
}

const getRaces = () => {
  return races;
}

module.exports = {typeRacing,updateRace,getRaces};