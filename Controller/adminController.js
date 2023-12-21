const userModel=require("../Model/userModel");
const bcrypt=require("bcryptjs");
const Jwt=require('jsonwebtoken');
const bookingModel=require("../Model/bookingModel");
const roomModel=require("../Model/roomModel");
const blogModel=require("../Model/blogModel");
const categoryModel=require("../Model/categoryModel");
const ContactModel = require("../Model/contactModel");

//adminlogin//
const loginadmin=async(req,res)=>{
    try {
        const data = await userModel.findOne({
            email: req.body.email
        })
        if (data) {
            if (data.isVerified == true && data.isAdmin== true) {
                const pwd = data.password;
                if (bcrypt.compareSync(req.body.password, pwd)) {
                    const token = Jwt.sign({
                        _id: data._id,
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        image:data.image
                    
                       }, process.env.SECRET_USER, { expiresIn: "1d" });
                    res.cookie('adminToken', token)
                    res.redirect('/admin/dashboard');
                    console.log(data);
                } else {
                    req.flash('message', "Password Not Match.....")
                    res.redirect('/admin/loginform')
                }
            } else{
                req.flash('message', "User is not admin.....")
                    res.redirect('/admin/loginform')
            }

        }
        else {
            req.flash('message', "Email Not Exist.......")
            res.redirect('/admin/loginform')
        }

    } catch (error) {
        console.log(error);
    }
}

const logoutadmin=(req,res)=>{
    res.clearCookie("adminToken");
    res.redirect("/admin/loginform");
}

//login form//
const adminloginform=(req,res)=>{
    res.render("Admin/adminlogin",{
        message:req.flash("message")
    });
}
 //booking panel//
const bookingpanel=async(req,res)=>{
      const booking=await bookingModel.find().populate("room");
      res.render("Admin/bookingpanel",{
        bookings:booking,
        data:req.admin
      })
}

//room panel//
const roompanel=async(req,res)=>{
    const room=await roomModel.find();
    res.render("Admin/roompanel",{
      rooms:room,
      data:req.admin
    })
}
//blog panel//
const blogpanel=async(req,res)=>{
    const blog=await blogModel.find().populate("author");
    res.render("Admin/blogpanel",{
      blogs:blog,
      data:req.admin
    })
}
//admin dashboard//
const admindashboard=async(req,res)=>{
   
    res.render("Admin/admindashboard",{
      data:req.admin
    })
}

//approve and disapprove//
const approve=async(req,res)=>{
    try{
        const booking=await bookingModel.findById(req.params.id);
        booking.isPending=false;
        await booking.save()
        res.redirect("/admin/bookingpanel")
    }
    catch(error){
       console.log(error);
    }
}

const disapprove=async(req,res)=>{
    try{
        const booking=await bookingModel.findById(req.params.id);
        booking.isPending=true;
        await booking.save();
        res.redirect("/admin/bookingpanel")
    }
    catch(error){
       console.log(error);
    }
}
 //blog add form
const blogaddform=(req,res)=>{
    const messages=req.flash("message")
    res.render("Admin/blogaddform",{
        data:req.admin,
        message:messages
    })
}
//room add form
const roomaddform=async(req,res)=>{
    const categories=await categoryModel.find()
    const messages=req.flash("message")
    res.render("Admin/roomaddform",{
        data:req.admin,
        message:messages,
        category:categories
    })
}


//room create
const roomCreate=async(req,res)=>{
    try{
       const room=new roomModel({
        name:req.body.name,
        bed:req.body.bed,
        bath:req.body.bath,
        price:req.body.price,
        image:req.file.path,
        description:req.body.description,
        categoryid:req.body.categoryid
        
       });
       const output=await room.save();
       res.redirect("/admin/roompanel")
        
    }
    catch(error){
        console.log(error);
        req.flash("message","Error!");
        res.redirect("/admin/roomcreate")
        
    }
}

