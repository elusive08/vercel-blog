require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Student = require('./models/Student');

// Initialize Express app
const app = express();

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', async (req, res) => {
    const students = await Student.find().sort({ createdAt: -1 });
    res.render('index', { students });
})

app.get('/new', async (req, res) => {
    res.render('new');
});

app.post('/new', async (req, res) => {
    const { name, age, course, photo } = req.body;
    await Student.create({ name, age, course, photo });
    res.redirect('/');
});


// Update route: show edit form
app.get('/edit/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).send('Student not found');
    res.render('edit', { student });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Handle edit form submission (update)
app.post('/edit/:id', async (req, res) => {
  try {
    const { name, age, course, photo } = req.body;
    await Student.findByIdAndUpdate(req.params.id, { name, age, course, photo }, { runValidators: true });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Delete route
app.post('/delete/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});



// server running
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});