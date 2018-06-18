// Modules
const fs = require("fs");

// Properties
let filepath = "./logs/";
let filename = `${new Date().toString()}.log`;

// Write Error
const writeError = text => {
  if (text) {
    // Write file
    fs.writeFile(`${filepath}${filename}`, text, function(error) {
      if (error) {
        return console.log(`Failed to write error log: ${error}`);
      }
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
