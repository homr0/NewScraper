const express = require("express");
const exphbs = require("express-handlebars");
const logger = require("morgan");
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

const PORT = 3000;

// Initialize Express
const app = express();

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
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

// Routes
// Scrapes news website for articles.
app.post("/scrape", (req, res) => {
  axios.get("https://www.apnews.com/").then(response => {
    const $ = cheerio.load(response.data);

    $("div.WireStory").each((i, element) => {
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

// Populates the article with its note(s).
app.get("/articles/:id", (req, res) => {
  db.Article.findOne({_id: req.params.id})
  .populate("note")
  .then(dbArticle => res.json(dbArticle))
  .catch(error => res.json(error));
});

// Creates a note for an article.
app.post("/articles/:id", (req, res) => {
  db.Note.create(req.body)
  .then(dbNote => {
    db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id})
    .then(dbArticle => res.json(dbArticle))
    .catch(error => res.json(error));
  });
});

// Deletes a note for an article.
app.delete("/articles/:id/:note", (req, res) => {
  db.Note.removeOne({_id: req.params.note})
  .then(dbNote => res.json(dbNote))
  .catch(error => res.json(error));
});

// Shows all of the unsaved articles that have been scraped.
app.get("/", (req, res) => {
  db.Article.find({saved: false})
  .then(dbArticle => {
    res.render("index", {
      articles: dbArticle
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

// Start the server
app.listen(PORT, () => console.log("App running on port " + PORT + "!"));