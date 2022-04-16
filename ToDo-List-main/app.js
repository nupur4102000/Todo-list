const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://admin-vaishnavi:Test123@cluster0.selnt.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({name: "Welcome to your to do list!"});

const item2 = new Item({name: "Hit + button to add a new item."});

const item3 = new Item({name: "<-- Hit this to delete an item."});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res){
  Item.find({},function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Default items added to the database");
        }
      });
    }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  });
});


app.get("/:customListName" , function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      if(!err){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      }
    });
  }


});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(req.body);

  if(listName === "Today"){
    Item.deleteOne({_id : checkedItemId}, function(err){
      if(err)
      {
        console.log(err);
      } else {
        console.log("Successfully deleted!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}} , function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});

app.post("/work", function(req, res){
  var newItem = req.body.newItem;
  workItems.push(newItem);
  res.redirect("/work");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen( port, function(){
  console.log("Server has started Successfully");
});
