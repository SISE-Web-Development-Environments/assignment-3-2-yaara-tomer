
require("dotenv").config();

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
    //save only preview data for each resolt
    let recipesPreview = await Promise.all(
        search_response.data.results.map((recipe_raw) =>
          getRecipePreview(recipe_raw.id)
        )
      );
    return recipesPreview
}


async function getRecipePreview(id) {
    const getRecipe_response = await axios.get(`${api_domain}/${id}/information`, {
      params: {
        includeNutrition: false,
        apiKey: process.env.spooncular_apiKey
      }
    });
    let recipePreview = {}
    recipePreview["id"] = getRecipe_response.data.id;
    recipePreview["title"] = getRecipe_response.data.title;
    recipePreview["image"] = getRecipe_response.data.image;
    recipePreview["readyInMinutes"] = getRecipe_response.data.readyInMinutes;
    recipePreview["vegan"] = getRecipe_response.data.vegan;
    recipePreview["vegetarian"] = getRecipe_response.data.vegetarian;
    recipePreview["glutenFree"] = getRecipe_response.data.glutenFree;
    recipePreview["aggregateLikes"] = getRecipe_response.data.aggregateLikes;
  
    return recipePreview; 
  }



exports.getRecipePreview = getRecipePreview;
exports.getSearchResults = getSearchResults;