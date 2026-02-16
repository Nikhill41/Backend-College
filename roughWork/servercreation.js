const http=require('http');
const fs=require('fs');


const user={user:["Anshul","Nikhil","Ishann"]};

const sever=http.createServer((req,res)=>{
    const method=req.method;
    const url=req.url;
    console.log("server");

    if(method=="GET" && url=="/"){
        res.writeHead(200,{"Content-Type":"application/json"});
        res.end(JSON.stringify("welcome to home page"));
}else if(method=="GET" && url=="/users"){
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify(user));
}else if(method=="POST" && url=="/data"){
    let body="";
    req.on("data",(chunks)=>{
        body+=chunks;
    })
    req.on("end",()=>{
    const bodydata=JSON.parse(body) // string to object to add only  then name
    user.user.push(bodydata.data);
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify("user registerd succesfully"));
    })
}


else{
    res.writeHead(200,{"Content-Type":"application/json"});
    res.end(JSON.stringify("not found url"));
}
})



sever.listen(3200,()=>{
    console.log("server started");
})