//***create blog */
const blogCreate=async(req,res)=>{
    try{
        const title=req.body.title;
        console.log(title);
        const Blog=new blogModel({
        title:req.body.title,
        subtitle:req.body.subtitle,
        content:req.body.content,
        author:req.body.author,
        image:req.file.path
       
       })
       
        const output=await Blog.save();
        const user=await userModel.findById(req.body.author);
        user.blogs.push(output._id);
        const result=await user.save();
        console.log(result);
        res.redirect("/admin/blogpanel");
    
    
}
    catch(error){
        console.log(error);
        res.redirect("/admin/blogcreate");
        
    }
}

const blogUpdate=async(req,res)=>{
    try{
        
       blogModel.findById(req.body.blog_id)
       .then((result)=>{
           
            result.title=req.body.title;
            result.subtitle=req.body.subtitle;
            result.content=req.body.content;
            if(req.file){
                result.image=req.file.path;
            }
            result.author=req.body.author;
            
            result.save().then((data)=>{
                console.log(data);
                res.redirect("/admin/blogpanel")
            })
       })
    }
    catch(error){
        console.log(error);
        res.redirect(`/admin/blogedit/${req.body.id}`);
    }
}

const roomUpdate=async(req,res)=>{
    try{
        const name=req.body.name;
        console.log(name);
       roomModel.findById(req.body.id)
       .then((result)=>{
            result.name=req.body.name;
            result.bed=req.body.bed;
            result.bath=req.body.bath;
            if(req.file){
                result.image=req.file.path;
            }
            result.description=req.body.description;
            result.categoryid=req.body.categoryid;
            
            result.save().then((data)=>{
                console.log(data);
                res.redirect("/admin/roompanel")
            })
       })
    }
    catch(error){
        console.log(error);
        req.flash("message","Error!");
        res.redirect(`/admin/roomedit/:id`);
        
    }
}

const blogeditform=async(req,res)=>{
    const messages=req.flash("message");
    const blog=await blogModel.findById(req.params.id)
    res.render("Admin/blogedit",{
        data:req.admin,
        message:messages,
        blogs:blog
    })
}

const roomeditform=async(req,res)=>{
    const messages=req.flash("message");
    const categories=await categoryModel.find();
    const room=await roomModel.findById(req.params.id).populate("categoryid");
    res.render("Admin/roomedit",{
        data:req.admin,
        message:messages,
        rooms:room,
        category:categories
    })
}
const categoryeditform=async(req,res)=>{
    const messages=req.flash("message");
    const category=await categoryModel.findById(req.params.id)
    res.render("Admin/categoryedit",{
        data:req.admin,
        message:messages,
        categories:category
    })
}
const categoryUpdate=async(req,res)=>{
    try{
        const name=req.body.name;
        console.log(name);
       categoryModel.findById(req.body.id)
       .then((result)=>{
            result.name=req.body.name;
            result.bed=req.body.bed;
            result.bath=req.body.bath;
            if(req.file){
                result.image=req.file.path;
            }
            result.description=req.body.description;
            
            
            result.save().then((data)=>{
                console.log(data);
                res.redirect("/admin/categorypanel")
            })
       })
    }
    catch(error){
        console.log(error);
        req.flash("message","Error!");
        res.redirect(`/admin/roomedit/:id`);
        
    }
}


const blogdelete=async(req,res)=>{
    try{
        const result=await blogModel.findByIdAndDelete(req.params.id);
        res.redirect(`/admin/blogpanel`);
    }
    catch(error){
        console.log(error);
        
    }
}
const roomdelete=async(req,res)=>{
    try{
        const result=await roomModel.findByIdAndDelete(req.params.id);
        res.redirect(`/admin/roompanel`);
    }
    catch(error){
        console.log(error);
        
    }
}

const blogactivate=async(req,res)=>{
    try{
        const blog=await blogModel.findById(req.params.id);
        blog.isActivate=true;
        await blog.save()
        res.redirect("/admin/blogpanel")
    }
    catch(error){
       console.log(error);
    }
}

