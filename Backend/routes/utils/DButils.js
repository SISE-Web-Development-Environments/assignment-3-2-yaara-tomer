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
    enableArithAbort: true
  }
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
};

async function getUserByUsername(username) {
  const user = (
    await execQuery(
      `SELECT * FROM Users WHERE username = '${username}'`
    )
  )[0];  

  return user;  //TODO check what returns if not exist
};

async function getUserByID(id) {
  const user = (
    await execQuery(
    `SELECT * FROM Users WHERE id = '${id}'`
    )
  )[0];

  return user; //TODO check what returns if not exist
  
};

async function isUsernameExist(username) {
  const users = await execQuery("SELECT username FROM Users");
  if (!users.find((x) => x.username === username)){
    return false;
  }
  else{
    return true;
  }

};

async function isIDExist(id) {
  const users = await execQuery("SELECT * FROM Users");
  let user =users.find((x) => x.id === id);
  if (!user){
    return undefined;
  }
  else{
    return x.username;
  }
};

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
};

async function markRecipeAsWatched(recipeID , username) {
  // add recipe to watched list. if already exist, update timestamp
  await execQuery(
    `IF EXISTS(select * from Watched where recipe_id='${recipeID}' and username='${username}')
        update Watched set recipe_id='${recipeID}' where recipe_id='${recipeID}' and username='${username}'
    ELSE
        insert into Watched (recipe_id,username,ts) VALUES ('${recipeID}','${username}',DEFAULT)`
  );
};

async function getlastWatchedRecipes(username){
  return await execQuery(
    `select top 3 recipe_id as id from watched where username='${username}' ORDER BY ts DESC `
  );
};

async function addRecipeToFavorite(username,recipeid){
  await execQuery(
    `INSERT INTO Favorite VALUES ('${recipeid}','${username}')`
    );
};

async function removeRecipeFromFavorite(username,recipeid){
  await execQuery(
    `DELETE FROM Favorite WHERE recipe_id= '${recipeid}' and username ='${username}'`
    );
};

async function getRecipeFavoriteAndWatchedInfo(username,recipe_id){
  let [watched, favorite] = await Promise.all([
    execQuery(
      `SELECT 1 FROM Watched WHERE recipe_id= '${recipe_id}' and username ='${username}'`
    ),
    execQuery(
      `SELECT 1 FROM Favorite WHERE recipe_id= '${recipe_id}' and username ='${username}'`
    )
  ]);
  let recipeInfo={};

  //watched info
  if(watched.length>0)
    recipeInfo.watched=true;
  else
    recipeInfo.watched=false;
  
      //watched info
  if(favorite.length>0)
    recipeInfo.favorite=true;
  else
    recipeInfo.favorite=false;


  return recipeInfo;


}

async function getFavoriteRecipes(username){
  return await execQuery(
    `SELECT recipe_id FROM Favorite WHERE username = '${username}'`
  );
}

process.on("SIGINT", function () {
  if (pool) {
    pool.close(() => console.log("connection pool closed"));
  }
});

exports.getFavoriteRecipes = getFavoriteRecipes;
exports.getUserByUsername = getUserByUsername;
exports.isUsernameExist = isUsernameExist;
exports.isIDExist = isIDExist;
exports.addUserToDB = addUserToDB;
exports.getUserByID = getUserByID;
exports.markRecipeAsWatched = markRecipeAsWatched;
exports.getlastWatchedRecipes = getlastWatchedRecipes;
exports.addRecipeToFavorite = addRecipeToFavorite;
exports.removeRecipeFromFavorite = removeRecipeFromFavorite;
exports.getRecipeFavoriteAndWatchedInfo = getRecipeFavoriteAndWatchedInfo;



