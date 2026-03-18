const {getToDo,saveToDo}=require("../utils/fileHandler");




//getting all todo data
exports.getToDo=(req,res)=>{
    const data=getToDo();
    res.json(data);
};


//adding to the database
exports.addToDO=(req,res)=>{
    const data=getToDo();
    const newToDo={
        id:Date.now(),
        task:req.body.task,
        completed:false
    }
    data.push(newToDo);
    saveToDo(data);
    res.json(newToDo)
}


//updating to do list
exports.updateToDo=(req,res)=>{
    let data=getToDo();
    const id=Number(req.params.id);
    data=data.map(todo=>  todo.id==id?{...todo, task:req.body.task}:todo)
    saveToDo(data);
    res.json({message:"task updated"});
};



//deleting the doto task
exports.deleteDoTo=(req,res)=>{
    const data=getToDo();
    const id=Number(req.params.id);
    data=data.filter(todo=> todo.id!==id);
    saveToDo(data);
    res.json({message:"to deleted"});
};