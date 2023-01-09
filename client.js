const tmi = require("tmi.js");
channelName = document.getElementById("channel").value;
oauthToken = document.getElementById("oauth").value;
username = document.getElementById("username").value;
const TwitchClient = new tmi.Client({
  options: { debug: true },
  identity: {
    username: username.toLowerCase(),
    password: oauthToken,
  },
  channels: [channelName.toLowerCase()],
});
module.exports = TwitchClient;
