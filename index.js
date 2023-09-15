import  express  from "express";
import path from "path";
import mongoose from "mongoose";
//import Message from "./schema/message";
import cookieParser from "cookie-parser";
import  jwt from "jsonwebtoken";
import bycrypt from "bcrypt";

mongoose.connect("mongodb+srv://shahfaisal:TkjxpgUf8ZJOprri@cluster0.bly7vhj.mongodb.net/?retryWrites=true&w=majority",{
    dbName:"contact",
}).then(()=>console.log("Database connected"));
const app=express();

// to show the file not by exact location but by name
app.use(express.static(path.join(path.resolve(),"public")));

//using middleware to show json data
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
// Set up view engine
app.set("view engine", "ejs");




const userSchema= new mongoose.Schema(
    {
        name:String,
        email:String,
        password:String
    }
)
const User = mongoose.model("User", userSchema);


//middleware
const isAuthenticated= async (req,res,next)=>{
    const {token}=req.cookies;
    if(token)
    {
        const decodeo=jwt.verify(token,"sfsafdadfd");
        req.user=await User.findById(decodeo._id)
        next();
    }
    else
    {
    res.render("login");
    }
}
//login
app.get("/",isAuthenticated,(req,res)=>{
   //next will call this
   console.log(req.user);
    res.render("logout",{name:req.user.name});
});
app.get("/register",(req,res)=>{
    //next will call this
    console.log(req.user);
     res.render("register");
 });

 app.get("/login",(req,res)=>{
    //next will call this
    console.log(req.user);
     res.render("login");
 });
//register

app.post("/register", async(req,res)=>{ 
    const {name,email,password}= req.body; 
    let user=await User.findOne({email});
    if(user)
    {
        
        return res.redirect('/login');
    }
    const hassedPassword=await bycrypt.hash(password,10);

     user=await User.create({
        name,
        email,
        password:hassedPassword,
    }) ; //data is post to /contact and form is used in index where the data is comimg  
   res.redirect("/")
    
    // to redirect the route to /success
});

 //Login
app.post("/login", async(req,res)=>{ 
    const {email,password}= req.body; 
    let user=await User.findOne({email});
    if(!user)
    {
        return res.redirect('/register');
    }
    const isMatch=await bycrypt.compare(password,user.password);
    // In your route handler
const message = "Wrong password"; // Define your message
    if(!isMatch) return res.render("login", {email, message });

    //data is post to /contact and form is used in index where the data is comimg  
   const token=jwt.sign({_id:user._id},"sfsafdadfd");
    res.cookie("token",token,{
    httpOnly:true,
    expires:new Date(Date.now()+60*1000)
   });
   res.redirect("/")
    // to redirect the route to /success
});
app.get("/logout", async(req,res)=>{     //data is post to /contact and form is used in index where the data is comimg  
    res.cookie("token",null,{
    expires:new Date(Date.now())
    });
    res.redirect("/")
     
     // to redirect the route to /success
 });



/*sending file
import path from "path"
app.get("/node",(req,res)=>{
    const pathloca=path.resolve();
    res.sendFile(path.join(pathloca,"./index.html"));
});

*/
//import * as myObj from "./features.js"
//path have many things like show dirname etc
//import path from "path";
//console.log(path.extname("/home/random/index.js"))

/*this is without server express
import http from "http";
const server=http.createServer((req,res)=>{
    if(req.url==="/")
    {
    res.end("<h1>Noice</h1>");
    }
});
*/
//404 not found
//500 interbal server error
//400 bad request
//200 Ok

app.listen(5000,()=>{
    console.log("Server is working");
})