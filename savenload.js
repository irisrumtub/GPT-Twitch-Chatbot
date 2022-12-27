const fs = require('fs');

const save = document.getElementById('saveCreds');
save.addEventListener('click', (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const channel = document.getElementById('channel').value;
  const oauth = document.getElementById('oauth').value;
  const aiKey = document.getElementById('aiKey').value;
  const tokens = document.getElementById('tokens').value;
  const timeout = document.getElementById('timeout').value
  const config = {
    username,
    channel,
    oauth,
    aiKey,
    tokens,
    timeout
  };
  fs.writeFileSync('config', JSON.stringify(config));
});

const load = document.getElementById('loadCreds');
load.addEventListener('click', (event) => {
try {
  // Read the config file and parse the JSON string
  const config = JSON.parse(fs.readFileSync('config'));

  // Set the form input values using the values from the config object
  document.getElementById('username').value = config.username;
  document.getElementById('channel').value = config.channel;
  document.getElementById('oauth').value = config.oauth;
  document.getElementById('aiKey').value = config.aiKey;
  document.getElementById('tokens').value = config.tokens;
  document.getElementById('timeout').value = config.timeout;
} catch (error) {
  // File does not exist or JSON string is invalid
  console.log('No valid config found');
}
})