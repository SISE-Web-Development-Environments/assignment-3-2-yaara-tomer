//TODO all
var express = require("express");
var router = express.Router();
const axios = require("axios");
const recipeUtils = require("./utils/recipesAPIutils");



router.get("/randomRecipesPreview", async (req, res, next) => {
  try {
    let random_recipes = await recipeUtils.getRandomRecipes();
    res.status(200).send(random_recipes);
  } catch (error) {
    next(error);
  }
});


router.get("/fullRecipeByid", async (req, res, next) => {
  try {
    let recipe = await recipeUtils.getFullRecipeById(req.query.id);
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});


module.exports = router;
