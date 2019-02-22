$(document).ready(() => {
  // Initializes Materialize
  M.AutoInit();

  // Scrapes news articles.
  $(".scrape").on("click", function(e) {
    e.preventDefault();

    $.ajax({
      method: "POST",
      url: "/scrape"
    }).then(data => {
      console.log(data);
      $("#scrape-complete").modal("open");
    });
  });

  // Clears all articles from the database.
  $(".clear").on("click", function(e) {
    e.preventDefault();

    $.ajax({
      method: "DELETE",
      url: "/articles"
    }).then(data => location.reload())
  });

  // Saves the article in the database.
  $(".save").on("click", function(e) {
    e.preventDefault();

    const articleId = $(this).data("id");

    $.ajax({
      method: "PUT",
      url: "/articles/" + articleId,
      data: {
        id: articleId
      }
    }).then(data => $("#news" + articleId).remove());
  });

  $(".delete").on("click", function(e) {
    e.preventDefault();

    const articleId = $(this).data("id");

    $.ajax({
      method: "DELETE",
      url: "/articles/" + articleId,
      data: {
        id: articleId
      }
    }).then(data => $("#news" + articleId).remove());
  });

  $(".note.create").on("click", function(e) {
    e.preventDefault();

    const articleId = $(this).data("id");

    const newNote = {
      title: $
    }

    $.ajax({
      method: "POST",
      url: "/articles/" + articleId,
      data: newNote
    }).then(data => location.reload());
  });
});