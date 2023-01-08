const express=require("express");
const app=express();
// const date= require(__dirname+"/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
// let items=["Buy Food", "Cook Food", "Eat Food"]
// let workItems=[];
app.set('view engine', 'ejs');
app.use(express.urlencoded());
app.use(express.static("public"));
mongoose.set('strictQuery', true)
mongoose.connect('mongodb+srv://Arun_Raghav:arunraghav007@cluster0.rwmzulx.mongodb.net/todoListDB');
const itemsSchema= new mongoose.Schema({
    name: String
  });
const Item = mongoose.model('Item', itemsSchema);
const i1 = new Item({ name: 'Buy Food' });
const i2 = new Item({ name: 'Cook Food' });
const i3 = new Item({ name: 'Eat Food' });
const defaultItems=[i1,i2,i3];
const listSchema=new mongoose.Schema({
    name:String,
    items:[itemsSchema]
});
const List = mongoose.model('List',listSchema);
// Item.deleteMany({_id:["63b966f981e44e5f5eaa04cd","63b966f981e44e5f5eaa04ce","63b966f981e44e5f5eaa04cf"]},function(err){
//     if(err){
//                 console.log(err);
//             }
//             else{
//                 console.log("Succesfully deleted duplicate items");
//             }
// });

// let allItems = Item.find({});
// console.log(allItems)
// allItems.forEach(element => {
//     console.log(element.name);
// });

app.get("/",function(req,res){
    // let day=date.getDate();
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Succesfully added default items");
                }
            });
            res.redirect("/");
        }else{
            res.render("list", {listTitle: "Today", newListItems:foundItems});
        }
    })
    
    
});
app.post("/",function(req,res){
    let itemName=req.body.newItem;
    let listName=req.body.list;
    const newi = new Item({ name: itemName });
    if(listName==="Today"){
        newi.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName},function(err,foundList){
            foundList.items.push(newi);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    
    // if(req.body.list==="Work"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }
    // else{
    //     items.push(item);
    //     res.redirect("/");
    // }
})
app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkBox;
    let listName=req.body.listName;
    
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Succesfully deleted");
                res.redirect("/")
            }
        });
    }else{
        List.findOneAndUpdate({name:listName},
            {$pull:{items:{_id:checkedItemId}}},
            function(err,results){
                if(!err){
                    res.redirect("/"+listName);
                }
            });
    }    
    
});
app.get("/:newList",function(req,res){
    const customListName=_.capitalize(req.params.newList);
    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                //Create a new List
                const list=new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
                // console.log("Doesn't exist!")
            }else{
                //Show existing list
                res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
                // console.log("Exists")
            }
        }
    })
    
})
// app.get("/work",function(req,res){
//     res.render("list", {listTitle: "Work", newListItems:workItems});
// })
app.listen(process.env.PORT||3000,function(){
    console.log("Server started in port 3000");
})
