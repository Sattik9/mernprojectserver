const express=require('express');
const mongoose=require('mongoose');
require('dotenv').config();
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const flash=require('connect-flash');
const session=require('express-session');
const ejs=require('ejs');
const cors=require('cors');
const path=require('path');
const adminRouter=require("./Route/adminRoute");
const apiRouter=require("./Route/apiRoute");
const app=express();

//**bodyparser//
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors());
//cookieparser,session,flash//
app.use(session({
    cookie:{
        maxAge:60000
    },
    secret:"sattik34",
    saveUninitialized:false,
    resave:false
}));
app.use(cookieParser());
app.use(flash());

//static path//
app.use(express.static(path.join(__dirname,'public/Admin')));

//***multer */
app.use('/uploads',express.static('uploads'));

//routers//
app.use('/admin',adminRouter);
app.use(apiRouter);

//**ejs */


app.set('view engine','ejs');
app.set('views','views');

//mongoose//
const dbDriver=process.env.MONGO_URL;
const port=process.env.PORT;
mongoose.connect(dbDriver,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>{
    app.listen(port,()=>{
        console.log('db is connected!');
        console.log(`server is running at http://localhost:${port}/admin/loginform`);
    })
})
.catch(()=>{
    console.log('error');
})