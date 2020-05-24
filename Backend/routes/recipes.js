//TODO all
var express = require("express");
var router = express.Router();
const axios = require("axios");
const recipeUtils = require("./utils/recipesAPIutils");



router.get("/getRandomRecipesPreview", function (req, res, next) {
  try {

  } catch (error) {
    next(error);
  }
});


router.get("/getFullRecipeByid", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});


module.exports = router;
