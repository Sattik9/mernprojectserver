const userModel=require("../Model/userModel");
const bcrypt=require('bcryptjs');
const tokenModel=require("../Model/tokenModel");
const nodemailer=require('nodemailer');
const crypto=require('crypto');
const reviewModel = require("../Model/reviewModel");
const roomModel=require("../Model/roomModel");
const categoryModel=require("../Model/categoryModel");
const blogModel = require("../Model/blogModel");
const commentModel = require("../Model/commentModel");
const bookingModel = require("../Model/bookingModel");
const ContactModel=require("../Model/contactModel");
const jwt=require('jsonwebtoken');


const regcreate=async(req,res)=>{
    try{
       const User=new userModel({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        image:req.file.path,
        password:bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(12)),
        answer:req.body.answer
       })
       const data=await userModel.findOne({email:req.body.email});
       if(!req.body.name||!req.body.email||!req.body.phone||!req.body.password||!req.body.answer){
        return res.status(400).json({
            success:false,
            message:"all fields are required!",
           
        })
       }else{
          if(data){
            return res.status(400).json({
                success:false,
                message:"user already exists!"
               
            })
          }else{
            User.save()
            .then((user)=>{
                console.log(user._id);
               const Token=new tokenModel({
                _userId:user._id,
                token:crypto.randomBytes(16).toString('hex')
               })
               Token.save()
               .then((token)=>{
                const transPorter=nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    requireTLS: true,
                    auth:{
                         user:"sttksarkar5261@gmail.com",
                         pass:"pgfhifvnazrlkbiq",
                        }
                })
                const mailOptions={
                    from: 'no-reply@sattik.com',
                    to: user.email,
                    subject: 'Account Verification',
                    text: 'Hello ' + req.body.name + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n'
                }
                transPorter.sendMail(mailOptions);
                return res.status(200).json({
                    success:true,
                    message:"verification link sent!",
                    user
                })
               })
               .catch((error)=>{
                return res.status(400).json({
                    success:false,
                    message:"token save error!"
                })
               })
            })
            .catch((error)=>{
                return res.status(400).json({
                    success:false,
                    message:error
                })
            })
          }
       }
    }
    catch(error){
        console.log(error);
         return res.status(400).json({
            success:false,
            message:"error"
         })
    }
}


const confirmation=async(req,res)=>{
    try{
      const token=await tokenModel.findOne({token:req.params.token});
      if(token){
         userModel.findOne({_id:token._userId,email:req.params.email})
         .then((user)=>{
            if(!user){
                return res.status(400).json({
                    success:false,
                    message:"user doesnt exist!"
                })
            }else{
                if(user.isVerified==true){
                    return res.status(400).json({
                        success:false,
                        message:"user is already verified!"
                    })
                }else{
                    user.isVerified=true;
                    user.save();
                    // return res.status(200).json({
                    //     success:true,
                    //     message:"user is verified!"
                    // })
                    res.render("Admin/verified")
                }
            }
         })
      }else{
        return res.status(400).json({
            success:false,
            message:"token is not found!"
        })
      }
      
    }
    catch(error){
        return res.status(400).json({
            success:false,
            message:"error!"
        })
    }
}
 

// const register=async(req,res)=>{
//        try{
//         const User=new userModel({
//             name:req.body.name,
//             email:req.body.email,
//             phone:req.body.phone,
//             // image:req.file.path,
//             password:bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(12)),
//             answer:req.body.answer
//            })
//            const data=await userModel.findOne({email:req.body.email});
//            if(!req.body.name||!req.body.email||!req.body.phone||!req.body.password||!req.body.answer){
//             return res.status(400).json({
//                 success:false,
//                 message:"all fields are required!"
//             })
//            }else{
//               if(data){
//                 return res.status(400).json({
//                     success:false,
//                     message:"user already exists!"
//                 })
//               }else{
//                 const result=await User.save();
//                 return res.status(200).json({
//                     success:true,
//                     message:"Registered!",
//                     result
//                 })
//               }
//             }
         
//        }catch(error){
//         return res.status(400).json({
//             success:false,
//             message:"error!"
//         })
//        }
// }

//API for review
const review=async(req,res)=>{
    try{
       const reviews=new reviewModel({
          name:req.body.name,
          rating:req.body.rating,
          comment:req.body.comment,
          user:req.body.user
       })
       const alreadyReviewed=await reviewModel.findOne({name:req.body.name,user:req.body.user});
       if(alreadyReviewed){
            return res.status(400).json({
                success:false,
                message:"already reviewed!"
            })
        }else{
            const result=await reviews.save();
            const roomDetailsById=await roomModel.findById(req.body.name);
            roomDetailsById.reviews.push(result._id);
            
            const roomratings=await reviewModel.find({name:req.body.name});
             let s=0;
            for(let j=0;j<roomratings.length;j++){
                s=s+roomratings[j].rating;
            }
            console.log(s);
            roomDetailsById.numReviews=roomDetailsById.reviews.length;
            console.log( roomDetailsById.numReviews);
            roomDetailsById.rating=s/roomDetailsById.numReviews;
            
            console.log(roomDetailsById.rating);
            const review=await roomDetailsById.save();
            return res.status(200).json({
                success:true,
                message:"reviewed successfully!",
                result
            })
        }
    
    }
   catch(error){
    console.log(error);
        return res.status(400).json({
            success:false,
            message:"error!"
        })
    }
}

//API for get rooms by category//
const getRoomsByCategory=async(req,res)=>{
    try{
       const result=await roomModel.find({categoryid:req.params.id});
       return res.status(200).json({
        success:true,
        message:"Rooms!",
        result
       })
    }catch(error){
        return res.status(400).json({
            success:false,
            message:"error!",
            
           })
    }
}

