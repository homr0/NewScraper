const axios = require("axios");
const cheerio = require("cheerio");

module.exports = (app, db) => {
  // Scrapes news website for articles.
  app.post("/scrape", (req, res) => {
    axios.get("https://www.apnews.com/").then(response => {
      const $ = cheerio.load(response.data);
      
      $("div.FeedCard").each((i, element) => {
        // Gets the article headline, summary, url, and image.
        const article = {};

        article.headline = $(element)
          .find("h1")
          .text();

        article.summary = $(element)
          .find(".content")
          .text();

        article.url = "https://www.apnews.com" + $(element)
          .find("a.headline")
          .attr("href");

        article.image = $(this)
          .find("img")
          .attr("src");

        if(article.image === undefined) {
          article.image = "./images/placeholder.png";
        }

        // Checks if the article is already in the database.
        db.Article.find(article)
        .then(dbArticle => {
          if(dbArticle.length < 1) {
            // Insert the new article into the database.
            db.Article.create(article)
            .then(resArticle => console.log(resArticle))
            .catch(error => console.log(error));
          }
        })
        .catch(error => res.json(error));
      });

      res.sendStatus(200);
    });
  });

  // Clears articles from the database.
  app.delete("/articles", (req, res) => {
    db.Article.deleteMany({})
    .then(dbArticle => res.json(dbArticle))
    .catch(error => res.json(error));
  });

  // Saves an article in the database.
  app.put("/articles/:id", (req, res) => {
    db.Article.findOneAndUpdate({_id: req.params.id}, {saved: true})
    .then(dbArticle => res.json(dbArticle))
    .catch(error => res.json(error));
  });

  // Deletes an article from the database.
  app.delete("/articles/:id", (req, res) => {
    db.Article.deleteOne({_id: req.params.id})
    .then(dbArticle => res.json(dbArticle))
    .catch(error => res.json(error));
  });
}