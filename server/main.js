const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require('cors'); // Import the cors middleware
const fs = require("fs");
const path = require("path");

const useragent = require("express-useragent");

const logFilePath = path.join(__dirname, "requestLogs.txt");

const logRequestToFile = (req) => {
    const userAgentInfo = req.useragent || {};

    // Filter out false values from the userAgentInfo
    const filteredUserAgent = Object.fromEntries(
      Object.entries(userAgentInfo).filter(([key, value]) => value === true)
    );


  const logInfo = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    body: req.body,
    userAgent: filteredUserAgent,
    ip: req.ip,
  };

  const logMessage = JSON.stringify(logInfo, null, 2);

  // Append the log to the file
  fs.appendFile(logFilePath, logMessage + "\n", (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
};

const logRequest = (req, res, next) => {
  // Omit the Authorization header from the log
  logRequestToFile(req);

  next();
};

const app = express();
const port = 3000; // You can change the port as needed

// Enable parsing of user-agent information
app.use(useragent.express());

// Use the request logger middleware
app.use(logRequest);

app.use(cors());
// Middleware to parse JSON in the request body
app.use(bodyParser.json());

// In-memory user data (replace this with a database in a production environment)
const users = [
  { username: "angusbrns@gmail.com", password: "admin", role: "admin" },
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

  res.json({ username,token });
});

const authenticateToken = (req, res, next) => {
  const tokenHeader = req.headers.authorization;

  console.log(req.headers)

  if (!tokenHeader) {
    return res.status(401).json({ error: 'Unauthorized - Missing token' });
  }

  const [bearer, token] = tokenHeader.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token format' });
  }

  jwt.verify(token, jwtSecretKey, (err, user) => {
    if (err) {
      console.log("Invalid JWT?");
      return res.status(403).json({ error: 'Forbidden - Invalid token' });
    }
    
    req.user = user; // Attach the user information to the request object
    next();
  });
};

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

app.get('/api/authtest', authenticateToken, (req, res) => {
  res.json({"message": "Success! You hit a protected route"})
});

// Start the server
app.listen(port, () => {
  console.log(`Auth server is running at http://localhost:${port}/auth/login`);
});
