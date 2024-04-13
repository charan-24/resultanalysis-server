//import modules
require('dotenv').config();
const exp = require('express');
const app = exp();
const bodyParser = require("body-parser");
const cors = require('cors');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const fetchapp=require('./routes/fetch')
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const Batch = require('./models/BatchModel');
const axios = require('axios');
const emailjs = require('@emailjs/browser');
const PORT = process.env.PORT || 5000;

//connect to DB
connectDB();

//middlewares
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(exp.json());
app.use(exp.static("public"));

//routes
app.use('/login',require('./routes/login'));
app.use('/register',require('./routes/register'));
app.use('/batch',require('./routes/batch'));
app.use('/user',require('./routes/user'));
app.use('/score',require('./routes/score'));
// app.use('/fetch',require('./routes/fetch'));
app.use('/fetch',fetchapp)

// Schedule the cron job to run at 12:00

const dailyUpdate = async ()=>{
    const batches = await Batch.find().exec();
    // console.log(batches.length);
    for(let i=0;i<batches.length;i++){
        const batch = batches[i];
        // console.log(batch.batchname);
        const batchData = {
            batchname:batch.batchname,
        }
        // console.log(batchData);
        await axios.post('http://localhost:5000/score/fetchScores', batchData, {
            headers: {'Content-Type' : 'application/json'}
        })
        .then(res => {
            console.log(res.data);
        })
        .catch(err=>{
            console.error(err);
        });
        // console.log(batchData);
    }
}

cron.schedule('20 00 * * *', () => {
    dailyUpdate();
});


   


//server connection
mongoose.connection.once('open', ()=>{
    app.listen(PORT,()=>{console.log(`server started on port ${PORT}`)});
});



