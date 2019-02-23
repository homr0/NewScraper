const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  headline: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    required: true
  },
  
  url: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  saved: {
    type: Boolean,
    default: false
  },

  notes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Note"
    }
  ]
});

const Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;
