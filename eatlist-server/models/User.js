const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: new mongoose.Schema({
            first: {
                type: String,
                minLegth: 2,
                required: true
            },
            last: {
                type: String,
                minLength: 2,
                required: true
            }
        }),
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        match: [/^(?:\+972|0)(?:5\d|7[2-9]|[2-4]|8|9)[-\s]?\d{3}[-\s]?\d{4}$/, "Must use an Israeli phone number"]
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minLength: 5,
    },
    password: {
        type: String,
        required: true,
        match: [/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9].*[0-9].*[0-9].*[0-9])(?=.*[!@#$%^&*_-]).{8,}$/],
    },
    address: {
        type: new mongoose.Schema({
            city: {
                type: String,
            },
            street: {
                type: String,
            },
            houseNumber: {
                type: Number,
            },
        }),
        required: true,
    },
    imageUrl: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        required: true
    }
})


const User = mongoose.model("users", userSchema);

module.exports = User;