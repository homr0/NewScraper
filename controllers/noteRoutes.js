module.exports = (app, db) => {
  // Populates the article with its note(s).
  app.get("/articles/:id", (req, res) => {
    db.Article.findOne({_id: req.params.id})
    .populate("notes")
    .then(dbArticle => {
      res.send(dbArticle);
    })
    .catch(error => res.json(error));
  });

  // Creates a note for an article.
  app.post("/articles/:id", (req, res) => {
    db.Note.create(req.body)
    .then(dbNote => {
      db.Article.findOneAndUpdate({_id: req.params.id}, {$push: {notes: dbNote._id}}, {new: true})
      .then(() => res.send(dbNote))
      .catch(error => res.json(error));
    });
  });

  // Deletes a note for an article.
  app.delete("/articles/:id/:note", (req, res) => {
    db.Note.deleteOne({_id: req.params.note})
    .then(dbNote => res.json(dbNote))
    .catch(error => res.json(error));
  });
}