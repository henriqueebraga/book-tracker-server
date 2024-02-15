const express = require('express');
const http = require('http');
const fs = require('fs').promises;
const app = express();
const cors = require('cors');
const data = require('./data.json');
const users = require('./users.json')

const server = http.createServer(app);

const port = process.env.PORT || 4000;

require('dotenv').config();

app.use(cors());
app.use(express.json());

// Get books
app.get('/books', (req, res, next) => {
    res.json(data.books);
});

// Get single book
app.get('/books/:book_id', (req, res) => {
    const { book_id } = req.params;
    const books = data?.books;

    const book = books?.find((book) => book.slug === book_id);

    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ error: 'Book not found' });
    }
});

// Update books
app.post('/books/:book_id', async (req, res, next) => {
    try {
        const { book_id } = req.params;

        const bookIndex = data.books.findIndex((book) => book.slug === book_id);


        if (bookIndex !== -1) {
            const updatedBook = req.body;

            data.books[bookIndex] = { ...data.books[bookIndex], ...updatedBook };
            await fs.writeFile('./data.json', JSON.stringify(data, null, 2));

            res.json({ message: 'Book updated successfully', updatedBook });
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Authentication
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    const usersCredentials = users?.users;
    const user = usersCredentials?.find((user) => user.email === username && user.password === password);
  
    if (user) {
      res.status(200).json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  });


// Create User
app.post('/register', async (req, res, next) => {
    try {
        const { firstName, lastName, email, dob, password } = req.body;
        const emailExists = users.users.some(user => user.email === email);
        if (emailExists) {
            return res.status(400).json({ error: 'Email is already taken' });
        }
        const newUser = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            dob,
            password
        };
        users.users.push(newUser)
        await fs.writeFile('./users.json', JSON.stringify(users, null, 2));
        res.json({ message: 'Registered successfully', newUser });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



server.listen(port, () => console.log(`Listening on port ${port}`));
