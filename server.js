var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Routes
// Scrapes news website for articles.
app.post("/scrape", function(req, res) {
  axios.get("https://www.apnews.com/").then(function(response) {
    var $ = cheerio.load(response.data);

    $("div.WireStory").each(function(i, element) {
      // Gets the article headline, summary, url, and image.
      var article = {};

      article.headline = $(this)
        .find("h1")
        .text();

      article.summary = $(this)
        .find(".content")
        .text();

      article.url = "https://www.apnews.com" + $(this)
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
      .then(function(dbArticle) {
        if(dbArticle.length < 1) {
          // Insert the new article into the database.
          article.saved = false;

          db.Article.create(article)
          .then(function(resArticle) {
            console.log(resArticle);
          })
          .catch(function(error) {
            console.log(error);
          });
        }

        console.log("Looking for another article");
      });
    });

    // Redirects to where scraped articles are.
    res.redirect("/");
  });
});

// Clears articles from the database.
app.delete("/articles", function(req, res) {
  db.Article.deleteMany({})
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    console.log(err);
  });
});

// Shows all of the unsaved articles that have been scraped.
app.get("/", function(req, res) {
  db.Article.find({saved: false})
  .then(function(dbArticle) {
    res.render("index", {
      articles: dbArticle
    });
  });
});

// Shows all of the saved articles.
app.get("/saved", function(req, res) {
  db.Article.find({saved: true})
  .then(function(dbArticle) {
    var hbsObject = {
      articles: dbArticle,
      title: "Saved Articles"
    }

    res.render("saved", hbsObject);
  })
  .catch(function(err) {
    res.json(err);
  });
});

// Renders the 404 page in case of an error.
app.get("*", function(req, res) {
  res.render("404");
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});