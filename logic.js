const electron = require("electron");
const ipc = electron.ipcRenderer;
const tmi = require("tmi.js");
//use twurple instead
const axios = require("axios");
const fs = require("fs");
const connectButton = document.getElementById("submit");
const lastGPTResponse = document.getElementById("aiStatus");

window.addEventListener("DOMContentLoaded", () => {
  const connectToTwitch = () => {
    let channelName = document.getElementById("channel").value;
    let oauthToken = document.getElementById("oauth").value;

    let username = document.getElementById("username").value;

    const TwitchClient = new tmi.Client({
      options: { debug: true },
      identity: {
        username: username.toLowerCase(),
        password: oauthToken,
      },
      channels: [channelName.toLowerCase()],
    });

    //connect and get twitch message
    TwitchClient.connect().then(
      function (result) {
        console.log(result);
        connectButton.style = "background-color:green";
        connectButton.innerHTML = `#${channelName}`;
        connectButton.disabled = true;
        document.getElementById("disconnect").addEventListener("click", () => {
          TwitchClient.disconnect();
          connectButton.disabled = false;
          connectButton.innerHTML = "connect";
          connectButton.style = "";
        });
        // this function is called if the promise is resolved
        //TODO green "connected" button
        //TODO lock connect button
      },
      function (error) {
        // this function is called if the promise is rejected
        connectButton.style = "background-color:red";
        connectButton.innerHTML = `Couldn't connect to Twitch. Check your oauth token`;
      }
    );

    TwitchClient.on("message", (channel, tags, message, self) => {
      // Ignore echoed messages.

      if (self) return;

      // Check if the message starts with "!ai" here
      if (message.startsWith("!ai")) {
        var twitchMessage = message.substring(message.indexOf(" ") + 1);

        // Read the CSV file and split the contents on the comma character
        console.log("logging + " + twitchMessage);

        try {
          const csv = fs.readFileSync("stoplist.csv", "utf8").split(",");
          if (csv[csv.length - 1] === "") {
            csv.pop();
          }

          // Check if the given string contains any of the values from the CSV file
          const containsValue = csv.some((value) =>
            twitchMessage.includes(value)
          );

          if (containsValue) {
            TwitchClient.say(channel, "the message contains a naughty word.");
            return;
          }
        } catch (error) {
          console.log("No word filter found!");
        }

        // Set the model to use for completion
        const model = "text-davinci-003";
        let tokens = "";
        //maybe empty string gets Number'd to zero and therefore not a NAN?
        let tokensHTML = Number(document.getElementById("tokens").value);
        if (isNaN(tokensHTML) === false) {
          tokens = tokensHTML;
          //console.log("tokens are: " + tokens);
        } else {
          tokens = 200;
          //console.log("tokens are: " + tokens);
        }

        
        // let timeout = document.getElementById("timeout").value;
        let aiKey = document.getElementById("aiKey").value;
        axios
          .post(
            "https://api.openai.com/v1/completions",
            {
              prompt: twitchMessage,
              model: model,
              max_tokens: tokens,
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
            console.log(response)
            lastGPTResponse.innerHTML =
              "<p style='color:green'>AI is working as intended</p>";
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
                setTimeout(sendNextMessage, 4000);
              }
            };
            sendNextMessage();
          })
          .catch((error) => {
            // Handle any errors that occurred in the request

            lastGPTResponse.innerHTML = `<p style='color:red'>Encountered following error while sending a request to openai:<br><br><code style='color:white'>${error}</code><br><br>If status code is 401, check your API key for OpenAI</p>`;
          });
      }
    });
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
});
