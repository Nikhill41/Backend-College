const express=require("express");
const router=express.Router();
const { addToDO,updateToDo,deleteDoTo,getToDo} = require("../controllers/toDoControllerLogic");

router.get("/todo",getToDo);
router.post("/todo",addToDO);
router.put("/todo/:id",updateToDo);
router.delete("/todo/:id",deleteDoTo);

module.exports=router;

