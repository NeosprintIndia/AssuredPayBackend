const express =require('express');
const app = express();
const mongooose = require("mongoose");
var bodyParser = require('body-parser')

const userRoute:any=require("./Routes/UserRegister")
import "dotenv/config";


//parse various different custom JSON types as JSON    
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.json());


app.use("/register",userRoute)


const port = 3000;

mongooose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((error:any) => {
    console.error("Error connecting to MongoDB:", error);
});
 

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});