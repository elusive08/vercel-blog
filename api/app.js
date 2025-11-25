// api/app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Student = require('../models/Student'); // path from api/

const app = express();

// Views + static (note '..' because this file is inside /api)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ---------- MONGOOSE - serverless-friendly connection caching ----------
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Error: MONGO_URI is not set.');
  // Vercel will show the error in logs. You can decide whether to exit.
}

let cached = global.mongoose; // cache across lambda invocations
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = { useNewUrlParser: true, useUnifiedTopology: true };
    cached.promise = mongoose.connect(MONGO_URI, opts).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Connect once (start)
connectDB().then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connect error', err));
// -------------------------------------------------------------------

// Routes (your CRUD routes)
app.get('/', async (req, res) => {
  const students = await Student.find().sort({ createdAt: -1 });
  res.render('index', { students });
});

app.get('/new', (req, res) => res.render('new'));

app.post('/new', async (req, res) => {
  const { name, age, course, photo } = req.body;
  await Student.create({ name, age, course, photo });
  res.redirect('/');
});

app.get('/edit/:id', async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).send('Student not found');
  res.render('edit', { student });
});

app.post('/edit/:id', async (req, res) => {
  const { name, age, course, photo } = req.body;
  await Student.findByIdAndUpdate(req.params.id, { name, age, course, photo }, { runValidators: true });
  res.redirect('/');
});

app.post('/delete/:id', async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

// Export the app for Vercel
module.exports = app;