const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
function getBaseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

public_users.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required.' });
    }
    const userExist = users.some(user => user.username === username);
    if (userExist) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const newUser = { username, password };
    users.push(newUser);
    res.status(200).json({ message: `User added successfully.` });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all books
public_users.get('/', async function (req, res) {
  try {
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Get book by ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const baseUrl = getBaseUrl(req);
    const response = await axios.get(`${baseUrl}/`);
    const allBooks = response.data;
    const book = allBooks[isbn];
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ error: "Bad ISBN. Does not exist." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Get books by author
public_users.get('/author/:author', async function (req, res) {
  const authorName = req.params.author;
  try {
    const baseUrl = getBaseUrl(req);
    const response = await axios.get(`${baseUrl}/`);
    const allBooks = response.data;
    const matching = [];
    for (let isbn in allBooks) {
      if (allBooks[isbn].author.toLowerCase() === authorName.toLowerCase()) {
        matching.push({ isbn, ...allBooks[isbn] });
      }
    }
    if (matching.length > 0) {
      res.status(200).json(matching);
    } else {
      res.status(404).json({ error: "No books found for this author." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Get books by title
public_users.get('/title/:title', async function (req, res) {
  const titleName = req.params.title;
  try {
    const baseUrl = getBaseUrl(req);
    const response = await axios.get(`${baseUrl}/`);
    const allBooks = response.data;
    const matching = [];
    for (let isbn in allBooks) {
      if (allBooks[isbn].title.toLowerCase() === titleName.toLowerCase()) {
        matching.push({ isbn, ...allBooks[isbn] });
      }
    }
    if (matching.length > 0) {
      res.status(200).json(matching);
    } else {
      res.status(404).json({ error: "No books found with this title." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

// Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const baseUrl = getBaseUrl(req);
    const response = await axios.get(`${baseUrl}/`);
    const book = response.data[isbn];
    if (book && book.reviews) {
      res.status(200).json(book.reviews);
    } else {
      res.status(404).json({ error: "Bad ISBN or no reviews." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports.general = public_users;