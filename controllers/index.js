module.exports = (app, db) => {
  require("./articleRoutes")(app, db);
  require("./noteRoutes")(app, db);
  require("./htmlRoutes")(app, db);
}