const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const courseSchema = new Schema({
    courseMentor_id: {
        type: Schema.Types.ObjectId,
        ref: 'Mentor'
    },
    course_Name: {
        type: String,
    },
    course_Price: {
        type: Number,
        default: 0
    },
    about_Content: {
        type: String,
    }
});


module.exports = mongoose.model('Course', courseSchema);