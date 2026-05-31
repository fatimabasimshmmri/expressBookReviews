const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ 
  let usersWithName = users.filter((user) => {
    return users.username === username;
  });
  if (usersWithName >0){return true;}   else {return false;}
}

const authenticatedUser = (username,password)=>{ 
  let validUsers = users.filter((user)=>{
    return (user.username === username && user.password === password);
  });
  if (validUsers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({message: `Invalid credentials`});
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data:password
    }, 'access', { expiresIn : 60*60});

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send(`Login successful`);
  } else {
    return res.status(404).json({message: `Bad login.`});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  if (!req.session.authorization || !req.session.authorization.username){
    return res.status(401).json({message: "Please login first."});
  }
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!review){
    return res.status(400).json({message: "Review content required."});
  }
  if (!books[isbn]){
    return res.status(400).json({message: "No book for this ISBN."});
  }
  if (!books[isbn].reviews) {
  books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({message: `Review succesfully added for ${isbn}`, 
    review: books[isbn].reviews});
});

//delete a review
regd_users.delete("/auth/review/:isbn", (req,res)=>{
  if (!req.session.authorization|| !req.session.authorization.username){
    return res.status(401).json({message: "Please login first."});
  }
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]){
    return res.status(400).json({message: "No book for this ISBN."});
  }
  if (!books[isbn].reviews[username]){
    return res.status(400).json({message: "No review on this ISBN for this user."});
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ 
    message: `Review deleted successfully for ISBN ${isbn}`,
    reviews: books[isbn].reviews
  });

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;