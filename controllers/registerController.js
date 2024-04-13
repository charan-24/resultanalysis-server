const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/AdminModel');

const handleRegister = asyncHandler(async (req,res) => {
    const {username, password} = req.body;
    if(!username || !password ){
        return res.status(400).json({"message":"Username and password can't be empty"});
    }

    const foundUser =  await User.userModel.findOne({ username:username }).exec();
    if(foundUser){
        return res.status(409).json({"message":"User already exists"});
    }
    try {
        //encrypt the password
        const hashedPwd =  await bcrypt.hash(password, 11);
        //create & store the new user
        const newUser =  await User.userModel.create({ 
                            "username": username, 
                            "password": hashedPwd 
                        });
        res.status(201).json({ 'success': `New user ${username} created!` });
        // res.redirect('http://localhost:3000/');
    } 
    catch (err) {
        res.status(500).json({ 'message': err.message });
    }
});

const adminRegister = asyncHandler(async(req,res)=>{
    const {username, email, password, fullname} = req.body;
    if(!req.body){
        return res.status(400).json({message:"empty data"});
    }

    const duplicateusername = await Admin.findOne({username}).exec();
    const duplicateemail = await Admin.findOne({email}).exec();
    if(duplicateemail || duplicateusername){
        return res.status(400).json({message:"admin already exists"});
    }

    const hashpassword = await bcrypt.hash(password,11);

    const newAdmin = new Admin({
        fullname,
        username,
        email,
        password: hashpassword
    });

    const admins = await Admin.find({}).exec();
    admins.push(newAdmin);
    await newAdmin.save()
                    .catch(err=>{
                        return res.status(400).json({message:err.message});
                    })
    console.log(admins);
    return res.status(200).json({message:"admin created"});
}); 

module.exports = { 
    handleRegister,
    adminRegister 
};