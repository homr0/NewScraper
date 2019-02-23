$(document).ready(() => {
  // Initializes Materialize
  M.AutoInit();

  // Creates note HTML.
  var writeNote = note => {
    var body = $("<blockquote>").text(note.body);

    var author = $("<p>").html("&mdash; <strong>" + note.author + "</strong>");

    var deleteBtn = $("<button>")
    .addClass("btn-floating waves-effect waves-light right red darken-2 note delete")
    .attr("data-id", note._id)
    .html("<i class='material-icons'>close</i>");

    $("<li>")
    .addClass("collection-item note")
    .attr("id", note._id)
    .append(deleteBtn, body, author)
    .insertAfter("#current-notes .collection-header");
  };

  // Scrapes news articles.
  $(".scrape").on("click", function(e) {
    e.preventDefault();

    $.ajax({
      method: "POST",
      url: "/scrape"
    }).then(() => $("#scrape-complete").modal("open"));
  });

  // Clears all articles from the database.
  $(".clear").on("click", function(e) {
    e.preventDefault();

    $.ajax({
      method: "DELETE",
      url: "/articles"
    }).then(() => location.reload())
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
    }).then(() => $("#news" + articleId).remove());
  });

  // Deletes an article from the database.
  $(".delete").on("click", function(e) {
    e.preventDefault();

    const articleId = $(this).data("id");

    $.ajax({
      method: "DELETE",
      url: "/articles/" + articleId,
      data: {
        id: articleId
      }
    }).then(() => $("#news" + articleId).remove());
  });

  // Opens the notes for the article.
  $(".note").on("click", function(e) {
    e.preventDefault();

    const articleId = $(this).data("id");

    $.ajax({
      method: "GET",
      url: "/articles/" + articleId
    }).then((data) => {
      // Populates the article notes modal.
      $("#article-notes h4 a")
      .attr("href", data.link)
      .text(data.headline);

      $("#current-notes .note").remove();

      $(data.notes).each(function() {
        writeNote(this);
      });

      $("#note-create").attr("data-id", data._id);

      // Opens the modal.
      $("#article-notes").modal("open");
    });
  })
  
  // Creates a new note for an article.
  $("#note-create").on("click", function(e) {
    e.preventDefault();

    const articleId = $(this).data("id");

    const newNote = {
      body: $("#note-body").val().trim(),
      author: $("#note-author").val().trim()
    }

    $.ajax({
      method: "POST",
      url: "/articles/" + articleId,
      data: newNote
    }).then((data) => {
      writeNote(data);
      $("#note-body, #note-author").val("");
    });
  });

  // Deletes a note.
  $("#current-notes").on("click", ".delete", function(e) {
    e.preventDefault();

    const articleId = $("#note-create").data("id");
    const noteId = $(this).data("id");

    $.ajax({
      method: "DELETE",
      url: "/articles/" + articleId + "/" + noteId
    }).then(() => $("#" + noteId).remove());
  });
});