const socket = io();

const getChannelName = () => {
  return (channelName = window.location.pathname.split("/")[2]);
};

const getUserName = () => {
  return (username = window.location.search.split("=")[1]);
};

// HTMLS
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-input");
const messagesDiv = document.getElementById("messages");

// onClick on a button class "emoji" to add the emoji to the message input
const emojis = document.querySelectorAll(".emoji");
emojis.forEach((emoji) => {
  emoji.addEventListener("click", () => {
    messageInput.value += " " + emoji.textContent + " ";
  });
});

// Sending form message
messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = messageInput.value;
  if (message) {
    // get username
    const username = window.location.search.split("=")[1];
    // get the channel name
    const channelName = window.location.pathname.split("/")[2];
    socket.emit("message", {
      channelName: channelName,
      message: message,
      user: username,
      date: new Date().toString(),
    });
    messageInput.value = "";
  }
});

// listen to the typing event
messageInput.addEventListener("keypress", () => {
  // notify.typing
  socket.emit("notify:typing", {
    user: getUserName(),
    channelName: getChannelName(),
  });
});

const hasUser = (user) => {
  const userList = document.querySelectorAll("ul#users-list li");
  let hasUser = false;
  userList.forEach((userLi) => {
    if (userLi.textContent === user) {
      hasUser = true;
    }
  });
  return hasUser;
};

// add (you) to the user list
const addYou = () => {
  const userList = document.querySelectorAll("ul#users-list li");
  userList.forEach((user) => {
    if (user.textContent === getUserName()) {
      user.textContent = user.textContent + "(you)";
    }
  });
};

// Getting a message
socket.on("message", (data) => {
  if (getChannelName() === data.channelName) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    const hourMinute = new Date(data.date).toLocaleTimeString();
    const messageText =
      "[" + hourMinute + "] " + data.user + " : " + data.message;
    const messageParagraph = document.createElement("p");
    messageParagraph.textContent = messageText;
    messageDiv.appendChild(messageParagraph);
    messagesDiv.appendChild(messageDiv);
  }
});

// typing
socket.on("notify:typing", (data) => {
  const typingDiv = document.getElementById("typing");
  if (getChannelName() === data.channelName && getUserName() !== data.user) {
    typingDiv.textContent = data.user + " is typing...";
    setTimeout(() => {
      typingDiv.textContent = "";
    }, 5000);
  }
});

socket.on("user disconnected", (data) => {
  const channelName = getChannelName();
  if (data?.currentChannel === channelName) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = `${data.name} has disconnected`;
    messagesDiv.appendChild(messageDiv);

    // remove from the users list
    const userList = document.querySelectorAll("ul#users-list li");

    userList.forEach((user) => {
      if (user.textContent === data.name) {
        // Do something if the user has a value for 'data-user'
        user.remove();
      }
    });
  }
});

socket.on("user connected", (data) => {
  const channelName = getChannelName();
  if (data?.currentChannel === channelName) {
    const messageDiv = document.createElement("div");
    const paragraph = document.createElement("p");
    messageDiv.classList.add("message");
    paragraph.textContent = `${data.name} has connected`;
    messageDiv.appendChild(paragraph);
    messagesDiv.appendChild(messageDiv);

    // add to the users list
    if (!hasUser(data.name)) {
      const usersList = document.getElementById("users-list");
      const userLi = document.createElement("li");
      userLi.textContent = data.name;
      usersList.appendChild(userLi);
    }

    addYou();
  }
});


// Dialog
const dialog = document.querySelector("dialog");
const dialogButton = document.querySelector("#dialog-button");
dialogButton.addEventListener("click", () => {
  dialog.showModal();
});
dialog.querySelector("button:not([disabled])").addEventListener("click", () => {
  dialog.close();
});
