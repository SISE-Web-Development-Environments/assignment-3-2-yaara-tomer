var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const bcrypt = require("bcrypt");
const { v1: uuidv1 } = require("uuid");



router.post("/register", async (req, res, next) => {
  try {
    // TODO
    // parameters exists
    // valid parameters

    // username exists
    if (await DButils.isUsernameExist(req.body.username))
      throw { status: 409, message: "Username taken" };

    //add new user to db
    await DButils.addUserToDB(req.body);

    res.status(201).send({ message: "user created", success: true });
    //res.redirect("/auth/login");

  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    // check that username exists
    if (!DButils.isUsernameExist(req.body.username))
      throw { status: 401, message: "Username or Password incorrect" };

    //get user from DB
    const user = await DButils.getUserByUsername(req.body.username);  
    
    // check that the password is correct
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.id = user.id;

    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", function (req, res, next) {
  try{
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
  } catch(error){
    next(error);
  }
});

module.exports = router;
