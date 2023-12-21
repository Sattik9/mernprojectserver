const express=require("express");
const adminRouter=express.Router();
const adminController=require("../Controller/adminController");
const adminverify=require("../Middleware/adminverify");
const bannerImage=require("../Utility/bannerimage");

//admin logins//
adminRouter.get("/loginform",adminController.adminloginform);
adminRouter.post("/login",adminController.loginadmin);
adminRouter.get("/logout",adminController.logoutadmin);

//admin panel//
//panels//
adminRouter.get("/bookingpanel",adminverify,adminController.bookingpanel);
adminRouter.get("/blogpanel",adminverify,adminController.blogpanel);
adminRouter.get("/roompanel",adminverify,adminController.roompanel);
adminRouter.get("/categorypanel",adminverify,adminController.categorypanel);
adminRouter.get("/admindashboard",adminverify,adminController.admindashboard);
adminRouter.get("/dashboard",adminverify,adminController.dashboard);
adminRouter.get("/contact",adminverify,adminController.contactPanel);


//create operations//
adminRouter.get("/blogcreate",adminverify,adminController.blogaddform);
adminRouter.get("/roomcreate",adminverify,adminController.roomaddform);
adminRouter.get("/categorycreate",adminverify,adminController.categoryaddform);
adminRouter.post("/roomcreation",bannerImage.single("image"),adminController.roomCreate);
adminRouter.post("/blogcreation",bannerImage.single("image"),adminController.blogCreate);
adminRouter.post("/categorycreation",bannerImage.single("image"),adminController.categoryCreate);


//update operations//
adminRouter.get("/blogedit/:id",adminverify,adminController.blogeditform);
adminRouter.get("/roomedit/:id",adminverify,adminController.roomeditform);
adminRouter.post("/blogupdate",bannerImage.single("image"),adminController.blogUpdate);
adminRouter.post("/roomupdate",bannerImage.single("image"),adminController.roomUpdate);
adminRouter.get("/blogedit/:id",adminverify,adminController.blogeditform);
adminRouter.get("/roomedit/:id",adminverify,adminController.roomeditform);
adminRouter.post("/blogupdate",bannerImage.single("image"),adminController.blogUpdate);
adminRouter.post("/categoryupdate",bannerImage.single("image"),adminController.categoryUpdate);
adminRouter.get("/categoryedit/:id",adminverify,adminController.categoryeditform);

//approve and disapprove//
adminRouter.get("/approve/:id",adminverify,adminController.approve);
adminRouter.get("/disapprove/:id",adminverify,adminController.disapprove);
adminRouter.get("/bookapprove/:id",adminverify,adminController.bookapprove);
adminRouter.get("/bookdisapprove/:id",adminverify,adminController.bookdisapprove);

//delete operations//
adminRouter.get("/roomdelete/:id",adminverify,adminController.roomdelete);
adminRouter.get("/blogdelete/:id",adminverify,adminController.blogdelete);
adminRouter.get("/bookdelete/:id",adminverify,adminController.bookdelete);
adminRouter.get("/contactdelete/:id",adminverify,adminController.contactdelete);
adminRouter.get("/categorydelete/:id",adminverify,adminController.categorydelete);
//activate and deactivate//
adminRouter.get("/blogactivate/:id",adminverify,adminController.blogactivate);
adminRouter.get("/blogdeactivate/:id",adminverify,adminController.blogdeactivate);
adminRouter.get("/roomdeactivate/:id",adminverify,adminController.roomdeactivate);
adminRouter.get("/roomactivated/:id",adminverify,adminController.roomactivated);
// adminRouter.get("/logout",adminverify,adminController.logoutadmin);

module.exports=adminRouter;
