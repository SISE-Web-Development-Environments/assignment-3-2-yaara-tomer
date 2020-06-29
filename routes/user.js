var express = require("express");
var router = express.Router();
const axios = require("axios");
const recipeUtils = require("./utils/recipesAPIutils");
const DButils = require("./utils/DButils");

//cookie authentication middleware
router.use(function (req, res, next) {
  if (req.session && req.session.id) {
    const id = req.session.id;
    DButils.getUserByID(id)
      .then((response) => {
        if (response && response.username) {
          req.username = response.username;
          next();
        } else {
          res.sendStatus(401);
        }
      })
      .catch((error) => next(error));
  } else {
    res.sendStatus(401);
  }
});

router.get("/recipeInfo/:ids", async (req, res, next) => {
  try {
    let ids = JSON.parse(req.params.ids);
    let tmp = ids.some(isNaN);
    if (!Array.isArray(ids) || ids.length == 0 || ids.some(isNaN)) {
      res.status(400).send({
        message: "bad parameters.please provide an array with numeric ids",
        success: false,
      });
    } else {
      let recipes_metaInfo = {};

      await Promise.all(
        ids.map((recipe_id) =>
          DButils.getRecipeFavoriteAndWatchedInfo(req.username, recipe_id).then(
            (value) => {
              recipes_metaInfo[recipe_id] = value;
            }
          )
        )
      );
      res.status(200).send(recipes_metaInfo);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/lastWatchedRecipesPreview", async (req, res, next) => {
  try {
    let lastWatched_ids = await DButils.getlastWatchedRecipesIDs(req.username);
    console.log(lastWatched_ids);


    let lastWatched_preview = await Promise.all(
      lastWatched_ids.map((recipe) => {
        if (recipe.type === "r") {
          //regular
          return recipeUtils.getRecipePreview(recipe.id);
        } else if (recipe.type === "p") {
          //personal
          return DButils.getPersonalRecipePreviewByID(recipe.id);
        } else if (recipe.type === "f") {
          //family
          return DButils.getFamilyRecipePreviewByID(recipe.id);
        }
      })
    );

    res.status(200).send(lastWatched_preview);
  } catch (error) {
    next(error);
  }
});

router.get("/favoriteRecipesPreview", async (req, res, next) => {
  try {
    let favorite_ids = await DButils.getFavoriteRecipesID(req.username);

    let favorite_preview = await Promise.all(
      favorite_ids.map((recipe) =>
        recipeUtils.getRecipePreview(recipe.recipe_id)
      )
    );

    res.status(200).send(favorite_preview);
  } catch (error) {
    next(error);
  }
});

router.get("/PersonalRecipesPreview", async (req, res, next) => {
  try {
    let previews = await DButils.getAllPersonalRecipesPreview(req.username);
    res.status(200).send(previews);
  } catch (error) {
    next(error);
  }
});

router.get("/personalRecipeByid", async (req, res, next) => {
  try {
    let recipe = await DButils.getPersonalRecipeByID(req.query.id);

    //verify recipe exist and belong to user
    if (!recipe || recipe.username !== req.username) {
      res.sendStatus(400);
    } else {
      let recipeDate = JSON.parse(recipe.recipeData);
      recipeDate.id = recipe.id;

      res.status(200).send(recipeDate);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/FamilyRecipesPreview", async (req, res, next) => {
  try {
    let previews = await DButils.getAllFamilyRecipesPreview(req.username);
    res.status(200).send(previews);
  } catch (error) {
    next(error);
  }
});

router.get("/familyRecipeByid", async (req, res, next) => {
  try {
    let recipe = await DButils.getFamilyRecipeByID(req.query.id);

    //verify  recipe exist and belong to user
    if (!recipe || recipe.username !== req.username) {
      res.sendStatus(400);
    } else {
      let recipeDate = JSON.parse(recipe.recipeData);
      recipeDate.id = recipe.id;

      res.status(200).send(recipeDate);
    }
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
    if (error.number === 2627) res.sendStatus(200);
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
  if (req.query.id && req.username && req.query.type) {
    try {
      await DButils.markRecipeAsWatched(
        req.query.id,
        req.username,
        req.query.type
      );
      res.sendStatus(200);
    } catch (error) {
      //ignore error if its duplicate request (recipe already watched)
      if (error.number === 2627)
        //"Violation of PRIMARY KEY constraint 'PK'. Cannot insert duplicate key in object 'dbo.Watched'. The duplicate key value is (1234, israelLevi34)."
        res.sendStatus(200);
      else next(error);
    }
  }
});

router.post("/addRecipe", async (req, res, next) => {
  try {
    await DButils.addPersonalRecipeToDB(req.body, req.username);
    res.sendStatus(201);
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
      country,
    } = user;

    let userInfoToReturn = {
      username: username,
      firstname: firstname,
      lastname: lastname,
      email: email,
      profilePicture: profilePicture,
      country: country,
    };

    res.status(200).send(userInfoToReturn);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
