// const fs =require("fs");
// // console.log(fs);


// // const data= fs.readFileSync("toDo.json","utf-8");
// // console.log(data);


// const readToDo= function(){
//     const data =fs.readFileSync("toDo.json","utf-8");
//     return data;
// }
// readToDo();
// console.log(readToDo());


const fs =require("fs");
const path =require("path");

const TODO_FILE = path.join(__dirname,"toDo.json");

// console.log(TODO_FILE);


////reading data from file in array form
const readToDo=function(){
    const data=fs.readFileSync(TODO_FILE,"utf-8");
    return data;
}
// console.log(readToDo());



////reading data in json form from array form
// const readDataJson =function(){
//  const dataJson=fs.readFileSync(TODO_FILE,"utf-8");
 
//  return JSON.parse(dataJson);
// }
// console.log(readDataJson());





////to write in existing file using fs module
const writeToDO=function(todo){
    fs.writeFileSync(TODO_FILE,JSON.stringify(todo,null,1));
}

function addToDo(task){
    const todos=readToDo();
    const newAddToDo={
        id:Date.now(),
        task:task,
        done:false
    };
    todos.push(addToDo);
    writeToDO(todos);
    console.log("task addes",task);
}