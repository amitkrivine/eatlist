const express = require("express");
const joi = require("joi");
const auth = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

//////////////// register
///////// register schema
// name
const nameSchema = joi.object({
    first: joi.string().min(2).required(),
    last: joi.string().min(2).required()
});

// address
const addressSchema = joi.object({
    city: joi.string().allow(null, ""),
    street: joi.string().allow(null, ""),
    houseNumber: joi.number().allow(null)
});

/// combined user
const checkUserBody = joi.object({
    name: nameSchema.required(),
    phone: joi.string().required().regex(/^(?:\+972|0)(?:5\d|7[2-9]|[2-4]|8|9)[-\s]?\d{3}[-\s]?\d{4}$/),
    email: joi.string().email().required().min(5),
    password: joi.string().required().regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9].*[0-9].*[0-9].*[0-9])(?=.*[!@#$%^&*_-]).{8,}$/),
    address: addressSchema.required(),
    imageUrl: joi.string().allow(null, "")
});

// update user
const checkUpdateUserBody = joi.object({
    name: nameSchema.required(),
    phone: joi.string().required().regex(/^(?:\+972|0)(?:5\d|7[2-9]|[2-4]|8|9)[-\s]?\d{3}[-\s]?\d{4}$/),
    email: joi.string().email().required().min(5),
    password: joi.string().optional().regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9].*[0-9].*[0-9].*[0-9])(?=.*[!@#$%^&*_-]).{8,}$/),
    address: addressSchema.required(),
    imageUrl: joi.string().allow(null, "")
});

///////// register request
router.post("/", async (req, res) => {
    try {
        // joi validation
        const { error } = checkUserBody.validate(req.body);
        if (error) return res.status(400).send(error);

        // check if user exists
        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send("User already exists");

        // create new user object
        user = new User({...req.body, isAdmin: false});

        // encrypt password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt)

        await user.save();

        // create token
        const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin, isBusiness: user.isBusiness }, process.env.JWTKEY);

        // return token and status (unspecified in project requirements)
        res.status(201).send(token);

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});


//////////////// login
///////// login schema
const checkLoginBody = joi.object({
    email: joi.string().email().min(6).required(),
    password: joi.string().required().regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9].*[0-9].*[0-9].*[0-9])(?=.*[!@#$%^&*_-]).{8,}$/)
});

///////// login request
router.post("/login", async (req, res) => {
    try {
        // joi validation
        const { error } = checkLoginBody.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // check if user exists
        let user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send("Wrong email or password");

        // compare password
        const result = await bcrypt.compare(req.body.password, user.password);
        if (!result) return res.status(400).send("Wrong email or password");

        // create token
        const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin, isBusiness: user.isBusiness }, process.env.JWTKEY);

        // return token and status to client
        res.status(200).send(token);

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});


//////////////// get all users
router.get("/", auth, async (req, res) => {
    try {
        // check if user is admin
        if (!req.payload.isAdmin) return res.status(403).send("Access denied");

        // get users from DB
        const users = await User.find();

        // return status and users to client
        res.status(200).send(users)

    } catch (error) {
        console.log(error);
        res.status(500).send("server error")
    }
});

//////////////// get user by id
router.get("/:id", auth, async (req,res) => {
    try {
        let user = await User.findById(req.params.id);
        res.status(200).send(user);
        
    } catch (error) {
        console.log(error);
        res.status(500).send("server error")
    }
})

//////////////// update user by id
router.put("/:id", auth, async (req, res) => {
    try {
        // check if user is admin
        // if not, allow user to update only his own details
        const isAdmin = req.payload.isAdmin;
        const isSelf = (req.payload._id.toString() === req.params.id);

        if (!isAdmin && !isSelf) {
            return res.status(403).send("Access denied");
        }

        // joi validation
        const { error } = checkUpdateUserBody.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // find and update user
        const user = await User.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        );
        if (!user) return res.status(404).send("User not found");

        // return updated user
        res.status(200).send(user);

    } catch (error) {
        console.log(error);
    }
});

//////////////// delete user by id
router.delete("/:id", auth, async (req, res) => {
    try {
        // check if user is admin
        if (!req.payload.isAdmin) {
            return res.status(403).send("Access denied");
        }

        // find and delete user
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send("User not found");

        // return deleted user
        res.status(200).send(user);
        
    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});

module.exports = router;