const express = require('express');
const router = express.Router();
const { Recipe } = require('../models/recipe');
const { User } = require('../models/user');

// Add Route
router.get('/add', ensureAuthenticated, async (req, res) => {
  res.render('add_recipe', {
    title: 'Add Recipe'
  });
});

// Add Submit POST Route
router.post('/add', async (req, res) => {
  try {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('type', 'Type is required').notEmpty();
    req.checkBody('difficulty', 'Difficulty is required').notEmpty();
    req.checkBody('time', 'Time is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    // Get Errors
    let errors = req.validationErrors();

    if (errors) {
      res.render('add_recipe', {
        title: 'Add Recipe',
        errors: errors
      });
    } else {
      let recipe = await Recipe.create({
        title: req.body.title,
        type: req.body.type,
        difficulty: req.body.difficulty,
        time: req.body.time,
        author: req.user._id,
        body: req.body.body,
      });
      recipe.save();
      req.flash('success', 'Recipe Added');
      res.redirect('/');
    }
  } catch (e) {
    res.send(e);
  }

});

// Filter Submit POST Route
router.post('/filter', async (req, res) => {
  const type = req.body.type;
  const difficulty = req.body.difficulty;
  const time = req.body.time;

  Recipe.find({}, function (err, recipes) {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title: 'Recipes',
        recipes: recipes.filter(recipe => {
          return recipe.type == type && recipe.difficulty == difficulty && recipe.time == time
        })
      });
    }
  });
});


// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (req.user.role != 'admin') {
      req.flash('danger', 'Not Authorized');
      return res.redirect('/');
    }
    res.render('edit_recipe', {
      title: 'Edit Recipe',
      recipe: recipe
    });

  } catch (e) {
    res.send(e);
  }

});

// Update Submit POST Route
router.post('/edit/:id', async (req, res) => {
  try {
    const recipe = {
      title: req.body.title,
      author: req.body.name,
      type: req.body.type,
      difficulty: req.body.difficulty,
      time: req.body.time,
      body: req.body.body
    };

    let query = { _id: req.params.id }

    const update = await Recipe.update(query, recipe);
    if (update) {
      req.flash('success', 'Recipe Updated');
      res.redirect('/');
    } return;

  } catch (e) {
    res.send(e);
  }

});

// Delete Recipe
router.delete('/:id', async (req, res) => {

  try {
    if (!req.user._id) {
      res.status(500).send();
    }
    let query = { _id: req.params.id }
    const recipe = await Recipe.findById(req.params.id);

    if (req.user.role !== 'admin') {
      res.status(500).send();
    } else {
      remove = await Recipe.findByIdAndRemove(query);
      if (remove) {
        res.send('Success');
      }
    };
  } catch (e) {
    res.send(e);
  }

});

// Get Single Recipe
router.get('/:id', async (req, res) => {

  const recipe = await Recipe.findById(req.params.id);
  const user = await User.findById(recipe.author);
  if (user) {
    res.render('recipe', {
      recipe: recipe,
      author: user.name
    });
  }
});

// Access Control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
