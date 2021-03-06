const express = require("express");
const router = express.Router();
const { asyncHandler, handleValidationErrors } = require('../util')

const db = require("../db/models");
const { Tweet } = db;

const { check, validationResult } = require("express-validator");
const tweet = require("../db/models/tweet");

const {requireAuth} = require("../auth");
const app = require("../app");

const validators = [
    check("message")
        .exists({checkFalsy:true})
        .withMessage("Your tweet can't be empty")
        .isLength({max:280})
        .withMessage("Your tweet can't be longer than 280 characters"),
    handleValidationErrors
];

const tweetNotFound = (id) => {
        const err = new Error(`Tweet with the id of ${id}`)
        err.title = "Tweet not found";
        err.status = 404;
        return err
}

router.use(requireAuth)

router.get("/", asyncHandler(async(req, res, next) => {
    const tweets = await Tweet.findAll()
    res.json({ tweets });
}));

router.get("/:id(\\d+)", asyncHandler(async(req, res, next) => {
    const tweetId = await Tweet.findByPk(req.params.id);

    if (!tweetId) {
        next(tweetNotFound(req.params.id))
    } else {
        res.json({ tweetId })
    }
}));

router.post("/", validators, asyncHandler(async(req, res, next) => {
    const { message } = req.body
    try {
        const tweet = await Tweet.create({message});
        if (tweet) {
            res.json({tweet});
        }
    } catch (err) {
        next(err);
    }
}));

router.put("/:id(\\d+)", validators, asyncHandler(async(req, res, next) => {
    const tweet = await Tweet.findByPk(req.params.id);

    if (tweet) {
        const {message} = req.body

        await tweet.update({message})
        res.json({tweet})
    } else {
        next(tweetNotFound(req.params.id))
    }
}));

router.delete("/:id(\\d+)", asyncHandler(async(req, res) => {
    const tweet = await Tweet.findByPk(req.params.id);

    if (tweet) {
        await tweet.destroy()
        res.status(204)
    } else {
        next(tweetNotFound(req.params.id))
    }

    res.redirect("/")
}));

module.exports = router;
