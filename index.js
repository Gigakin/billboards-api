// Modules
const express = require("express");
const serverPort = process.env.PORT || 8000;
const app = express();

// Start Server
app.listen(serverPort, () => {
  console.log(`Live on ${serverPort}`);
});
