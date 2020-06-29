require("dotenv").config();

const axios = require("axios");
const path = require("path");
const api_domain = "https://api.spoonacular.com/recipes";

async function getRandomRecipes() {
  let search_response = await axios.get(`${api_domain}/random`, {
    params: {
      number: 3,
      apiKey: process.env.spooncular_apiKey,
    },
  });

  //change recipe if instructions not exist
  search_response = await Promise.all(
    search_response.data.recipes.map((recipe_raw) =>
    verifyInstruction(recipe_raw)
    )
  );
  
  //save only preview data for each result
  let recipesPreview = await Promise.all(
    search_response.map((recipe_raw) =>
      extractPreviewFromFullRecipe(recipe_raw)
    )
  );
  return recipesPreview;
}

async function getSearchResults(params) {
  const { q, n, cuisine, diet, intolerances } = params;
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
  return recipesPreview;
}

async function getRecipePreview(recipe_id) {
  const getRecipe_response = await axios.get(
    `${api_domain}/${recipe_id}/information`,
    {
      params: {
        includeNutrition: false,
        apiKey: process.env.spooncular_apiKey,
      },
    }
  );

  let preview = await extractPreviewFromFullRecipe(getRecipe_response.data);
  return preview;
}

async function getFullRecipeById(recipe_id) {
  const getRecipe_response = await axios.get(
    `${api_domain}/${recipe_id}/information`,
    {
      params: {
        includeNutrition: false,
        apiKey: process.env.spooncular_apiKey,
      },
    }
  );

  return extractFullRecipe(getRecipe_response.data);
}

async function extractPreviewFromFullRecipe(recipe) {
  const {
    id,
    title,
    image,
    readyInMinutes,
    vegan,
    vegetarian,
    glutenFree,
    aggregateLikes,
  } = recipe;

  return {
    id: id,
    title: title,
    image: image,
    readyInMinutes: readyInMinutes,
    vegan: vegan,
    vegetarian: vegetarian,
    glutenFree: glutenFree,
    aggregateLikes: aggregateLikes,
    type:'r'
  };
}

async function extractFullRecipe(recipe) {
  const {
    id,
    title,
    image,
    readyInMinutes,
    vegan,
    vegetarian,
    glutenFree,
    aggregateLikes,
    ingredients,
    extendedIngredients,
    instructions,
    analyzedInstructions,
    servings,
  } = recipe;

  let RelevantextendedIngredientsData = await Promise.all(
    extendedIngredients.map((ingredient_raw) =>
    extractRelevantDataFromIngredient(ingredient_raw)
    )
  );

  let RelevantanalyzedInstructionsData = await Promise.all(
    analyzedInstructions.map((phase) =>
    extractRelevantDataFromInstruction(phase)
    )
  );

  return {
    id: id,
    title: title,
    image: image,
    readyInMinutes: readyInMinutes,
    vegan: vegan,
    vegetarian: vegetarian,
    glutenFree: glutenFree,
    aggregateLikes: aggregateLikes,
    ingredients: ingredients,
    extendedIngredients: RelevantextendedIngredientsData,
    instructions: instructions,
    analyzedInstructions: RelevantanalyzedInstructionsData,
    servings: servings,
    type:'r'
  };
}

async function extractRelevantDataFromIngredient(extendedIngredient) {
  const {
    name,
    originalString,
    amount,
    unit
  } = extendedIngredient;
  return {
    name:name,
    originalString:originalString,
    amount:amount,
    unit:unit
  };
}

async function extractRelevantDataFromInstruction(instruction) {
  const {
    name,
    steps
  } = instruction;

  let RelevantStepsData = await Promise.all(
    steps.map((step) =>
    extractRelevantDataFromStep(step)
    )
  );
  return {
    name:name,
    steps:RelevantStepsData,
  };
}

async function extractRelevantDataFromStep(Astep) {
  const {
    number,
    step
  } = Astep;
  return {
    number:number,
    step:step,
  };
}

async function verifyInstruction(recipe){
  if (recipe && recipe.instructions && recipe.instructions === "") {
    while (recipe.instructions === "") {
      recipe = await replaceRandomRecipe();
    }
  }
  return recipe
}

async function replaceRandomRecipe(){
  const search_response = await axios.get(`${api_domain}/random`, {
    params: {
      number: 1,
      apiKey: process.env.spooncular_apiKey,
    },
  });

  return search_response.data.recipes[0]
}






exports.getRecipePreview = getRecipePreview;
exports.getSearchResults = getSearchResults;
exports.getRandomRecipes = getRandomRecipes;
exports.getFullRecipeById = getFullRecipeById;
