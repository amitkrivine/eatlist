const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
    name: {
        type: {
            main: {
                type: String,
                required: true,
                minLength: 1
            },
            alt: {
                type: String,
            }
        },
        required: true,
    },
    description: {
        type: String,
        required: true,
        minLength: 2,
    },
    phone: {
        type: String,
        match: [/^(?:\+972|0)(?:5\d|7[2-9]|[2-6]|8|9)[-\s]?\d{3}[-\s]?\d{4}$/, "Must use Israeli phone number"]
    },
    address: {
        type: {
            city: {
                type: String,
                required: true,
                minLength: 2,
            },
            street: {
                type: String,
                required: true,
                minLength: 2,
            },
            houseNumber: {
                type: Number,
                required: true,
            },
        },
        required: true,
    },
    urls: {
        type: {
            reservations: {
                type: String,
            },
            website: {
                type: String,
            },
            menu: {
                type: String,
            },
            instagram: {
                type: String,
            }
        },
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
    },
    likes: {
        type: [{
            userId: {
                type: String,
            },
            createdAt: {
                type: Date,
                default: Date.now,
                required: true,
            }
        }],
        required: true
    }
}, {
    timestamps: true
})

const Restaurant = mongoose.model("restaurants", restaurantSchema);

module.exports = Restaurant;