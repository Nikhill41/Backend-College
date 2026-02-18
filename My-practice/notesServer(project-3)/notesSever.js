const  http=require('http');
const  fs=require('fs');

const server=http.createServer((req,res)=>{
    const method=req.method;
    const  url=req.url;
    fs.readFile("./notes.json", 'utf-8', (err, data) => {
        if(err) data = '[]';

    if(method=="POST" && url=="/data"){
        req.accepts();

    }else if(method=="GET" && url=="/data"){
        res.writeHead(200,{"Content-Type":"application/json"});
        res.end(JSON.stringify(data));
    }else{
        res.writeHead(404,{"Content-Type":"text/plain"});
        res.end("route not fond");
    }
    });
});


server.listen(3400, () => {
    console.log('server listening on port 3000!');
});