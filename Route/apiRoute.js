const express=require('express');
const Route=express.Router();
const apiControll=require("../Controller/apiController");
const bannerimage=require("../Utility/bannerimage");
const authverify=require("../Middleware/authverify");
//register and login//
Route.post("/createuser",bannerimage.single("image"),apiControll.regcreate);
Route.get("/confirmation/:email/:token",apiControll.confirmation);

// Route.post("/register",apiControll.register);
Route.post("/login",apiControll.login);

//room,blogs,category//
Route.post("/review",authverify,apiControll.review);
Route.get("/roomsbycategory/:id",apiControll.getRoomsByCategory);
Route.get("/allcategory",apiControll.allCategory);
Route.get("/allblog",apiControll.allBlogs);
Route.get("/blog/:id",apiControll.getBlogById);
Route.get("/room/:id",apiControll.getRoomDetailsById);
Route.post("/comment",authverify,apiControll.commentCreateBlog);
Route.post("/book",authverify,apiControll.roomBooking);
Route.get("/commentsbyid/:id",apiControll.commentbyBlogId);
Route.get("/reviewofrooms/:id",apiControll.reviewofrooms);
Route.post("/contact",apiControll.CreateContact);
Route.get("/bookings/:id",apiControll.bookingbyusers)
module.exports=Route;

