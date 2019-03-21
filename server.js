const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('public'));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/museum', {
  useNewUrlParser: true
});

// Configure multer so that it will upload to '/public/images'
const multer = require('multer')
const upload = multer({
  dest: './public/images/',
  limits: {
    fileSize: 10000000
  }
});

// Create a scheme for items in the museum: a title and a path to an image.
const itemSchema = new mongoose.Schema({
  title: String,
  path: String,
  description: String,
});

// Create a model for items in the museum.
const Item = mongoose.model('Item', itemSchema);

// Upload a photo. Uses the multer middleware for the upload and then returns
// the path where the photo is stored in the file system.
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  // Just a safety check
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    path: "/images/" + req.file.filename
  });
});

// Create a new item in the museum: takes a title and a path to an image.
app.post('/api/items', async (req, res) => {
  console.log(req.body);
  const item = new Item({
    title: req.body.title,
    path: req.body.path,
    description: req.body.description,
  });
  console.log(item);
  try {
    await item.save();
    res.send(item);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Get a list of all of the items in the museum.
app.get('/api/items', async (req, res) => {
  try {
    let items = await Item.find();
    res.send(items);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
  let id = (req.params.id);  
  let items = await Item.find();
  let removeIndex = items.map(item => {
    return item._id;
  })
  let officialIndex = 100;
  for (let i = 0; i < removeIndex.length; i++) {
      if (id == removeIndex[i]) {
        officialIndex = i;
      }
  }
  console.log("Here it is: " + officialIndex);
  if (removeIndex === -1) {
    res.sendStatus(404);
    return;
  }
  items.splice(removeIndex, 1);

  Item.remove({_id:id}, function(err, removed) {

  });
  res.sendStatus(200);
  }catch(error) {
    console.log(error);
    res.sendStatus(500);
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    let id = req.params.id;
    let items = await Item.find();
    let newTitle = req.body.title;
    let newDescription = req.body.description;
  for (let i = 0; i < items.length; i++) {
    if (id == items[i]._id) {
      items[i].title = newTitle;
      console.log(req.body);
      items[i].description = newDescription;
      items[i].save();
      res.sendStatus(200);
      return;
    }
  }
  res.sendStatus(400);

  }catch(error) {
    console.log(error);
    res.sendStatus(500);
  }
});


app.listen(3000, () => console.log('Server listening on port 3000!'));