const blogdeactivate=async(req,res)=>{
    try{
        const blog=await blogModel.findById(req.params.id);
        blog.isActivate=false;
        await blog.save()
        res.redirect("/admin/blogpanel")
    }
    catch(error){
       console.log(error);
    }
}



const roomdeactivate=async(req,res)=>{
    try{
        const tour=await roomModel.findById(req.params.id);
        tour.isActivate=false;
        await tour.save()
        res.redirect("/admin/roompanel")
    }
    catch(error){
       console.log(error);
    }
}

const roomactivated=async(req,res)=>{
    try{
        const tours=await roomModel.findById(req.params.id);
        tours.isActivate=true;
        await tours.save();
        res.redirect("/admin/roompanel");
    }
    catch(error){
        console.log(error);
    }
}

const categorypanel=async(req,res)=>{
    const category=await categoryModel.find();
    res.render("Admin/categorypanel",{
      categories:category,
      data:req.admin
    })
}

const categoryaddform=(req,res)=>{
    const messages=req.flash("message")
    res.render("Admin/categoryaddform",{
        data:req.admin,
        message:messages
    })
}

const categoryCreate=async(req,res)=>{
    try{
       const category=new categoryModel({
        name:req.body.name,
        bed:req.body.bed,
        bath:req.body.bath,
        image:req.file.path,
        description:req.body.description,
       });
       const output=await category.save();
       res.redirect("/admin/categorypanel")
        
    }
    catch(error){
        console.log(error);
        req.flash("message","Error!");
        res.redirect("/admin/categorycreate")
        
    }
}

const dashboard=async(req,res)=>{
      const allCategory=await categoryModel.countDocuments();
      const allblog=await blogModel.countDocuments();
      const allrooms=await roomModel.countDocuments();
      
      res.render("Admin/dashboard",{
          Categories:allCategory,
          Blogs:allblog,
          Rooms:allrooms,
          data:req.admin
          
      })
}

const contactPanel=async(req,res)=>{
    const result=await ContactModel.find();
    res.render("Admin/contactPanel",{
        contact:result,
        data:req.admin
    })
    
}

const bookapprove=async(req,res)=>{
    try{
        const booking=await bookingModel.findById(req.params.id);
        booking.isPending=false;
        await booking.save()
        res.redirect("/admin/bookingpanel")
    }
    catch(error){
       console.log(error);
    }
}

const bookdisapprove=async(req,res)=>{
    try{
        const booking=await bookingModel.findById(req.params.id);
        booking.isPending=true;
        await booking.save()
        res.redirect("/admin/bookingpanel")
    }
    catch(error){
       console.log(error);
    }

}

const bookdelete=async(req,res)=>{
    try{
        const booking=await bookingModel.findByIdAndDelete(req.params.id);
        
        res.redirect("/admin/bookingpanel");
    }
    catch(error){
       console.log(error);
    }

}

const contactdelete=async(req,res)=>{
    try{
        const result=await ContactModel.findByIdAndDelete(req.params.id);
        res.redirect(`/admin/contact`);
    }
    catch(error){
        console.log(error);
        
    }
}
const categorydelete=async(req,res)=>{
    try{
        const result=await categoryModel.findByIdAndDelete(req.params.id);
        res.redirect(`/admin/categorypanel`);
    }
    catch(error){
        console.log(error);
        
    }
}
module.exports={
    loginadmin,
    logoutadmin,
    adminloginform,
    bookingpanel,
    approve,
    disapprove,
    blogpanel,
    roompanel,
    admindashboard,
    blogaddform,
    roomaddform,
    roomCreate,
    blogCreate,
    roomUpdate,
    blogUpdate,
    roomeditform,
    blogeditform,
    blogdelete,
    roomdelete,
    blogactivate,
    blogdeactivate,
    roomactivated,
    roomdeactivate,
    categoryCreate,
    categoryaddform,
    categorypanel,
    dashboard,
    contactPanel,
    categoryeditform,
    categoryUpdate,
    bookapprove,
    bookdisapprove,
    bookdelete,
    contactdelete,
    categorydelete
}
