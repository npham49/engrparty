let messages = [];

const addMessage = (message) => {
  messages.push(message);
  return messages;
}

const getMessages = () => {
  return messages;
}

const reset = () => {
  messages = [];
}

module.exports = { addMessage, getMessages, reset };