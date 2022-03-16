//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

mongoose.connect("mongodb://admin-Himanshu:EEYOAvZkWwktHwBP@cluster0-shard-00-00.0fx82.mongodb.net:27017,cluster0-shard-00-01.0fx82.mongodb.net:27017,cluster0-shard-00-02.0fx82.mongodb.net:27017/test?replicaSet=atlas-zqsfpz-shard-0&ssl=true&authSource=admin", {
  useNewUrlParser: true
});

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


const itemSchema = mongoose.Schema({
  name: String
});
const itemM = mongoose.model("item", itemSchema);

const item1 = new itemM({
  name: "Welcome to todolist"
});
const item2 = new itemM({
  name: "Hit + to add items"
});
const item3 = new itemM({
  name: "hit this to delete items"
});

const defaultItem = [item1, item2, item3];

const listScheme = mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const listM = mongoose.model("list", listScheme);

itemM.find({}, function (err, data) {
  if (data.length === 0) {
    itemM.insertMany(defaultItem, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully add default items");
      }
    });
  }
});

const workItems = [];

app.get("/", function (req, res) {

  //const day = date.getDate();
  itemM.find({}, function (err, data) {
    res.render("list", { listTitle: "Today", newListItems: data });
  });
});


app.get("/:customListName", function (req, res) {

  const customListName = _.capitalize(req.params.customListName);
  //console.log(customListName);

  listM.findOne({ name: customListName }, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      //console.log(data);
      if (!data) {
        const CustomListItem = new listM({
          name: customListName,
          items: defaultItem
        });
        CustomListItem.save(function(err){
          if(err){
            console.log(err);
          }else{
            res.render("list", { listTitle: customListName, newListItems: defaultItem });
          }
        });

      } else {
        //console.log(data.items);
        res.render("list", { listTitle: customListName, newListItems: data.items });
      }
    }
  });  
});

app.post("/", function (req, res) {

  const item = req.body.newItem;
  const listTitle = req.body.listTitle;
  console.log(req.body);

  const itemData = new itemM({
    name: item
  });

  if (listTitle === "Today") {
    if (item.length > 0) {
      itemData.save(function(err){
        if(err){
          console.log(err);
          res.redirect('/');
        }else{
          res.redirect('/');
        }
      });
    }else
      res.redirect('/');

  } else {
    if(item.length>0){
      listM.updateOne({name:listTitle},
                      {$push:{items:itemData}},
        function(err){
          if(err){
            console.log(err);
            res.redirect('/'+listTitle);
          }else{
            console.log("success!");
            res.redirect('/'+listTitle);
          }
      });
    }else
      res.redirect('/'+listTitle);
  }
});

app.post('/delete', function (req, res) {
  const deleteItemId = req.body.checkbox;
  const listTitle = req.body.listTitle;
  //console.log(req.body);

  if(listTitle==="Today"){
    itemM.findByIdAndDelete(deleteItemId, function (err) {
      if (!err) {
        console.log("Delete Successfully");
        res.redirect("/");
      }else{
        res.redirect("/");
      }
    });
    

  }else{
    listM.findOneAndUpdate({name:listTitle},{$pull:{items:{_id:deleteItemId}}},function(err,data){
      //console.log(data);
      if(!err){
        console.log("Deleted");
        res.redirect("/"+listTitle);
      }else{
        console.log(err);
        res.redirect("/"+listTitle);
      }
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port==""){
  port=3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});
