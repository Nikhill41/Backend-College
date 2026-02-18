const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    const method = req.method;
    const url = req.url;

    if (method === "GET" && url === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Welcome to home page");
    }else{
        const date=new date. 
    }
    
});

server.listen(3200, () => {
    console.log("Server started on port 3200");
});


