var express = require("express");
var router = express.Router();
const axios = require("axios");
const recipeUtils = require("./utils/recipesAPIutils");




router.get("/", async (req, res, next) => {
  try {
    const search_results = await recipeUtils.getSearchResults(req.query);
    res.status(200).send(search_results);
  } catch (error) {
    next(error);
  }
});



module.exports = router;
