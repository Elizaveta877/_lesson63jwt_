const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  const currentTheme = req.cookies.theme || 'light';
  res.render('index', { theme: currentTheme });
});

app.get('/set-theme/:theme', (req, res) => {
  const { theme } = req.params;
  res.cookie('theme', theme, {maxAge: 365 * 24 *60 *60 *1000});
  res.redirect('/');
});

app.post('/login', (req, res) => {
  const user = {id: 1, username: 'Yelyzaveta'};
  const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true,secure: false });
  res.json({ message: 'Logged in successfully' });

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

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});