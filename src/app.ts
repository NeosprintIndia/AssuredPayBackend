import express from 'express';
const app = express();
const User = require("./Models/UserSchema");
const mongoose = require("mongoose");
var bodyParser = require('body-parser')


// parse various different custom JSON types as JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))


const port = 3000;

mongoose.connect("mongodb+srv://nitinkumar2610:Snitin16@testdb.vyf0wul.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

app.get('/', (req:any, res:any) => {
  res.send('Exciting News: AssuredPay Project is Set to Transform the Future of Business Finance!');
});

app.post('/users', async(req: any, res: any) => {
  try {
 
    console.log(req.body);
    const newUser = req.body; 
    
     const savedUser = await User.create(newUser); 
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}); 

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});