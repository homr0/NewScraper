$(document).ready(function() {
  // Initializes Materialize
  M.AutoInit();

  // Scrapes news articles.
  $(".scrape").on("click", function(e) {
    e.preventDefault();

    $.ajax({
      method: "POST",
      url: "/scrape"
    }).then(function(data) {
      console.log("Scraped more articles.");
      location.reload();
    });
  });

  // Clears all articles from the database.
  $(".clear").on("click", function(e) {
    e.preventDefault();

    $.ajax({
      method: "DELETE",
      url: "/articles"
    }).then(function(data) {
      console.log("Cleared all articles from the database.");
      location.reload();
    })
  });

  // Saves the article in the database.
  $(".delete").on("click", function(e) {
    e.preventDefault();

    var articleId = $(this).data("id");

    $.ajax({
      method: "DELETE",
      url: "/articles/" + articleId,
      data: {
        id: articleId
      }
    }).then(function(data) {
      console.log("Deleted this article.");

      $("[data-id='" + articleId + "']").remove();
    });
  })
});