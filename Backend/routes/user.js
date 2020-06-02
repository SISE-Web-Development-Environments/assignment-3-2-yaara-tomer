var express = require("express");
var router = express.Router();
const axios = require("axios");
const recipeUtils = require("./utils/recipesAPIutils");
const DButils = require("./utils/DButils");

//cookie authentication middleware
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
router.get("/recipeInfo/:ids", async (req, res, next) => {
  try {
    let ids = JSON.parse(req.params.ids);
    let username = req.username;
    console.log(ids,username);
    //TODO extract meta info from DB
    res.sendStatus(200);

  } catch (error) {
    next(error);
  }
});

//TODO
router.get("/lastWatchedRecipesPreview", async (req, res, next) => {
  try {
    let username = req.username;
    res.sendStatus(200);

  } catch (error) {
    next(error);
  }
});

//TODO
router.get("/favoriteRecipesPreview", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.get("/PersonalRecipesPreview", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.get("/personalRecipeByid", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.get("/FamilyRecipesPreview", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.get("/familyRecipeByid", async (req, res, next) => {
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
router.post("/removeFromFavorite", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});

//TODO
router.post("/markAsWatched", async (req, res, next) => {
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

//TODO
router.get("/userInfo", async (req, res, next) => {
  try {
        let user = await DButils.getUserByUsername(req.username);
        const {
          username,
          firsname,
          lastname,
          email,
          profilePicture,
          country
        } = user;
        return {
          username:username,
          firsname:firsname,
          lastname:lastname,
          email:email,
          profilePicture:profilePicture,
          country:country
        };
        
      } catch (error) {
    next(error);
  }
});




module.exports = router;
