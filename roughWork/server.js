const http=require('http');
const users={users:["Nikhil","Ishaan","Manikant","Mukund","Anshul","Srajan"]};


const server=http.createServer((req,res)=>{

    const method=req.method;
    const url=req.url;


    if(method=="GET" && url=="/"){
        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("welcome to Home page");

    }else if(method=="GET" && url=="/users"){
        res.writeHead(200,{"Content-Type":"application/json"});
        res.end(JSON.stringify(users));
    } else if(method=="POST" && url=="/users"){
      let body="";
      req.on("data",(chunk)=>{
        body+=chunk;
      });
      req.on("end",()=>{
        const parsedBody=JSON.parse(body);
        res.writeHead(200,{"Content-Type":"application/json"});
        res.end(JSON.stringify({
          message:" user craeted successfully",
          name:parsedBody,
        }))
      })

    }
     
    else {
        res.writeHead(404,{"Content-type":"text/plain"});
        res.end("route not found");
    }

})


server.listen(3400,()=>{
    console.log("server started succesfully");
})