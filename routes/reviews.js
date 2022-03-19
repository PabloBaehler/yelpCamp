const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync=require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');
const Campground=require('../models/campground');
const Review = require('../models/review'); 
const {campgroundSchema,reviewSchema} = require('../schemas');
const {validateReview, isLoggedIn,isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');







router.post('/',isLoggedIn ,validateReview,catchAsync(reviews.createReview))


/* app.get('/makecampground',async (req,res)=>{
    const camp= new Campground({title:'My Backyard',description:'cheap camping!'});
    await camp.save();
    res.send(camp)
}) */
router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(reviews.deleteReview))


module.exports = router;