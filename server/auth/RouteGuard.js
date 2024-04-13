const jwt = require("jsonwebtoken");

const RouteGuard = (req, res, next) => {
  const tokenHeader = req.headers.authorization;

  console.log(req.headers);

  if (!tokenHeader) {
    return res.status(401).json({ error: "Unauthorized - Missing token" });
  }

  const [bearer, token] = tokenHeader.split(" ");

  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({ error: "Unauthorized - Invalid token format" });
  }

  jwt.verify(token, jwtSecretKey, (err, user) => {
    if (err) {
      console.log("Invalid JWT?");
      return res.status(403).json({ error: "Forbidden - Invalid token" });
    }

    req.user = user; // Attach the user information to the request object
    next();
  });
};

module.exports = {
  RouteGuard,
};
