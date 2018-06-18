// Modules
const fs = require("fs");

// Properties
let filepath = "./logs/";

// Write Error
const writeError = text => {
  if (text) {
    let filename = `${Math.floor(Date.now() / 1000)}.log`;
    fs.writeFile(`${filepath}${filename}`, text, function(error) {
      if (error) return console.log(`Failed to write error log: ${error}`);
      return console.log(`Saved log file as ${filename}`);
    });
  }
};

// Check Log Directory
const logDirectoryExists = () => {
  if (fs.existsSync(filepath)) return true;
  return false;
};

// Create Log Directory
const createLogDirectory = () => {
  return fs.mkdirSync(filepath);
};

// Exports
module.exports = {
  writeError: writeError,
  logDirectoryExists: logDirectoryExists,
  createLogDirectory: createLogDirectory
};
