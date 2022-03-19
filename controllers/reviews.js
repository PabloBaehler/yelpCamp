const Campground = require('../models/campground');
const Review = require('../models/review')









module.exports.createReview = async(req,res)=>{
    const {id} = req.params;
    const foundCamp = await Campground.findById(id)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    foundCamp.reviews.push(review);
    review.save();
    foundCamp.save();
    req.flash('success','Successfully posted review!')
    res.redirect(`/campgrounds/${id}`);

}



module.exports.deleteReview = async(req,res)=>{
    const{ id , reviewId } = req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted a review!')
res.redirect(`/campgrounds/${id}`);



}