const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require('cors'); // Import the cors middleware

const app = express();
const port = 3000; // You can change the port as needed

app.use(cors());
// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// In-memory user data (replace this with a database in a production environment)
const users = [
  { username: "astro", password: "admin", role: "admin" },
  { username: "astro-test", password: "test", role: "user" },
];

// Secret key for JWT (change this to a secure, random key in a production environment)
const jwtSecretKey = "your-secret-key";

// Authentication endpoint
app.post("/auth/login", (req, res) => {
  const { username, password } = req.body;

  // Find the user in the in-memory data
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      username: user.username,
      role: user.role,
      createdAt: new Date(),
    },
    jwtSecretKey,
    { expiresIn: "1h" } // Token expires in 1 hour, adjust as needed
  );

  res.json({ token });
});

app.post("/auth/register", (req, res) => {
  const { username, password, role } = req.body;

  // Check if the username is already taken
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ message: "Username is already taken" });
  }

  // Add the new user to the in-memory data
  const newUser = { username, password, role: role || "user" };
  users.push(newUser);

  // Generate JWT token for the new user
  const token = jwt.sign(
    {
      username: newUser.username,
      role: newUser.role,
      createdAt: new Date(),
      // Add any other essential fields for security here
    },
    jwtSecretKey,
    { expiresIn: "1h" } // Token expires in 1 hour, adjust as needed
  );

  res.json({ token });
});

// Start the server
app.listen(port, () => {
  console.log(`Auth server is running at http://localhost:${port}/auth/login`);
});
