// Modules
const fs = require("fs");
const path = require("path");

// Write Error
const writeError = text => {
  if (text) {
    // Properties
    let filepath = "./logs/";
    let filename = `${new Date().toString()}.log`;
    // Write file
    fs.writeFile(`${filepath}${filename}`, text, function(error) {
      if (error) {
        return console.log(`Failed to write error log: ${error}`);
      }
      return console.log(`Saved log file as ${filename}`);
    });
  }
};

// Exports
module.exports = {
  writeError: writeError
};
