const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovieSchema = new Schema({
    title: String,
    genre: String,
    cast: String,
    director: String,
    description: String,
    image: String,
    review: String,
    author:{
            type: Schema.Types.ObjectId,
            ref: 'User'
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
})

module.exports = mongoose.model('Movie',MovieSchema)