//Api for fetching all category
const allCategory=async(req,res)=>{
    try{
       const result=await categoryModel.find();
       return res.status(200).json({
        success:true,
        message:"Categories!",
        result
       })
    }catch(error){
        return res.status(400).json({
            success:false,
            message:"error!",
            
           })
    }
}

//Api for fetching all blog
const allBlogs=async(req,res)=>{
    try{
       const result=await blogModel.find();
       return res.status(200).json({
        success:true,
        message:"Blogs!",
        result
       })
    }catch(error){
        return res.status(400).json({
            success:false,
            message:"error!",
            
           })
    }
}
const getBlogById=async(req,res)=>{
    try{
       const result=await blogModel.findById(req.params.id);
       return res.status(200).json({
        success:true,
        message:"Blogs!",
        result
       })
    }catch(error){
        return res.status(400).json({
            success:false,
            message:"error!",
            
           })
    }
}

const getRoomDetailsById=async(req,res)=>{
    try{
       const result=await roomModel.findById(req.params.id);
       return res.status(200).json({
        success:true,
        message:"Rooms!",
        result
       })
    }catch(error){
        return res.status(400).json({
            success:false,
            message:"error!",
            
           })
    }
}

const commentCreateBlog=async(req,res)=>{
    try{
       const result=new commentModel({
        review:req.body.review,
        user:req.body.user,
        blog:req.body.blog
       });
       const alreadyCommented=await commentModel.findOne({user:req.body.user,blog:req.body.blog});
       if(alreadyCommented){
        return res.status(400).json({
            success:false,
            message:"Already Commented!",
            
           })
       }else{
        const commentbyusers=await result.save();
        // const blog=await blogModel.findOne({_id:req.body.blog});
        // blog.comments.push(commentbyusers._id);
        // const output=await blog.save();
        console.log(commentbyusers);
        
        return res.status(200).json({
         success:true,
         message:"user has commented!",
         
        })
       }
       
    }catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"error!",
            
           })
    }
}

const roomBooking=async(req,res)=>{
    try{
       const result=new bookingModel({
             name:req.body.name,
             email:req.body.email,
             checkin:req.body.checkin,
             checkout:req.body.checkout,
             person:req.body.person,
             price:req.body.price,
             room:req.body.room,
             userid:req.body.userid,
             request:req.body.request
       });
       const alreadyBooked=await bookingModel.findOne({userid:req.body.userid,room:req.body.room});
       if(alreadyBooked){
        return res.status(400).json({
            success:false,
            message:"Already Booked!",
            
           })
       }else{
        const bookings=await result.save();
        // const userById=await userModel.findOne({_id:req.body.userid});
        // userById.bookings.push(bookings._id);
        // const userBookings=await userById.save();
        return res.status(200).json({
         success:true,
         message:"Room is Booked!",
         bookings
        })
       }
       
    }catch(error){
        return res.status(400).json({
            success:false,
            message:"error!",
            
           })
    }
}


const login=async(req,res)=>{
    try{
        const data=await userModel.findOne({email:req.body.email});
      const email=req.body.email;
      const password=req.body.password;
      if(!email||!password){
         return res.status(400).json({message:"all fields are mandatory!"});
      }
      else{
        if(data){
          if(data.isAdmin==false && data.isVerified==true){
            const pwd=data.password;
            if(bcrypt.compareSync(req.body.password,pwd)){
               const token=jwt.sign({
                id:data._id,
                name:data.name,
                email:data.email,
                phone:data.phone,
                image:data.image,
                answer:data.answer
               },process.env.SECRET_USER,{expiresIn:"1d"});
               return res.status(200).json({status:200,message:"login is successful!",token,data});
            }
            else{
              return res.status(400).json({status:400,message:"password is wrong"});
            }
          }else{
            return res.status(400).json({status:400,message:"individual is not a user! or individual is not verified!"});
          }
        }
        else{
          return res.status(400).json({success:true,message:"user doesnt exist!"})
        }
      } 

    }catch(error){
        console.log(error);
        return res.status(400).json({success:false,message:"error!"})
    }
}


const commentbyBlogId=async(req,res)=>{
    try{
        const result=await commentModel.find({blog:req.params.id}).populate("user");
        return res.status(200).json({
            success:true,
            message:"comments of blogs!",
            result
        })
    }catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"error!",
            
        })
    }
}


const reviewofrooms=async(req,res)=>{
    try{
       const result=await reviewModel.find({name:req.params.id}).populate("user");
       return res.status(200).json({
        success:true,
        message:'reviewed successfully!',
        result
       })
    }catch(error){
        return res.status(400).json({
            success:false,
            message:'error!',
            
           })
    }
}

const bookingbyusers=async(req,res)=>{
    try{
       const result=await bookingModel.find({userid:req.params.id}).populate("room");
       return res.status(200).json({
        success:true,
        message:"data fetched",
        result
       })
    }
    catch(error){
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"error!"
           })
    }
}

// Contact Us
const CreateContact = async (req,res)=>{
    try {
        const {name,email,topic,phone,msg} = req.body

        const NewContact =new ContactModel({
            name:name,
            email:email,
            topic:topic,
            phone:phone,
            msg:msg,
        })

        const result = await NewContact.save()
        return res.status(200).json({
            status:true,
            message:"Message Sent Successfully",
            data:result,
        })
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            status:false,
            message:"Error In Contact Us",
        })
        
    }
}



module.exports={
    
   
    review,
    getRoomsByCategory,
    allCategory,
    allBlogs,
    getBlogById,
    getRoomDetailsById,
    commentCreateBlog,
    roomBooking,
    login,
    regcreate,
    confirmation,
    commentbyBlogId,
    reviewofrooms,
    CreateContact,
    bookingbyusers
    
}