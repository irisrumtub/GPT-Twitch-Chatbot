const electron = require("electron");
const ipc = electron.ipcRenderer;
const tmi = require("tmi.js");
//use twurple instead
const axios = require("axios");
const fs = require("fs");
let pirate = false

window.addEventListener("DOMContentLoaded", () => {
  const connectToTwitch = () => {
    let channelName = document.getElementById("channel").value;
    let oauthToken = document.getElementById("oauth").value;
    let aiKey = document.getElementById("aiKey").value;
    document.getElementById("submit").disabled = true;
    document.getElementById("submit").innerHTML = "connected"
    let username = document.getElementById("username").value;
    const TwitchClient = new tmi.Client({
      options: { debug: true },
      identity: {
        username: username,
        password: oauthToken,
      },
      channels: [channelName],
    });

    //connect and get twitch message
    TwitchClient.connect();
    TwitchClient.on("message", (channel, tags, message, self) => {
      // Ignore echoed messages.
      if (self) return;

      // Check if the message starts with "!ai" here
      if (message.startsWith("!ai")) {
        if (message.startsWith("!aipirate")) {
          pirate = true
        }
        var twitchMessage = message.substring(message.indexOf(" ") + 1);

        // Read the CSV file and split the contents on the comma character
        
        try {
        const csv = fs.readFileSync("stoplist.csv", "utf8").split(",");
        if (csv[csv.length - 1] === '') {
          csv.pop();
        }

        // Check if the given string contains any of the values from the CSV file
        const containsValue = csv.some((value) => twitchMessage.includes(value));

        if (containsValue) {
          TwitchClient.say(channel, "the message contains a naughty word.")
          return;
        }
      }
      catch (error) {
        console.log("No word filter found!")
      }
        
        if (pirate) {
          twitchMessage = twitchMessage+"- talk to me as a pirate."
        }
        // Set the model to use for completion
        const model = "text-davinci-003";

        // Send a completion request to the OpenAI API
        axios
          .post(
            "https://api.openai.com/v1/completions",
            {
              prompt: twitchMessage,
              model: model,
              max_tokens: 200,
              n: 1,
              temperature: 0.9,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${aiKey}`,
              },
            }
          )
          .then((response) => {
            // The completed text will be in the `response.data.choices[0].text` property
            const result = response.data.choices[0].text;
            // console.log(result)
            const messages = [];
            let currentMessage = "";
            for (const word of result.split(" ")) {
              if (currentMessage.length + word.length + 1 > 500) {
                // Add the current message to the list of messages
                messages.push(currentMessage);
                // Start a new message
                currentMessage = "";
              }

              // Add the word to the current message
              currentMessage += `${word} `;
            }

            // Add the last message to the list of messages
            messages.push(currentMessage);

            let messageIndex = 0;
            const sendNextMessage = () => {
              if (messageIndex < messages.length) {
                // Send the next message
                TwitchClient.say(channel, messages[messageIndex]);
                // Increment the message index
                messageIndex++;
                // Wait 1s before sending the next message
                setTimeout(sendNextMessage, 3000);
              }
            };
            sendNextMessage();
          })
          .catch((error) => {
            // Handle any errors that occurred in the request
            console.error(error);
          });
      pirate = false
  }});
  };
  document.getElementById("tmilink").addEventListener("click", function () {
    let active_hotspot_id = localStorage.getItem("active_hotspot_id");
    ipc.send("tmiclicked", active_hotspot_id);
  });
  
  document.getElementById("ailink").addEventListener("click", function () {
    let active_hotspot_id = localStorage.getItem("active_hotspot_id");
    ipc.send("aiclicked", active_hotspot_id);
  });

  document
    .getElementById("submit")
    .addEventListener("click", () => connectToTwitch());
  document.getElementById("disconnect").addEventListener("click", () => location.reload())
});
