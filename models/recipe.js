const mongoose = require('mongoose');

// Recipe Schema
const recipeSchema = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  difficulty: {
    type: Number,
    required: true
  },
  time: {
    type: Number,
    required: true
  },
  body: {
    type: String,
    required: true
  }
});
const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports.Recipe = Recipe;
