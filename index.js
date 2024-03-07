import Express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose, { Schema } from "mongoose";
import cookieParser from "cookie-parser";
import Jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose.connect("mongodb://127.0.0.1:27017",{
  dbName:"backend",
})
.then(() => console.log("Database Connected"))
.catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
   name: String,
   email: String,
   password: String
});

const User = mongoose.model("User",userSchema)

const app = Express();

// const users = [];

app.set("view engine", "ejs");

const isAuthenticated = async (req,res,next) => {   //created middleware
  const {token} = req.cookies;
  if(token){
    // res.render("logout");
    const decoded = Jwt.verify(token,"afgsshsjjsnsnjskks");
    req.user = await User.findById(decoded._id);
    console.log(decoded)
    next();
  } else {
    res.redirect("/login");
  }
}

app.use(Express.static(path.join(path.resolve(), "public")))
app.use(Express.urlencoded({extended:true}))
app.use(cookieParser())
// app.use(Express.static(path.join(__dirname, 'public', 'style.css')));
console.log(path.join(path.resolve(), "public"))
console.log(path.join(__dirname, 'public', 'style.css'))

// app.get("/getProducts",(req,res) => {
// //   res.sendStatus(500)   //sends statuscode
// res.status(400).json("meri marzi")  //sets the message with 
// res.json({
//     success:true,
//     products:[]
// })
// });

// app.get("/",(req,res) => {
//     res.sendFile("index.html");
// });

// app.get("/",(req,res) => {
//     res.render("index",{name:"Suyash"});
// });

// app.get("/add",async (req,res) => {
//   await Message.create({name: "Parnika", email:"parnika@gmail.com"})
// });

// app.get("/",(req,res) => {
//       res.render("index");
//   });

app.get("/", isAuthenticated, (req,res) => {
  res.render("logout",{name:req.user.name});
});

app.get("/register", (req,res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req,res) => {
  const {email, password} = req.body
  let user = await User.findOne({email});
  if(!user) return res.redirect("/register");
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) return res.render("login", {email, message: "Incorrect Password"});
  const token = Jwt.sign({_id:user._id},"afgsshsjjsnsnjskks");
  console.log(token)
  res.cookie("token",token,{
    httpOnly: true,
    expires: new Date(Date.now() + 60*1000),
  });
  res.redirect("/");
});

app.post("/register", async (req,res) => {
  const {name, email, password} = req.body;
  let user = await User.findOne({email})
  if(user){
    return res.redirect("/login");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashedPassword
  });
  const token = Jwt.sign({_id:user._id},"afgsshsjjsnsnjskks");
  console.log(token)
  res.cookie("token",token,{
    httpOnly: true,
    expires: new Date(Date.now() + 60*1000),
  });
  res.redirect("/");
});

app.get("/logout", (req,res) => {
  res.cookie("token",null,{
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
})

//   app.get("/success",(req,res) => {
//     res.render("success");
// });

  // app.post("/contact",async (req,res) => {
  //   const {name, email} = req.body;
  //   await Message.create({name, email});
  //   res.redirect("success");
  // });

  // app.get("/users",(req,res) => {
  //   res.json({
  //     users,
  //   })
  // });

app.listen(5000, () => {
  console.log("server is running")
});