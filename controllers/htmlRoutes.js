module.exports = (app, db) => {
  // Shows all of the unsaved articles that have been scraped.
  app.get("/", (req, res) => {
    db.Article.find({saved: false})
    .then(dbArticle => {
      res.render("index", {
        articles: dbArticle,
        title: "Home"
      });
    })
    .catch(error => res.json(error));
  });

  // Shows all of the saved articles.
  app.get("/saved", (req, res) => {
    db.Article.find({saved: true})
    .then(dbArticle => {
      const hbsObject = {
        articles: dbArticle,
        title: "Saved Articles"
      }

      res.render("saved", hbsObject);
    })
    .catch(error => res.json(error));
  });

  // Renders the 404 page in case of an error.
  app.get("*", (req, res) => {
    res.render("404");
  });
}