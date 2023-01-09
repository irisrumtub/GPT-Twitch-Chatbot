const electron = require("electron");
const ipc = electron.ipcRenderer;
const newConnectToTwitch = require("./connectToTwitch");
const handleMessage = require("./messageHandler")

//use twurple instead


document.getElementById("tmilink").addEventListener("click", function () {
  let active_hotspot_id = localStorage.getItem("active_hotspot_id");
  ipc.send("tmiclicked", active_hotspot_id);
});

document.getElementById("ailink").addEventListener("click", function () {
  let active_hotspot_id = localStorage.getItem("active_hotspot_id");
  ipc.send("aiclicked", active_hotspot_id);
});
document.getElementById("submit").addEventListener("click", () => {
  const TwitchClient = require("./client");
  newConnectToTwitch(TwitchClient);
  handleMessage(TwitchClient);
});
