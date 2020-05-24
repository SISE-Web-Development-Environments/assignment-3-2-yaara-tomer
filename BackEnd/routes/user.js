var express = require("express");
var router = express.Router();
const axios = require("axios");
const recipeUtils = require("./utils/recipesAPIutils");
const DButils = require("./utils/DButils");

//cookie middleware
router.use(function (req, res, next) {
  if (req.session && req.session.id) {
    const id = req.session.id;
    DButils.getUserByID(id).then((response) => {
      if (response && response.username) {
        req.username = response.username;
        next();
      }
      else{
        res.sendStatus(401);
      }
    })
    .catch((error) => next(error));
  } else {
    res.sendStatus(401);
  }
});

//TODO
router.get("/getLastWatchedRecipesPreview", function (req, res, next) {
  try {
    let username = req.username;
    res.sendStatus(200);

  } catch (error) {
    next(error);
  }
});

//TODO
router.get("/getFavoriteRecipesPreview", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.get("/getAllPersonalRecipesPreview", function (req, res, next) {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.get("/getPersonalRecipeByid", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.get("/getAllFamilyRecipesPreview", function (req, res, next) {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.get("/getFamilyRecipeByid", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.post("/markAsFavorite", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.post("/markAsWatched", function (req, res, next) {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.post("/addRecipe", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});




module.exports = router;
