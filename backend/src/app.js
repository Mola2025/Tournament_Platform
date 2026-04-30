const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  console.log("Hello from backend");
  res.send("<h1>Hello from backend</h1>");
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
