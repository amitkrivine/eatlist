const express = require("express");
const joi = require("joi");
const auth = require("../middlewares/auth");
const Eatlist = require("../models/Eatlist");
const Restaurant = require("../models/Restaurant");
const router = express.Router();

/////////// get all eatlists
router.get("/", auth, async (req, res) => {
    try {
        const eatlists = await Eatlist.find();
        if (!eatlists) return res.status(404).send("Could not find eatlists")
        res.status(200).send(eatlists);

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});

/////////// get ealist by id
router.get("/:id", auth, async (req,res) => {
    try {
        const eatlist = await Eatlist.findById(req.params.id);
        if (!eatlist) return res.status(404).send("Eatlist not found");

        // create array of promises
        let promises = eatlist.restaurants.map((p) => Restaurant.findById(p.restaurantId));

        // promise all
        let result = await Promise.all(promises);
        if (!result) return res.status(400).send("Error in eatlist's restaurants");

        // combine between eatlist.restaurants and result
        let eatlistRestaurants = [];
        for (let i in result) {
        if (result[i])
            eatlistRestaurants.push({
            ...result[i].toObject(),
            ...eatlist.restaurants[i].toObject(),
            });
        };

        // return status and eatlist
        res.status(200).send({ ...eatlist.toObject(), restaurants: eatlistRestaurants });

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});

/////////// create/update eatlists
// schemas
const restaurantsSchema = joi.array().items(joi.object({
    restaurantId: joi.string().required().allow(null, ""),
    userNote: joi.string().allow(null, ""),
    rank: joi.number().required(),
    dateAdded: joi.date().required(),
    _id: joi.string().optional()
}).unknown(true));

const followersSchema = joi.array().items(joi.object({
    userId: joi.string().allow(null, ""),
    _id: joi.string().optional()
}));

const addEatlistSchemaAddCheck = joi.object({
    name: joi.string().required().min(2),
    userId: joi.string(),
    imageUrl: joi.string().allow(null, ""),
    description: joi.string().allow(null, ""),
    isPublic: joi.boolean().required()
});

const updateEatlistSchemaCheck = joi.object({
    name: joi.string().required().min(2),
    userId: joi.string(),
    restaurants: restaurantsSchema.required(),
    imageUrl: joi.string().allow(null, ""),
    description: joi.string().allow(null, ""),
    followers: followersSchema.required(),
    isPublic: joi.boolean().required()
}).unknown(true);

// create an eatlist
router.post("/", auth, async (req, res) => {
    try {
        // joi validation
        const { error } = addEatlistSchemaAddCheck.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        // create new eatlist object
        const eatlist = new Eatlist({...req.body, followers: [], restaurants: [], userId: req.payload._id});
        await eatlist.save();

        // return status and created eatlist
        res.status(201).send(eatlist);

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
})

// update an ealist by id
router.patch("/:id/update", auth, async (req, res) => {
    // allow editing only the user's own eatlists
    const eatlistToUpdate = await Eatlist.findById(req.params.id);
    if (!eatlistToUpdate) return res.status(404).send("Eatlist not found");

    if (eatlistToUpdate.userId != req.payload._id) return res.status(401).send("Access denied");

    // joi validation
    const { error } = updateEatlistSchemaCheck.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // find eatlist and update
    const eatlist = await Eatlist.findOneAndUpdate(
        { _id: req.params.id },
        req.body,
        { new: true }
    );
    if (!eatlist) return res.status(404).send("Eatlist not found");

    // return updated eatlist
    res.status(200).send(eatlist);
});

/////////// follow an eatlist
router.patch("/:id/follow", auth, async (req, res) => {
    try {
        // get eatlist by id
        const eatlist = await Eatlist.findById(req.params.id);
        if (!eatlist) return res.status(404).send("Eatlist not found");

        // check if user already follows the eatlist
        const userId = req.payload._id;
        const index = eatlist.followers.findIndex(
            (follower) => follower.userId?.toString() === userId?.toString()
        );

        if (index === -1) {
            // follow the eatlist
            eatlist.followers.push({ userId: userId });
        } else {
            // unfollow the eatlist
            eatlist.followers.splice(index, 1);
        };

        // save updated eatlist and return it with status
        await eatlist.save({ validateModifiedOnly: true });
        res.status(200).send(eatlist);

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});

/////////// add a restaurant to an eatlist
router.post("/:id/restaurants", auth, async (req, res) => {
    try {
        // allow adding restaurants only to the user's own eatlists
        const eatlistToUpdate = await Eatlist.findById(req.params.id);
        if (!eatlistToUpdate) return res.status(404).send("Eatlist not found");

        if (eatlistToUpdate.userId != req.payload._id) return res.status(401).send("Access denied");

        // check if restaurant is already in the eatlist
        const restaurantId = req.body.restaurantId;
        const restaurantIndex = eatlistToUpdate.restaurants.findIndex(r => r.restaurantId === restaurantId);
        if (restaurantIndex !== -1) return res.status(400).send("Restaurant already in eatlist");
        
        // push new restaurant to eatlist's restaurants array
        eatlistToUpdate.restaurants.push({
            ...req.body,
            rank: eatlistToUpdate.restaurants.length,
            dateAdded: new Date()
        });
        await eatlistToUpdate.save();

        // return updated eatlist
        res.status(200).send(eatlistToUpdate);

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});

/////////// delete an eatlist
router.delete("/:id", auth, async (req, res) => {
    try {
        // check if user is admin
        if (!req.payload.isAdmin) {
            const eatlistToDelete = await Eatlist.findById(req.params.id);
            if (!eatlistToDelete) return res.status(404).send("eatlist not found");

            // if user is not an admin, only allow user who created the eatlist to delete it
            if (eatlistToDelete.userId != req.payload._id) return res.status(401).send("Access denied");
        }

        // delete eatlist
        const deletedEatlist = await Eatlist.findByIdAndDelete(req.params.id);
        if (!deletedEatlist) return res.status(404).send("eatlist not found");

        // return deleted eatlist
        res.status(200).send(deletedEatlist);

    } catch (error) {
        console.log(error);
        res.status(500).send("server error");
    }
});

module.exports = router;