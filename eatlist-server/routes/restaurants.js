const express = require("express");
const joi = require("joi");
const auth = require("../middlewares/auth");
const Restaurant = require("../models/Restaurant");
const router = express.Router();

/////////// get all restaurants
router.get("/", async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).send(restaurants);

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});


/////////// get restaurant by id
router.get("/:id", async (req,res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).send("Restaurant not found");
        res.status(200).send(restaurant);

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});


/////////// add/update restaurant
// schemas
const nameSchema = joi.object({
    main: joi.string().min(2).required(),
    alt: joi.string().allow(null, "")
});

const addressSchema = joi.object({
    city: joi.string().required().min(2),
    street: joi.string().required().min(2),
    houseNumber: joi.number().required()
});

const urlsSchema = joi.object({
    reservations: joi.string().allow(null, ""),
    website: joi.string().allow(null, ""),
    menu: joi.string().allow(null, ""),
    instagram: joi.string().allow(null, "") 
});

const restaurantSchemaCheck = joi.object({
    name: nameSchema.required(),
    description: joi.string().required().min(2),
    phone: joi.string().regex(/^(?:\+972|0)(?:5\d|7[2-9]|[2-6]|8|9)[-\s]?\d{3}[-\s]?\d{4}$/, "Must use Israeli phone number").allow(""),
    address: addressSchema.required(),
    urls: urlsSchema.required(),
    imageUrl: joi.string().allow(null, ""),
    genre: joi.string().required().min(2),
});

// add restaurant
router.post("/", auth, async (req, res) => {
    try {
        // validate user is admin
        if (!req.payload.isAdmin) return res.status(401).send("Access denied");

        // joi validation
        const { error } = restaurantSchemaCheck.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // create new restaurant object
        const restaurant = new Restaurant({...req.body, likes: []});
        await restaurant.save();

        // return status and created restaurant
        res.status(201).send(restaurant);

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});

// update restaurant
router.put("/:id", auth, async (req, res) => {
    // validate user is admin
    if (!req.payload.isAdmin) return res.status(401).send("Access denied");

    // joi validation
    const { error } = restaurantSchemaCheck.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // find restaurant and update
    const restaurant = await Restaurant.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
    );
    if (!restaurant) return res.status(404).send("Restaurant not found");

    // return updated restaurant
    res.status(200).send(restaurant);
});

/////////// like a restaurant
router.patch("/:id", auth, async (req, res) => {
    try {
        // get restaurant by id
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).send("restaurant not found");

        // check if user already likes the restaurant
        const userId = req.payload._id;
        const index = restaurant.likes.findIndex((like) => like.userId === userId);

        if (index === -1) {
            // like the restaurant
            restaurant.likes.push({ userId: userId });
        } else {
            // unlike the restaurant
            restaurant.likes.splice(index, 1);
        };

        // save updated restaurant and return it with status
        await restaurant.save({ validateModifiedOnly: true });
        res.status(200).send(restaurant);

    } catch (error) {
        console.log(error);
        console.log("PATCH error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        res.status(500).send("server error");
    }
});

//////////////// delete restaurant
router.delete("/:id", auth, async (req, res) => {
    try {
        // validate user is admin
        if (!req.payload.isAdmin) return res.status(401).send("Access denied");

        // delete card
        const deletedRestaurant = await Restaurant.findByIdAndDelete(req.params.id);
        if (!deletedRestaurant) return res.status(404).send("restaurant not found");

        // return deleted card
        res.status(200).send(deletedRestaurant);

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});

module.exports = router;