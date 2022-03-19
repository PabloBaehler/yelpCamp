const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;

const geocoder = mbxGeocoding({accessToken:mapBoxToken});





module.exports.index = async (req,res)=>{
    const campgrounds= await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
    
    }


module.exports.renderNewForm = (req,res)=>{
    res.render('campgrounds/new');}


module.exports.createCampground = async(req,res,next)=>{
    const geoData = await geocoder.forwardGeocode({
        query:req.body.campgroundaaaaaaa.location,
        limit:1
    }).send();
   
    const campground = new Campground(req.body.campgroundaaaaaaa);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f=>({url:f.path,filename:f.filename}));
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success','Campground created!')
    res.redirect(`/campgrounds/${campground._id}`);
    }


module.exports.showCampground = async (req,res)=>{
    const {id}=req.params;
    const foundCamp= await (await Campground.findById(id).populate({path:'reviews',populate:{
        path:'author'
    }})).populate('author');
    
    if (!foundCamp){
        req.flash('error','Can´t find campground')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show',{foundCamp})
}


module.exports.renderEditForm = async (req,res)=>{
    const {id}=req.params;
    const foundCamp= await Campground.findById(id);
    if (!foundCamp){
        req.flash('error','Can´t find campground')
        return res.redirect('/campgrounds')
    }
    
    res.render('campgrounds/edit',{foundCamp})
}

module.exports.updateCampground = async (req,res)=>{
    const {id}=req.params;
    const foundCamp = await Campground.findByIdAndUpdate(id,{...req.body.campgroundaaaaaaa},{new:true})
    const imgs =  req.files.map(f=>({url:f.path,filename:f.filename}));
    foundCamp.images.push(...imgs);
    if (req.body.deleteImages){
        for(let filename of req.body.deleteImages){
          await cloudinary.uploader.destroy(filename);  
        }
    await foundCamp.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }



    await foundCamp.save();
    req.flash('success','Successfully updated!')
    res.redirect(`/campgrounds/${foundCamp.id}`)
}



module.exports.deleteCampground = async (req,res)=>{
    const {id}=req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    
    await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully deleted a campground!')
    res.redirect('/campgrounds');
}