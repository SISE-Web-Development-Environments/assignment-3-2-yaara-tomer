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

router.get("/lastWatchedRecipesPreview", async (req, res, next) => {
  try {
    let lastWatched_ids = await DButils.getlastWatchedRecipes(req.username)

    let lastWatched_preview = await Promise.all(
      lastWatched_ids.map((recipe) =>
      recipeUtils.getRecipePreview(recipe.id)
      )
    );

    res.status(200).send(lastWatched_preview);

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

router.post("/markAsFavorite", async (req, res, next) => {
  try {
    let recipeID = req.query.id;
    await DButils.addRecipeToFavorite(req.username, recipeID);
    res.sendStatus(200);
  } catch (error) {
    if (error.number === 2627)
      res.sendStatus(200);
    else next(error);
  }
});

router.post("/removeFromFavorite", async (req, res, next) => {
  try {
    let recipeID = req.query.id;
    await DButils.removeRecipeFromFavorite(req.username, recipeID);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

router.post("/markAsWatched", async (req, res, next) => {
  try {
    await DButils.markRecipeAsWatched(req.query.id, req.username);
    res.sendStatus(200);
  } catch (error) {
    //ignore error if its duplicate request (recipe already watched)
    if (error.number === 2627)//"Violation of PRIMARY KEY constraint 'PK'. Cannot insert duplicate key in object 'dbo.Watched'. The duplicate key value is (1234, israelLevi34)."
      res.sendStatus(200);
    else next(error);
  }
});

//TODO
router.post("/addRecipe", async (req, res, next) => {
  try {

  } catch (error) {
    next(error);
  }
});

router.get("/userInfo", async (req, res, next) => {
  try {
        let user = await DButils.getUserByUsername(req.username);
        const {
          username,
          firstname,
          lastname,
          email,
          profilePicture,
          country
        } = user;

        let userInfoToReturn= {
          username:username,
          firstname:firstname,
          lastname:lastname,
          email:email,
          profilePicture:profilePicture,
          country:country
        };
        
        res.status(200).send(userInfoToReturn);


      } catch (error) {
    next(error);
  }
});




module.exports = router;
