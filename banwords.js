const fs = require("fs");
const addWords = document.getElementById("addWords");
const input = document.getElementById("wordlist");
addWords.addEventListener("click", () => {
  // Get the selected file
  const file = input.files[0];

  // Check if the file is a CSV file
  if (file.name.endsWith(".csv")) {
    // Create a FileReader object
    const reader = new FileReader();

    // Read the contents of the file as a text string
    reader.readAsText(file);

    // When the file has been read, add its contents to the stoplist.csv file
    reader.onload = () => {
      // Split the file contents on the comma character
      const stopwords = reader.result.split(",");

      // Read the stoplist.csv file
      if (!fs.existsSync("stoplist.csv")) {
        fs.writeFileSync("stoplist.csv", ""); // creates a new, empty file in case if it doesnt exist
      }
      const stoplist = fs.readFileSync("stoplist.csv", "utf8");

      // Loop through the stopwords and add them to the stoplist.csv file if they are not already present
      stopwords.forEach((word) => {
        if (!stoplist.includes(word)) {
          fs.appendFileSync("stoplist.csv", `${word},`);
        }
      });
    };
  } else {
    // File is not a CSV file
    console.log("Please select a CSV file");
  }
  document.getElementById(
    "loadComplete"
  ).innerHTML = `file ${file.name} has been added to the list.`;
});
