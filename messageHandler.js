const handleMessage = (TwitchClient) => {
  const fs = require("fs");
  const axios = require("axios");
  const OPENAI_ENDPOINT = "https://api.openai.com/v1/completions";
  const MODEL = "text-davinci-003";
  const lastGPTResponse = document.getElementById("aiStatus");
  
  let onCooldown = false
  TwitchClient.on("message", (channel, tags, message, self) => 
  //here it begins
  {
    let timeout = "";
let timeoutHTML = Number(document.getElementById("timeout").value);
if (isNaN(timeoutHTML) || timeoutHTML <= 0) {
  timeout = 0;
} else {
  timeout = timeoutHTML;
}
      
    if (self) return;

    if (message.startsWith("!ai") != true) return;

    if (onCooldown == true) return;

    //getting message substring without !ai part
    var twitchMessage = message.substring(message.indexOf(" ") + 1);

    //try catch checks if we have a file in folder called stoplist.csv.
    //checking the message word by word for matching any of our words in banlist
    try {
      const csv = fs.readFileSync("stoplist.csv", "utf8").split(",");
      if (csv[csv.length - 1] === "") {
        csv.pop();
      }
      const containsValue = csv.some((value) => twitchMessage.includes(value));
      if (containsValue) {
        TwitchClient.say(channel, "the message contains a naughty word.");
        return;
      }
    } catch (error) {
      console.warn("No word filter found!");
    }

    let tokens = "";
let tokensHTML = Number(document.getElementById("tokens").value);
if (isNaN(tokensHTML) || tokensHTML <= 10) {
  tokens = 200;
} else {
  tokens = tokensHTML;
}
    let aiKey = document.getElementById("aiKey").value;
    axios
      .post(
        OPENAI_ENDPOINT,
        {
          prompt: twitchMessage,
          model: MODEL,
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
        console.log(response);
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
            TwitchClient.say(channel, "Response from AI:"+messages[messageIndex]);
            // Increment the message index
            messageIndex++;
            // Wait 1s before sending the next message
            // setTimeout(sendNextMessage, 4000);
          }
        };
        sendNextMessage();
        onCooldown = true;
        setTimeout(() => onCooldown = false, (timeout*1000))
      })
      .catch((error) => {
        // ndle any errors that occurred in the request

        lastGPTResponse.innerHTML = `<p style='color:red'>Encountered following error while sending a request to openai:<br><br><code style='color:white'>${error}</code><br><br>If status code is 401, check your API key for OpenAI</p>`;
      });
    // setTimeout()
  }
  //here it ends
  );
};
module.exports = handleMessage;
