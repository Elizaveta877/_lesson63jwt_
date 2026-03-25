const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';
const app = express();
const users = [];
const PORT = 3000;

app.use(express.json());
app.use (express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(cookieParser());



app.get('/', (req, res) => {
  const currentTheme = req.cookies.theme || 'light';
  res.render('index', { theme: currentTheme });
});

// registration
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

const userExists = users.find(user => user.username === username);
if (userExists) {
  return res.status(400).json({ message: 'Username already exists' });
}
users.push({ username, password });
res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
res.cookie('token', token, { httpOnly: true, secure: false });
res.json({ message: 'Logged in successfully', username: user.username });
});


app.get('/set-theme/:theme', (req, res) => {
  const { theme } = req.params;
  res.cookie('theme', theme, { maxAge: 365 * 24 * 60 * 60 * 1000 });
  res.redirect('/');
});



const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(403).send('Access denied');
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).send('Invalid token');
    }
    req.user = user;
    next();
  });
};

app.get('/dashboard', authenticateJWT, (req, res) => {
  res.json({ message: `Welcome to the dashboard, ${req.user.username}!` });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});