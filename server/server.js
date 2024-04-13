
const { myRoute } = require('./authRoutes');
const astral = require('./astral')
const path = require("path")
const jwt = require("jsonwebtoken");

function loginRoute({users, config}, req, res) {
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
    config.jwt_key,
    { expiresIn: "1h" } // Token expires in 1 hour, adjust as needed
  );

  res.json({ username,token });
};

const config = {
  port: 3000,
  database: {
    type: "sqlite3",
    connection: "database.db"
  },
  jwt_key: "your-secret-key",
  script_folder: __dirname + "/scripts"
}

const multer = require("multer");
const { RouteGuard } = require('./middleware');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./data/uploads/"); // Uploads will be stored in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // File will be renamed with a timestamp prefix
  },
});

const upload = multer({ storage: storage });


const UploadSingleFile = (ctx, req, res, next) => (upload.single("file"));

const context = {
  database: null,
  value: "test value",
  users : [
  { username: "angusbrns@gmail.com", password: "admin", role: "admin" },
  { username: "astro-test", password: "test", role: "user" },
],
  config
}

const routeTree = [
  {
    path: "/api/authtest",
    resolver: myRoute,
    middleware: [RouteGuard,],
    nested: [
      {
        path: "/upload",
        resolver: (ctx, req, res) => {
          res.json({ message: "route 2" });
        },
      },
    ],
  },
  {
    path: "/auth/login",
    method: "POST",
    resolver: loginRoute,
  },
  {
    path: "/",
    resolver: path.join(__dirname, "../client/dist/"),
  },
  {
    path: "*",
    resolver: (ctx, req, res) => {
      res.sendFile(path.join(__dirname, "../client/dist/index.html"));
    },
  },
];

/*
  NOTE: this should work as expected now. The next steps are to update middleware to take in a context like the normal
  route funtions and also add a method config type. 

  Context -> gets initialised by astral engine with db connection, import config values and acess to any other state
          -> context provided manually gets appended

  We cant handle /:id params yet so that is something to consider. Easy to avoid if using body for request data

  Script Engine should handle init script if exists. Script Engine also passes a handle to context.

  Completing requests becomes as simple as:

    function updateUser(ctx, req, res) {
      const db  = ctx.database;

      const [err, result] = db.run(ctx.getQuery("updateUsers", {....}))

      if (!err) {
        res.json(result)
      }
    }

  Then we just have authRoutes.js, deviceManagerRoutes.js, ... etc which module.export the route handles
  -> these get taken and placed into the nice tree with the required middleware for protected routes etc

  const {db, scriptEngine} = ctx;

  is a powerful way to get access to scriptEngine.run("LONG_RUNNING_TASK") which can be async, background and 
  still have access to the main db

*/


astral.run(config, routeTree, context);