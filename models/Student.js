const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    course: String,
    photo: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);