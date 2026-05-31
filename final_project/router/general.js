const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const axios = require('axios');
public_users.post("/register", async (req,res) => {
  const {username, password} = req.body;
  try {
      if (!username || !password){
        return res.status(400).json({error: 'Username and password required.'});
      }
      const userExist = users.some(user => user.username === username);
      if (userExist) {
        return res.status(400).json({error: 'Username already exists'});
      }
      const newUser = await {username, password};
      users.push(newUser);
      res.status(200).json({message: `User added successfully.`});
      }
  catch (error) {
      return res.status(500).json({error: 'Internal server error'});
      }
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try 
  {res.status(200).send(JSON.stringify(books));}
  catch (error)
  {res.status(500).send("Internal server error.");}
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  let ISBN = req.params.isbn;
    try {
          if (ISBN){
          res.status(200).send(JSON.stringify(books[ISBN]));
        }else{
          res.status(404).send(`Bad ISBN. Does not exist.`);
        }
  }
  catch (error){
    res.status(500).send("Internal server error.");
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    let author = req.params.author;
    if (author){
      res.status(200).send(JSON.stringify(books[author]));
    }else{
      res.status(404).send(`Bad ISBN. Does not exist.`);
    }
  }
  catch (error){
    res.status(500).send("Internal server error.");
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    let title = req.params.title;
    if (title){
      res.status(200).send(JSON.stringify(books[title]));
    }else{
      res.status(404).send(`Bad ISBN. Does not exist.`);
    }
  }
  catch (error){
    res.status(500).send("Internal server error.");
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let ISBN = req.params.isbn;
  let book = books[ISBN];
  if (book && book.reviews){
    res.status(200).send(JSON.stringify(book.reviews));
  }else{
    res.status(404).send(`Bad ISBN. Does not exist.`);
  }
});

module.exports.general = public_users;
