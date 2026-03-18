const fs=require('fs');
const FILE_PATH="./data/todos.json";


function getToDo(){
    const data=fs.readFileSync(FILE_PATH);
    return  JSON.parse(data);
}


function saveToDo(data){
    fs.writeFileSync(FILE_PATH,JSON.stringify(data,null,2));
    console.log("file readed successfuuly");
}

module.exports={getToDo,saveToDo};