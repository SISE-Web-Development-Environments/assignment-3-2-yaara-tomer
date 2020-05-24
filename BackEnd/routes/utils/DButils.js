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
  return user;//TODO check what returns if not exist
  
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
    req.body.password,
    parseInt(process.env.bcrypt_saltRounds)
  );

  //init userDAta
  let userData = {};

  userData["username"] = body.username;
  userData["firstname"]= body.firstname;
  userData["lastname"]= body.lastname;
  userData["email"]=body.email;
  userData["profilePicture"]=body.profilePicture;
  userData["favoriteRecipes"]={};
  userData["watchedRecipes"]={};

  // add user to DB
  await execQuery(
    `INSERT INTO Users VALUES ('${uuid}','${body.username}','${hash_password}', '${userData}')`
  );
};

async function funcName(param) {

};

process.on("SIGINT", function () {
  if (pool) {
    pool.close(() => console.log("connection pool closed"));
  }
});

exports.getUserByUsername = getUserByUsername;
exports.isUsernameExist = isUsernameExist;
exports.isIDExist = isIDExist;
exports.addUserToDB = addUserToDB;
exports.getUserByID = getUserByID;



