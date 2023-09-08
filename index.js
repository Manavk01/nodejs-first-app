

import  express  from "express";
import path from 'path'
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
mongoose.connect("mongodb://127.0.0.1:27017", {
  dbName: "backend",
})
.then(() => console.log("database connected")).catch((e) => console.log(e));


const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
})

const user = mongoose.model("user" , userSchema);
const app = express();

const users=[];


app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
// settiing up view engine 
app.set("view engine" , "ejs");




const isAuthenticated  = async(req,res,next) =>{
  const{token} = req.cookies;
  
  if (token){
    const decoded =  jwt.verify(token , "ssdhdhdsso")
    //  console.log(decoded);
    req.user = await user.findById(decoded._id)
    next()

  }
  else{
    res.redirect("/login");

  }
}


app.get("/" ,isAuthenticated, (req,res) =>{
  // console.log(req.user);
  res.render("logout",{name:req.user.name});
});

app.get("/login" , (req,res) =>{
  // console.log(req.user);
  res.render("login");
});

app.get("/register" , (req,res) =>{
  // console.log(req.user);
  res.render("register");
});

app.post("/login" , async(req,res) =>{
  const {email , password} = req.body;

  let User = await user.findOne({email});
    
  if (!User) return res.redirect("/register");
   
  const isMatch  = await bcrypt.compare(password, User.password);

  if (!isMatch) return res.render("login",{email, message:"incorrect password"});
  
  const token = jwt.sign({_id: User._id}, "ssdhdhdsso");
  //  console.log(token);

  res.cookie("token" , token,{
   
  httponly:true,expires:new Date(Date.now()+60*1000),
});
  res.redirect("/");
});


app.post("/register" ,async(req,res) =>{
  // console.log(req.body);
  const{name,email, password} = req.body;
  let User = await user.findOne({email});
  if (User){
   return res.redirect("/login");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  User = await user.create({
    name,
    email, 
    password:hashedPassword,
  });

//   User= await user.create({
//        name ,
//        email,

//   }); 
  
  const token = jwt.sign({_id: User._id}, "ssdhdhdsso");
  //  console.log(token);

  res.cookie("token" , token,{
   
  httponly:true,expires:new Date(Date.now()+60*1000),
});
  res.redirect("/");
});


app.get("/logout" ,(req,res) =>{
  res.cookie("token" , "iamin",{
   
  httponly:true,expires:new Date(Date.now()),
});
  res.redirect("/");
});


app.listen(5000, ()=>{
    console.log("server is working");
});