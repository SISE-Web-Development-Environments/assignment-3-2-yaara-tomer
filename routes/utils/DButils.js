require("dotenv").config();
const sql = require("mssql");
const bcrypt = require("bcrypt");
const { v1: uuidv1 } = require("uuid");
const config = {
  user: process.env.tedious_userName,
  password: process.env.tedious_password,
  server: process.env.tedious_server,
  database: process.env.tedious_database,
  connectionTimeout: 1500000,
  options: {
    encrypt: true,
    enableArithAbort: true,
  },
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool
  .connect()
  .then(() => console.log("new connection pool Created"))
  .catch((err) => console.log(err));

async function execQuery(query) {
  //console.log(query);
  await poolConnect;
  try {
    var result = await pool.request().query(query);
    return result.recordset;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
}

async function getUserByUsername(username) {
  const user = (
    await execQuery(`SELECT * FROM Users WHERE username = '${username}'`)
  )[0];

  return user; //TODO check what returns if not exist
}

async function getUserByID(id) {
  const user = (await execQuery(`SELECT * FROM Users WHERE id = '${id}'`))[0];

  return user; //TODO check what returns if not exist
}

async function isUsernameExist(username) {
  const users = await execQuery("SELECT username FROM Users");
  if (!users.find((x) => x.username === username)) {
    return false;
  } else {
    return true;
  }
}

async function isIDExist(id) {
  const users = await execQuery("SELECT * FROM Users");
  let user = users.find((x) => x.id === id);
  if (!user) {
    return undefined;
  } else {
    return x.username;
  }
}

async function addUserToDB(body) {
  //generate user id
  let uuid = uuidv1();

  //hash password
  let hash_password = bcrypt.hashSync(
    body.password,
    parseInt(process.env.bcrypt_saltRounds)
  );

  // add user to DB
  await execQuery(
    `INSERT INTO Users VALUES ('${uuid}','${body.username}','${hash_password}', '${body.firstname}', '${body.lastname}','${body.email}','${body.profilePicture}','${body.country}')`
  );
}

async function markRecipeAsWatched(recipeID, username, type) {
  // add recipe to watched list. if already exist, update timestamp
  await execQuery(
    `IF EXISTS(select * from Watched where recipe_id='${recipeID}' and username='${username}')
        update Watched set recipe_id='${recipeID}' where recipe_id='${recipeID}' and username='${username}'
    ELSE
        insert into Watched (recipe_id,username,ts,recipe_type) VALUES ('${recipeID}','${username}',DEFAULT,'${type}')`
  );
}

async function getlastWatchedRecipesIDs(username) {
  return await execQuery(
    `select top 3 recipe_id as id ,recipe_type as 'type'
     from watched where username='${username}' ORDER BY ts DESC `
  );
}

async function addRecipeToFavorite(username, recipeid) {
  await execQuery(`INSERT INTO Favorite VALUES ('${recipeid}','${username}')`);
}

async function removeRecipeFromFavorite(username, recipeid) {
  await execQuery(
    `DELETE FROM Favorite WHERE recipe_id= '${recipeid}' and username ='${username}'`
  );
}

async function getRecipeFavoriteAndWatchedInfo(username, recipe_id) {
  let [watched, favorite] = await Promise.all([
    execQuery(
      `SELECT 1 FROM Watched WHERE recipe_id= '${recipe_id}' and username ='${username}'`
    ),
    execQuery(
      `SELECT 1 FROM Favorite WHERE recipe_id= '${recipe_id}' and username ='${username}'`
    ),
  ]);
  let recipeInfo = {};

  //watched info
  if (watched.length > 0) recipeInfo.watched = true;
  else recipeInfo.watched = false;

  //watched info
  if (favorite.length > 0) recipeInfo.favorite = true;
  else recipeInfo.favorite = false;

  return recipeInfo;
}

async function getFavoriteRecipesID(username) {
  return await execQuery(
    `SELECT recipe_id FROM Favorite WHERE username = '${username}'`
  );
}

async function addPersonalRecipeToDB(personalRecipe, username) {
  //generate recipe id
  let uuid = uuidv1();

  //stringify recipe data
  let recipeAsString = JSON.stringify(personalRecipe);

  // add recipe to DB
  await execQuery(
    `INSERT INTO PersonalRecipes VALUES ('${uuid}','${username}','${recipeAsString}')`
  );
}

async function getPersonalRecipeByID(personalRecipe_id) {
  let getRecipe_response = await execQuery(
    `SELECT * FROM PersonalRecipes WHERE id = '${personalRecipe_id}'`
  );
  return getRecipe_response[0];
}

async function getFamilyRecipeByID(familyRecipe_id) {
  let getRecipe_response = await execQuery(
    `SELECT * FROM FamilyRecipes WHERE id = '${familyRecipe_id}'`
  );
  return getRecipe_response[0];
}

async function getPersonalRecipePreviewByID(personalRecipe_id) {
  let getRecipe_response = await execQuery(
    `SELECT * FROM PersonalRecipes WHERE id = '${personalRecipe_id}'`
  );
  let preview = await extractPreviewFromFullRecipe(getRecipe_response[0]);
  preview.type = "p";
  return preview;
}

async function getFamilyRecipePreviewByID(familyRecipe_id) {
  let getRecipe_response = await execQuery(
    `SELECT * FROM FamilyRecipes WHERE id = '${familyRecipe_id}'`
  );
  let preview = await extractPreviewFromFullRecipe(getRecipe_response[0]);
  preview.type = "f";
  return preview;
}

async function getAllPersonalRecipesPreview(username) {
  let getPersonalRecipe_response = await execQuery(
    `SELECT * FROM PersonalRecipes WHERE username = '${username}'`
  );

  //extract only preview data for each result
  getPersonalRecipe_response = await Promise.all(
    getPersonalRecipe_response.map((personalRecipe) =>
      extractPreviewFromFullRecipe(personalRecipe)
    )
  );
  return getPersonalRecipe_response;
}

async function getAllFamilyRecipesPreview(username) {
  let getFamilyRecipe_response = await execQuery(
    `SELECT * FROM FamilyRecipes WHERE username = '${username}'`
  );

  //extract only preview data for each result
  getFamilyRecipe_response = await Promise.all(
    getFamilyRecipe_response.map((familyRecipe) =>
      extractPreviewFromFullRecipe(familyRecipe)
    )
  );
  return getFamilyRecipe_response;
}

async function extractPreviewFromFullRecipe(recipe) {
  const {
    title,
    image,
    readyInMinutes,
    vegan,
    vegetarian,
    glutenFree,
  } = JSON.parse(recipe.recipeData);

  return {
    id: recipe.id,
    title: title,
    image: image,
    readyInMinutes: readyInMinutes,
    vegan: vegan,
    vegetarian: vegetarian,
    glutenFree: glutenFree,
    aggregateLikes: 0,
  };
}

process.on("SIGINT", function () {
  if (pool) {
    pool.close(() => console.log("connection pool closed"));
  }
});

exports.getAllPersonalRecipesPreview = getAllPersonalRecipesPreview;
exports.getAllFamilyRecipesPreview = getAllFamilyRecipesPreview;
exports.getFamilyRecipeByID = getFamilyRecipeByID;
exports.addPersonalRecipeToDB = addPersonalRecipeToDB;
exports.getPersonalRecipeByID = getPersonalRecipeByID;
exports.getFavoriteRecipesID = getFavoriteRecipesID;
exports.getUserByUsername = getUserByUsername;
exports.isUsernameExist = isUsernameExist;
exports.isIDExist = isIDExist;
exports.addUserToDB = addUserToDB;
exports.getUserByID = getUserByID;
exports.markRecipeAsWatched = markRecipeAsWatched;
exports.getlastWatchedRecipesIDs = getlastWatchedRecipesIDs;
exports.addRecipeToFavorite = addRecipeToFavorite;
exports.removeRecipeFromFavorite = removeRecipeFromFavorite;
exports.getRecipeFavoriteAndWatchedInfo = getRecipeFavoriteAndWatchedInfo;
exports.getPersonalRecipePreviewByID = getPersonalRecipePreviewByID;
exports.getFamilyRecipePreviewByID = getFamilyRecipePreviewByID;
