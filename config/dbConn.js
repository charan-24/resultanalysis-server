const mongoose = require('mongoose');
const mongouri = process.env.MONGO_URI;
const mongopwd = process.env.MONGO_PWD;
const uri = `mongodb+srv://${mongouri}:${mongopwd}@cluster0.komulec.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb://localhost:27017/resultanlaysis";

const connectDB = async () => {
   await mongoose.connect(uri)
                  .then(()=>{
                     console.log("Connected to database");
                  })
                  .catch((err)=>{
                     console.error(err);
                  })
};

module.exports = connectDB;

