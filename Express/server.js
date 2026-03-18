const express=require('express');
const app=express();



app.get("/",(req,res)=>{
    res.send("hello  welcome to home page");
})

app.get("/user/123",(req,res)=>{
    console.log(req.params);
    res.send("hello  welcome to home page");
})


app.listen(5000,()=>{
    console.log("server running");
})