const mongoose = require("mongoose");

const eatlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 2,
    },
    userId: {
        type: String,
        required: true,
        minLength: 6,
    },
    restaurants: {
        type: [{
            restaurantId: {
                type: String,
                required: true,
            },
            userNote: {
                type: String,
            },
            rank: {
                type: Number,
                required: true,
            },
            dateAdded: {
                type: Date,
                required: true
            }
        }],
        default: [],
        required: true,
    },
    imageUrl: {
        type: String,
    },
    description: {
        type: String,
    },
    followers: {
        type: [{
            userId: {
                type: String,
            }
        }],
        default: [],
        required: true
    },
    isPublic: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
})

const Eatlist = mongoose.model("eatlists", eatlistSchema);


module.exports = Eatlist;