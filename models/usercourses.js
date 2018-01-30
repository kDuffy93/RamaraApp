

let mongoose = require('mongoose');

// create book schema (class)
var userCoursesSchema = new mongoose.Schema({
    userid: {
        type: String,
        required: 'User is null; error'
    },
     coursename: {
      type: String,
        required: 'Course name is missing. Please select one.'
    },
     expiry: {
      type: Date,
        required: 'expiry is missing. Please enter one.'
    }
});

// make it public
module.exports = mongoose.model('userCourses', userCoursesSchema);