const express = require("express");
const app = express();
const port = 9000;
const http = require("http");
const server = http.Server(app);
const io = require("socket.io")(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("view engine", "pug");
app.use(express.static("views"));

/**
 *
 *  -------------------------------------------
 *
 */

const jsonEmojis = require("./utils/emojis.json");
// users array
const users = [];

// channel messages
const channelMessages = [
  {
    id: 1,
    channelName: "General",
    messages: [],
    users: [],
  },
  {
    id: 2,
    channelName: "ReactJS",
    messages: [],
    users: [],
  },
  {
    id: 3,
    channelName: "NodeJS",
    messages: [],
    users: [],
  },
];

/**
 *
 *  -------------------------------------------
 *
 */

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/logged", (req, res) => {
  const username = req.body.username;
  users.push({
    id: undefined,
    name: username,
    currentChannel: "General",
  });
  // redirect to General
  res.redirect("/channel/General?username=" + username);
});

app.post("/logout", (req, res) => {
  const username = req.body.username;
  // remove the user from the users array
  users.forEach((user, index) => {
    if (user.name === username) {
      users.splice(index, 1);
    }
  });
  // redirect to login
  res.redirect("/");
});

app.get("/channel/:channelName", (req, res) => {
  const username = req.query.username;

  // retreive the user and set the current channel
  const channelName = req.params.channelName;
  users.forEach((user) => {
    if (user.name === username) {
      user.currentChannel = channelName;
    }
  });

  // get array of channels
  const channels = channelMessages.map((channel) => channel.channelName);

  // also put the in channelMessages.users
  channelMessages.forEach((channel) => {
    if (channel.channelName === channelName) {
      channel.users.push(username);
    }
  });

  // get the messages of the channel
  const channel = channelMessages.find(
    (channel) => channel.channelName === channelName
  );

  // get the users of the current channel
  const channelUsers = users.filter(
    (user) => user.currentChannel === channelName
  );
  const messages = channel.messages;
  res.render("index", {
    channelName,
    channelUsers,
    channels,
    username,
    messages,
    jsonEmojis,
  });
});

// invalid route
app.get("*", (req, res) => {
  res.redirect("/");
});

/**
 *
 *  -------------------------------------------
 *
 */

io.on("connection", (socket) => {
  // add the socket id to the user
  users.forEach((user) => {
    if (user.id === undefined) {
      user.id = socket.id;
    }
  });

  const connectedUser = users.find((user) => user.id === socket.id);
  io.emit("user connected", connectedUser);

  socket.on("disconnect", () => {
    // get the disconnected user
    const disconnectedUser = users.find((user) => user.id === socket.id);

    // set the user id to undefined
    users.forEach((user) => {
      if (user.id === socket.id) {
        user.id = undefined;
      }
    });

    io.emit("user disconnected", disconnectedUser);
  });

  socket.on("message", (data) => {
    // pushing the message to the channel
    channelMessages.forEach((channel) => {
      if (channel.channelName === data.channelName) {
        channel.messages.push({
          user: data.user,
          content: data.message,
          date: new Date(data.date).toLocaleTimeString("fr-FR"),
        });
      }
    });

    // send the message to the client with the channel name and the user
    io.emit("message", {
      user: data.user,
      message: data.message,
      channelName: data.channelName,
      date: data.date,
    });
  });

  socket.on("notify:typing", (data) => {
    io.emit("notify:typing", data);
  });
});

/**
 *
 *  -------------------------------------------
 *
 */

server.listen(port, () => {
  console.log(`server is running on port on http://localhost:${port}`);
});