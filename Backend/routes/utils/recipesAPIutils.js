
require("dotenv").config();

const axios = require("axios");
const path = require("path");
const api_domain = "https://api.spoonacular.com/recipes";

async function getSearchResults(params) {
    const { q,n, cuisine, diet, intolerances } = params;
    const search_response = await axios.get(`${api_domain}/search`, {
      params: {
        query: q,
        cuisine: cuisine,
        diet: diet,
        intolerances: intolerances,
        number: n,
        instructionsRequired: true,
        apiKey: process.env.spooncular_apiKey,
      },
    });
    //save only preview data for each result
    let recipesPreview = await Promise.all(
        search_response.data.results.map((recipe_raw) =>
          getRecipePreview(recipe_raw.id)
        )
      );
    return recipesPreview
}


async function getRecipePreview(recipe_id) {
    const getRecipe_response = await axios.get(`${api_domain}/${recipe_id}/information`, {
      params: {
        includeNutrition: false,
        apiKey: process.env.spooncular_apiKey
      }
    });

    const {
      id,
      title,
      image,
      readyInMinutes,
      vegan,
      vegetarian,
      glutenFree,
      aggregateLikes,
    } = getRecipe_response.data;

    return {
      id : id,
      title : title,
      image : image,
      readyInMinutes:readyInMinutes,
      vegan:vegan,
      vegetarian:vegetarian,
      glutenFree:glutenFree,
      aggregateLikes:aggregateLikes,
    };
  
  
  }



exports.getRecipePreview = getRecipePreview;
exports.getSearchResults = getSearchResults;