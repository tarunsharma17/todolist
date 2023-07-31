const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');

const _ = require("lodash");

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema = new mongoose.Schema({
  name:{
    type:String,
    required: true
  }
})

const Item = mongoose.model('Item',itemsSchema);

mongoose
  .connect("mongodb+srv://tarunsharma176090:rentit@cluster0.kduj4jv.mongodb.net/todolistDB")
  .then(()=>{
    console.log("mongoDB is connected.");
    
    const item1 = new Item({
      name:"to buy food"
    }) 

    const item2 = new Item({
      name:"to cook food"
    })

    const item3 = new Item({
      name:"to do work"
    })

    const defaultItem = [item1,item2,item3];

    Item.find({})
  .then(function(founditems){
    // console.log(founditems.length);

    if(founditems.length === 0){

      Item.insertMany(defaultItem)

      .then(()=>{
        console.log("new items are added to the list.");
      })
      .catch((err)=>{
        console.log(err);
      });

    }

  })
  .catch((err)=>{
    console.log(err);
  })

    // Item.insertMany(defaultItem)

    // .then(()=>{
    //   console.log("new items are added to the list.");
    // })
    // .catch((err)=>{
    //   console.log(err);
    // });

  })

  .catch((err)=>{
    console.log(`unable to connect to the server: ${err}`);
});

const ListSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List",ListSchema);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

// const day = date.getDate();

  // res.render("list", {listTitle: day, newListItems: items});
  Item.find({})
  .then(function(founditems){
  //   // console.log(founditems.length);

    res.render("list", {listTitle: 'today', newListItems: founditems});

  })
  .catch((err)=>{
    console.log(err);
  })

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item4 = new Item({
    name: itemName
  })

  
  if(listName == "today"){ 
  
   item4.save()
   .then(()=>{
     console.log("item added successfully.");
   })
   .catch((err)=>{
     console.log(err);
   })
   res.redirect("/");
  }else{

  List.findOne({name: listName})
  .then(function(foundlist){
    foundlist.items.push(item4);
    foundlist.save()

    res.redirect("/"+listName)
  })
  .catch((err)=>{
    console.log(err);
  })
}


});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName == "today"){

    Item.deleteOne({_id:checkedItemId})
    .then(()=>{
      console.log("item deleted successfully.");
    })
    .catch((err)=>{
      console.log(err);
    })
    res.redirect("/");
  }else{

    List.findOneAndUpdate({name: listName},{$pull:{items:{_id: checkedItemId}}})
    .then(()=>{
      console.log("item deleted from the selected list");
    })
    .catch((err)=>{
      console.log(err);
    })
    res.redirect("/"+listName);
  }


});

app.get("/:customListName",function(req,res){
  const value = req.params.customListName;
  const customListName = _.capitalize(value);
  // console.log(req.params.listName);

  const item1 = new Item({
    name:"to buy food"
  }) 

  const item2 = new Item({
    name:"to cook food"
  })

  const item3 = new Item({
    name:"to do work"
  })

  const defaultItems = [item1,item2,item3];

  List.findOne({name: customListName})
  .then(function(foundlist){

    // console.log(foundlist);
    if(!foundlist){
      //if creating a new list     
      const list = new List({
        name: customListName,
        items: defaultItems
      })
      
      list.save()

      res.redirect("/"+customListName)

    }else{
      // if list already exists
      res.render("list",{listTitle: foundlist.name, newListItems: foundlist.items});
    }
  })
  .catch((err)=>{
    console.log(err);
  })
  
})

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
