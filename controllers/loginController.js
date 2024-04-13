const Batch = require('../models/BatchModel');
const Admin = require('../models/AdminModel');
const {userModel} = require('../models/UserModel');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const handleLogin =  asyncHandler(async (req,res) => {
    const {username,password} = req.body;
    if(!username || !password){
        return res.status(400).json({"message":"Username and password can't be empty"});
    }
    const batch = await Batch.find({}).exec();
    for(let i=0;i<batch.length;i++){
        const batchname = batch[i].batchname;
        const users = batch[i].users;
        // console.log(users);
        const foundUser = users.find(user => parseInt(user.rollno) === parseInt(username));
        if(!foundUser){
            continue;
        }
        const match = await bcrypt.compare(password, foundUser.password);
        if(match){
            // create JWTs
            const role = foundUser.role;
            const rollno = foundUser.rollno;
            const accessToken = jwt.sign(
                {"UserInfo":
                            { 
                                "rollno": rollno,
                                "role": role,
                            }
                },
                process.env.SECRET_ACCESS_TOKEN,
                { expiresIn: '1h' }
            );
            const refreshToken = jwt.sign(
                { "username": foundUser.username },
                process.env.SECRET_REFRESH_TOKEN,
                { expiresIn: '1d' }
            );
            // Saving refreshToken with current user
            foundUser.refreshToken = refreshToken;

            //Saving lastLogintime
            foundUser.lastLogin = Date.now(); 
            await batch[i].save();
            res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            return res.json({ accessToken, role, "fullname":foundUser.fullname});
        }
        else{
            return res.status(401).json({message:"password"});
        }     
    }
    return res.status(401).json({message:"username"});
});

const adminLogin = asyncHandler(async(req,res)=>{
    const {username, password } = req.body;

    if(!req.body){
        return res.status(400).json({message:"empty data"});
    }

    // const foundAdmin1 = await Admin.findOne({username});
    // const foundAdmin2 = await Admin.findOne({email});
    const foundUser = await Admin.findOne({username});
    if(!foundUser){
        return res.status(400).json({message:"admin not found"});
    }

    const match = await bcrypt.compare(password,foundUser.password)
    if(match){
            const role = foundUser.role;
            const accessToken = jwt.sign(
                {"UserInfo":
                            { 
                                "username": foundUser.username,
                                "role": role,
                            }
                },
                process.env.SECRET_ACCESS_TOKEN,
                { expiresIn: '1h' }
            );
            const refreshToken = jwt.sign(
                { "username": foundUser.username },
                process.env.SECRET_REFRESH_TOKEN,
                { expiresIn: '1d' }
            );
            // Saving refreshToken with current user
            foundUser.refreshToken = refreshToken;

            //Saving lastLogintime
            foundUser.lastLogin = Date.now(); 
            await foundUser.save();
            res.cookie('jwt', refreshToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            return res.json({ accessToken, role, "username":foundUser.username});
        }
        else{
            return res.status(401).json({message:"password"});
        }     
})

module.exports = { handleLogin, adminLogin };