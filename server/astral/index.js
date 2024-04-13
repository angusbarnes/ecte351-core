const express = require("express")
const app = express()
const cors = require("cors");
const bodyParser = require("body-parser");
const database = require("./db/db")

function generateRoutes(app, routeTree, context, parentPath = "") {
  routeTree.forEach((route) => {

    // app.get("*.js", (req, res, next) => {
    //   res.type("application/javascript");
    //   next();
    // });

    // app.get("*.css", (req, res, next) => {
    //   res.type("application/stylesheet");
    //   next();
    // });

    const fullPath = parentPath + route.path;
    const { resolver, method, middleware, nested } = route;

    const middle = [];

    console.log(middleware)

    middle.push(middleware.RouteGuard(context));


    if (typeof resolver === "function") {
      // If resolver is a function, use it as a route handler
      if (method && method === "POST") {
        app.post(fullPath, ...(middle || []), (req, res) => {
          resolver(context, req, res);
        });
      } else {
        app.get(fullPath, ...(middle || []), (req, res) => {
          resolver(context, req, res);
        });
      }
    } else if (typeof resolver === "string") {
      // If resolver is a string, serve static folder at that path
      app.use(fullPath, express.static(resolver));
      console.log("Registered static path for: " + resolver)
    }

    if (nested && nested.length > 0) {
      // Recursively generate routes for nested routes
      generateRoutes(app, nested, context, fullPath);
    }
  });
}

function run(config, routes, context = null) {
    app.use(bodyParser.json());
    app.use(cors());

    const ctx = context || {};

    ctx.db = database;
    
    generateRoutes(app, routes, context);
    app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
}

module.exports = {
  run
}