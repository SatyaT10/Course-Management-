const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const enrollementSchema = new Schema({
    course_id: {
        type: Schema.Types.ObjectId,
        ref: 'Course'
    },
    enrollement_id: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }
});

module.exports = mongoose.model('Enrollement', enrollementSchema)