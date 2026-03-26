const express=require('express');
const app=express();

app.use(express.json());


app.post("/sum",(req,res)=>{
    // const a=req.query.a;
    // const b=req.query.b;


    const {a,b}=req.body;

    
    
    
    res.send(parseInt(a)+parseInt(b));

})

app.post("/mul",(req,res)=>{
    const {a,b}=req.body;
    res.send(parseInt(a)*parseInt(b));
})

app.post("/sub",(req,res)=>{
    const {a,b}=req.body;
    res.send(parseInt(a)-parseInt(b));
})
app.post("/div",(req,res)=>{
    const {a,b}=req.body;
    res.send(parseInt(a)/parseInt(b))
})
const add=[];
app.post("addition",(req,res)=>{
    
    const a=req.body.a;
    add.push(parseInt(a));
    const sum=0;
    for(let i=0;i<add.length;i++){
        sum+=add[i];
    }
   res.send(JSON.stringify(add));
})

app.listen(5000,()=>{
    console.log("server running");
})