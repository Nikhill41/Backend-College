const http=require('http');


const server=http.createServer((req,res)=>{
    const method=req.method;
    const url=req.url;

    if(method=="GET" && url=="/"){
        res.writeHead(404,{"Content-Type":"text/palin"});
        res.end("hello welocme to home page")
    }else{
        res.writeHead(200,{"Coontent-Type":"text-plain"});
        res.end("route not foound");
    }
})


sfor (let i = 0; i < 5; i++) {
  console.log('Hello world!');
}
erver.listen(3200,()=>{
    console.log("serveer started duccessfuly");
})