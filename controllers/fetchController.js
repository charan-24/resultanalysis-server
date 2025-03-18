const axios = require('axios');
const Batch = require('../models/BatchModel');
const { scoreModel } = require('../models/ScoreModel');
const asyncHandler = require('express-async-handler');

/**
 * Take the difference between the dates and divide by milliseconds per day.
 * Round to nearest whole number to deal with DST.
 */
function datediff(first, second) {        
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

/**
 * new Date("dateString") is browser-dependent and discouraged, so we'll write
 * a simple parse function for U.S. date format (which does no error checking)
 */
function parseDate(str) {
    const year = str.getFullYear();
    const month = str.getMonth();
    const date = str.getDate();

    return new Date(year, month - 1, date);
}

const fetchNewBatchScores = asyncHandler(async (req,res)=>{
    const {batchname} = req.body;
    if(!batchname){
        return res.status(400).json({message:`all fields are required`});
    }
    const batch = await Batch.findOne({batchname}).exec();
    if(!batch){
        return res.status(400).json({message:`${batchname} not found`});
    }

    const users = batch.users.filter(user => user.role !== "Admin");
    for(let i=0;i<users.length;i++){
        //fetch from hackerrank
        const user = users[i];
        hr = await axios.get('https://resultanalysis-server.onrender.com/fetch/hr/'+user.profiles.hackerrank.username);
        hr = hr.data.payload;
        if(!hr.ds_score){
            hr.ds_score=0;
        }
        if(!hr.algo_score){
            hr.algo_score=0;
        }
        console.log(hr);

        user.profiles.hackerrank.lastUpdated = Date.now();
        user.lastUpdated = Date.now();

        const hrscore = scoreModel({
            dsScore: hr.ds_score,
            algoScore: hr.algo_score
        });
        user.profiles.hackerrank.scores = hrscore;

        //fetch from leetcode
        lc = await axios.get('https://resultanalysis-server.onrender.com/fetch/lc/'+user.profiles.leetcode.username);
        lc = lc.data.payload;
        if(!lc.noOfProblemsSolved){
            lc.noOfProblemsSolved = 0;
        }
        if(!lc.noOfContests){
            lc.noOfContests = 0;
        }
        if(!lc.rating){
            lc.rating = 0;
        }
        console.log(lc);
        user.profiles.leetcode.lastUpdated = Date.now();
        user.lastUpdated = Date.now();
        const lcscore = scoreModel({
            noOfProblemsSolved: lc.noOfProblemsSolved,
            noOfContests: lc.noOfContests,
            contestRating: lc.rating,
        }); 
        user.profiles.leetcode.scores = lcscore;
        

        //fetch from codechef
        cc = await axios.get('https://resultanalysis-server.onrender.com/fetch/cc/'+user.profiles.codechef.username);
        cc = cc.data.payload;
        if(!cc.noOfProblemsSolved){
            cc.noOfProblemsSolved = 0;
        }
        if(!cc.noOfContests){
            cc.noOfContests = 0;
        }
        if(!cc.rating){
            cc.rating = 0;
        }
        console.log(cc);

        user.profiles.codechef.lastUpdated = Date.now();
        user.lastUpdated = Date.now();  

        const ccscore = scoreModel({
            noOfProblemsSolved: cc.noOfProblemsSolved,
            noOfContests: cc.noOfContests,
            contestRating: cc.rating,
        });
        user.profiles.codechef.scores = ccscore;

        //fetch from codeforces
        cf = await axios.get('https://resultanalysis-server.onrender.com/fetch/cf/'+user.profiles.codeforces.username);
        cf = cf.data.payload;
        if(!cf.noOfProblemsSolved){
            cf.noOfProblemsSolved = 0;
        }
        if(!cf.noOfContests){
            cf.noOfContests = 0;
        }
        if(!cf.rating){
            cf.rating = 0;
        }
        console.log(cf);
        
        user.profiles.codeforces.lastUpdated = Date.now();
        user.lastUpdated = Date.now();

        const cfscore = scoreModel({
            noOfProblemsSolved: cf.noOfProblemsSolved,
            noOfContests: cf.noOfContests,
            contestRating: cf.rating,
        });
        user.profiles.codeforces.scores = cfscore;
        

        //fetch from interviewbit       
        ib = await axios.get('https://resultanalysis-server.onrender.com/fetch/ib/'+user.profiles.interviewbit.username);
        ib = ib.data.payload;
        if(!ib.noOfProblemsSolved){
            ib.noOfProblemsSolved = 0;
        }
        console.log(ib);
        user.profiles.interviewbit.lastUpdated = Date.now();
        user.lastUpdated = Date.now();
        const ibscore = scoreModel({
            noOfProblemsSolved: ib.noOfProblemsSolved,
        });
        user.profiles.interviewbit.scores = ibscore;
        
        //fetch from spoj     
        spoj = await axios.get('https://resultanalysis-server.onrender.com/fetch/spoj/'+user.profiles.spoj.username);
        spoj = spoj.data.payload;
        if(!spoj.noOfProblemsSolved){
            spoj.noOfProblemsSolved = 0;
        }
        console.log(spoj);
        user.profiles.spoj.lastUpdated = Date.now();
        user.lastUpdated = Date.now();
        const spojscore = scoreModel({
            noOfProblemsSolved: spoj.noOfProblemsSolved,
        });
        user.profiles.spoj.scores = spojscore;

        const currDate = new Date();
        const lastUpdatedDate = user.lastUpdated;
        // const lastUpdatedDate = new Date(24*3600*1000);
        if(lastUpdatedDate){
            const noofDays = datediff(parseDate(lastUpdatedDate), parseDate(currDate));
            console.log(noofDays);
            
            if(parseInt(noofDays)>=7){
                user.isActive = false;
            }
            else{
                user.isActive = true;
            }
        }
    }
    //save to db
    await batch.save();
    return res.status(200).json({success:"scores updated"});
});

const fetchScore = asyncHandler(async (req,res)=>{
    const {batchname} = req.body;
    if(!batchname){
        return res.status(400).json({message:`all fields are required`});
    }
    const batch = await Batch.findOne({batchname}).exec();
    if(!batch){
        return res.status(400).json({message:`${batchname} not found`});
    }

    const users = batch.users.filter(user => user.role !== "Admin");
    for(let i=0;i<users.length;i++){
        //fetch from hackerrank
        const user = users[i];
        hr = await axios.get('https://resultanalysis-server.onrender.com/fetch/hr/'+user.profiles.hackerrank.username);
        hr = hr.data.payload;
        if(!hr.ds_score){
            hr.ds_score=0;
        }
        if(!hr.algo_score){
            hr.algo_score=0;
        }
        console.log(hr);
        if(user.profiles.hackerrank.scores.dsScore != hr.ds_score || user.profiles.hackerrank.scores.algoScore != hr.algo_score){
            user.profiles.hackerrank.lastUpdated = Date.now();
            user.lastUpdated = Date.now();
        }
        const hrscore = scoreModel({
            dsScore: hr.ds_score,
            algoScore: hr.algo_score
        });
        user.profiles.hackerrank.scores = hrscore;

        //fetch from leetcode
        lc = await axios.get('https://resultanalysis-server.onrender.com/fetch/lc/'+user.profiles.leetcode.username);
        lc = lc.data.payload;
        if(!lc.noOfProblemsSolved){
            lc.noOfProblemsSolved = 0;
        }
        if(!lc.noOfContests){
            lc.noOfContests = 0;
        }
        if(!lc.rating){
            lc.rating = 0;
        }
        console.log(lc);
        if(user.profiles.leetcode.scores.noOfProblemsSolved !==lc.noOfProblemsSolved || user.profiles.leetcode.scores.noOfContests !== lc.noOfContests){
            user.profiles.leetcode.lastUpdated = Date.now();
            user.lastUpdated = Date.now();
        }
        const lcscore = scoreModel({
            noOfProblemsSolved: lc.noOfProblemsSolved,
            noOfContests: lc.noOfContests,
            contestRating: lc.rating,
        }); 
        user.profiles.leetcode.scores = lcscore;
        

        //fetch from codechef
        cc = await axios.get('https://resultanalysis-server.onrender.com/fetch/cc/'+user.profiles.codechef.username);
        cc = cc.data.payload;
        if(!cc.noOfProblemsSolved){
            cc.noOfProblemsSolved = 0;
        }
        if(!cc.noOfContests){
            cc.noOfContests = 0;
        }
        if(!cc.rating){
            cc.rating = 0;
        }
        console.log(cc);
        if(user.profiles.codechef.scores.noOfProblemsSolved !== cc.noOfProblemsSolved || user.profiles.codechef.scores.noOfContests !== cc.noOfContests){
            user.profiles.codechef.lastUpdated = Date.now();
            user.lastUpdated = Date.now();
        }      
        const ccscore = scoreModel({
            noOfProblemsSolved: cc.noOfProblemsSolved,
            noOfContests: cc.noOfContests,
            contestRating: cc.rating,
        });
        user.profiles.codechef.scores = ccscore;

        //fetch from codeforces
        cf = await axios.get('https://resultanalysis-server.onrender.com/fetch/cf/'+user.profiles.codeforces.username);
        cf = cf.data.payload;
        if(!cf.noOfProblemsSolved){
            cf.noOfProblemsSolved = 0;
        }
        if(!cf.noOfContests){
            cf.noOfContests = 0;
        }
        if(!cf.rating){
            cf.rating = 0;
        }
        console.log(cf);
        if(user.profiles.codeforces.scores.noOfProblemsSolved !== cf.noOfProblemsSolved || user.profiles.codeforces.scores.noOfContests !== cf.noOfContests){
            user.profiles.codeforces.lastUpdated = Date.now();
            user.lastUpdated = Date.now();
        }
        const cfscore = scoreModel({
            noOfProblemsSolved: cf.noOfProblemsSolved,
            noOfContests: cf.noOfContests,
            contestRating: cf.rating,
        });
        user.profiles.codeforces.scores = cfscore;
        

        //fetch from interviewbit       
        ib = await axios.get('https://resultanalysis-server.onrender.com/fetch/ib/'+user.profiles.interviewbit.username);
        ib = ib.data.payload;
        if(!ib.noOfProblemsSolved){
            ib.noOfProblemsSolved = 0;
        }
        console.log(ib);
        if(user.profiles.interviewbit.scores.noOfProblemsSolved !== ib.noOfProblemsSolved){
            user.profiles.interviewbit.lastUpdated = Date.now();
            user.lastUpdated = Date.now();
        }
        const ibscore = scoreModel({
            noOfProblemsSolved: ib.noOfProblemsSolved,
        });
        user.profiles.interviewbit.scores = ibscore;
        
        //fetch from spoj     
        spoj = await axios.get('https://resultanalysis-server.onrender.com/fetch/spoj/'+user.profiles.spoj.username);
        spoj = spoj.data.payload;
        if(!spoj.noOfProblemsSolved){
            spoj.noOfProblemsSolved = 0;
        }
        console.log(spoj);
        if(user.profiles.spoj.scores.noOfProblemsSolved !== spoj.noOfProblemsSolved){
            user.profiles.spoj.lastUpdated = Date.now();
            user.lastUpdated = Date.now();
        }
        const spojscore = scoreModel({
            noOfProblemsSolved: spoj.noOfProblemsSolved,
        });
        user.profiles.spoj.scores = spojscore;

        const currDate = new Date();
        const lastUpdatedDate = user.lastUpdated;
        // const lastUpdatedDate = new Date(24*3600*1000);
        if(lastUpdatedDate){
            const noofDays = datediff(parseDate(lastUpdatedDate), parseDate(currDate));
            console.log(noofDays);
            
            if(parseInt(noofDays)>=7){
                user.isActive = false;
            }
            else{
                user.isActive = true;
            }
        }
    }
    //save to db
    await batch.save();
    return res.status(200).json({success:"scores updated"});
});

const fetchNewUserScore = asyncHandler(async (req,res)=>{
    let {batchname,users} = req.body;
    if(!batchname){
        return res.status(400).json({message:`all fields are required`});
    }
    const batch = await Batch.findOne({batchname}).exec();
    if(!batch){
        return res.status(400).json({message:`${batchname} not found`});
    }
    
    let currusers = [];
    for(let i=0;i<users.length;i++){
        let temp = batch.users.filter(user => parseInt(user.rollno) === parseInt(users[i].rollno) && users[i].role !== 'Admin');
        if(temp.length>0)
            currusers.push(temp[0]);
    }
    console.log(currusers);
    for(let i=0;i<currusers.length;i++){
        //fetch from hackerrank
        // console.log(currusers[i].profiles);
        const user = currusers[i];
        hr = await axios.get('https://resultanalysis-server.onrender.com/fetch/hr/'+user.profiles.hackerrank.username);
        hr = hr.data.payload;
        if(!hr.ds_score){
            hr.ds_score=0;
        }
        if(!hr.algo_score){
            hr.algo_score=0;
        }
        console.log(hr);
        user.profiles.hackerrank.lastUpdated = Date.now();
        user.lastUpdated = Date.now();
        const hrscore = scoreModel({
            dsScore: hr.ds_score,
            algoScore: hr.algo_score
        });
        user.profiles.hackerrank.scores = hrscore;

        //fetch from leetcode
        lc = await axios.get('https://resultanalysis-server.onrender.com/fetch/lc/'+user.profiles.leetcode.username);
        lc = lc.data.payload;
        if(!lc.noOfProblemsSolved){
            lc.noOfProblemsSolved = 0;
        }
        if(!lc.noOfContests){
            lc.noOfContests = 0;
        }
        if(!lc.rating){
            lc.rating = 0;
        }
        console.log(lc);
        // if(user.profiles.leetcode.scores.noOfProblemsSolved !==lc.noOfProblemsSolved || user.profiles.leetcode.scores.noOfContests !== lc.noOfContests){
        //     user.profiles.leetcode.lastUpdated = Date.now();
        //     user.lastUpdated = Date.now();
        // }
        user.profiles.leetcode.lastUpdated = Date.now();
        user.lastUpdated = Date.now();
        const lcscore = scoreModel({
            noOfProblemsSolved: lc.noOfProblemsSolved,
            noOfContests: lc.noOfContests,
            contestRating: lc.rating,
        }); 
        user.profiles.leetcode.scores = lcscore;
        

        //fetch from codechef
        cc = await axios.get('https://resultanalysis-server.onrender.com/fetch/cc/'+user.profiles.codechef.username);
        cc = cc.data.payload;
        if(!cc.noOfProblemsSolved){
            cc.noOfProblemsSolved = 0;
        }
        if(!cc.noOfContests){
            cc.noOfContests = 0;
        }
        if(!cc.rating){
            cc.rating = 0;
        }
        console.log(cc);
        // if(user.profiles.codechef.scores.noOfProblemsSolved !== cc.noOfProblemsSolved || user.profiles.codechef.scores.noOfContests !== cc.noOfContests){
        //     user.profiles.codechef.lastUpdated = Date.now();
        //     user.lastUpdated = Date.now();
        // }      
        user.profiles.codechef.lastUpdated = Date.now();
        user.lastUpdated = Date.now();

        const ccscore = scoreModel({
            noOfProblemsSolved: cc.noOfProblemsSolved,
            noOfContests: cc.noOfContests,
            contestRating: cc.rating,
        });
        user.profiles.codechef.scores = ccscore;

        //fetch from codeforces
        cf = await axios.get('https://resultanalysis-server.onrender.com/fetch/cf/'+user.profiles.codeforces.username);
        cf = cf.data.payload;
        if(!cf.noOfProblemsSolved){
            cf.noOfProblemsSolved = 0;
        }
        if(!cf.noOfContests){
            cf.noOfContests = 0;
        }
        if(!cf.rating){
            cf.rating = 0;
        }
        console.log(cf);
        // if(user.profiles.codeforces.scores.noOfProblemsSolved !== cf.noOfProblemsSolved || user.profiles.codeforces.scores.noOfContests !== cf.noOfContests){
        //     user.profiles.codeforces.lastUpdated = Date.now();
        //     user.lastUpdated = Date.now();
        // }
        user.profiles.codeforces.lastUpdated = Date.now();
        user.lastUpdated = Date.now();
        const cfscore = scoreModel({
            noOfProblemsSolved: cf.noOfProblemsSolved,
            noOfContests: cf.noOfContests,
            contestRating: cf.rating,
        });
        user.profiles.codeforces.scores = cfscore;
        

        //fetch from interviewbit       
        ib = await axios.get('https://resultanalysis-server.onrender.com/fetch/ib/'+user.profiles.interviewbit.username);
        ib = ib.data.payload;
        if(!ib.noOfProblemsSolved){
            ib.noOfProblemsSolved = 0;
        }
        console.log(ib);
        // if(user.profiles.interviewbit.scores.noOfProblemsSolved !== ib.noOfProblemsSolved){
        //     user.profiles.interviewbit.lastUpdated = Date.now();
        //     user.lastUpdated = Date.now();
        // }
        user.profiles.interviewbit.lastUpdated = Date.now();
        user.lastUpdated = Date.now();
        const ibscore = scoreModel({
            noOfProblemsSolved: ib.noOfProblemsSolved,
        });
        user.profiles.interviewbit.scores = ibscore;
        
        //fetch from spoj     
        spoj = await axios.get('https://resultanalysis-server.onrender.com/fetch/spoj/'+user.profiles.spoj.username);
        spoj = spoj.data.payload;
        if(!spoj.noOfProblemsSolved){
            spoj.noOfProblemsSolved = 0;
        }
        console.log(spoj);
        // if(user.profiles.spoj.scores.noOfProblemsSolved !== spoj.noOfProblemsSolved){
        //     user.profiles.spoj.lastUpdated = Date.now();
        //     user.lastUpdated = Date.now();
        // }
        user.profiles.spoj.lastUpdated = Date.now();
        user.lastUpdated = Date.now();
        const spojscore = scoreModel({
            noOfProblemsSolved: spoj.noOfProblemsSolved,
        });
        user.profiles.spoj.scores = spojscore;

        const currDate = new Date();
        const lastUpdatedDate = user.lastUpdated;
        // const lastUpdatedDate = new Date(24*3600*1000);
        if(lastUpdatedDate){
            const noofDays = datediff(parseDate(lastUpdatedDate), parseDate(currDate));
            console.log(noofDays);
            
            if(parseInt(noofDays)>=7){
                user.isActive = false;
            }
            else{
                user.isActive = true;
            }
        }
    }
    //save to db
    await batch.save();
    return res.status(200).json({success:"scores updated"});
});

const fetchScoreIndividual = asyncHandler(async(req,res)=>{
    const {rollno} = req.body;
    if(!rollno){
        return res.status(400).json({message:`all fields are required`});
    }
    let batches = await Batch.find({}).exec();
    if(!batches){
        return res.status(400).json({message:"batches not found"});
    }
    // console.log(batches);
    for(let i=0;i<batches.length;i++){
        if(!batches[i])
            return res.sendStatus(401);
        let user = batches[i].users.filter(user => user.rollno === rollno);
        console.log(batches[i].users);
        if(!user){
            return res.status(401).json({message:"user not found"});
        }

        //fetch from hackerrank
        // console.log(user.profiles.hackerrank.scores);
        hr = await axios.get('https://resultanalysis-server.onrender.com/fetch/hr/'+user.profiles.hackerrank.username);
        hr = hr.data.payload;
        if(!hr.ds_score){
            hr.ds_score=0;
        }
        if(!hr.algo_score){
            hr.algo_score=0;
        }
        console.log(hr);
        if(user.profiles.hackerrank.scores.dsScore != hr.ds_score || user.profiles.hackerrank.scores.algoScore != hr.algo_score){
            user.profiles.hackerrank.lastUpdated = Date.now();
            user.lastUpdated = Date.now();
        }
        const hrscore = scoreModel({
            dsScore: hr.ds_score,
            algoScore: hr.algo_score
        });
        user.profiles.hackerrank.scores = hrscore;

        //fetch from leetcode
        lc = await axios.get('https://resultanalysis-server.onrender.com/fetch/lc/'+user.profiles.leetcode.username);
        lc = lc.data.payload;
        if(!lc.noOfProblemsSolved){
            lc.noOfProblemsSolved = 0;
        }
        if(!lc.noOfContests){
            lc.noOfContests = 0;
        }
        if(!lc.rating){
            lc.rating = 0;
        }
        console.log(lc);
        if(user.profiles.leetcode.scores?.noOfProblemsSolved){
            if(user.profiles.leetcode.scores.noOfProblemsSolved !==lc.noOfProblemsSolved || user.profiles.leetcode.scores.noOfContests !== lc.noOfContests){
                user.profiles.leetcode.lastUpdated = Date.now();
                user.lastUpdated = Date.now();
            }
        }

        const lcscore = scoreModel({
            noOfProblemsSolved: lc.noOfProblemsSolved,
            noOfContests: lc.noOfContests,
            contestRating: lc.rating,
        }); 
        user.profiles.leetcode.scores = lcscore;
        

        //fetch from codechef
        cc = await axios.get('https://resultanalysis-server.onrender.com/fetch/cc/'+user.profiles.codechef.username);
        cc = cc.data.payload;
        if(!cc.noOfProblemsSolved){
            cc.noOfProblemsSolved = 0;
        }
        if(!cc.noOfContests){
            cc.noOfContests = 0;
        }
        if(!cc.rating){
            cc.rating = 0;
        }
        console.log(cc);
        if(user.profiles.codechef.scores?.noOfProblemsSolved){
            if(user.profiles.codechef.scores.noOfProblemsSolved !== cc.noOfProblemsSolved || user.profiles.codechef.scores.noOfContests !== cc.noOfContests){
                user.profiles.codechef.lastUpdated = Date.now();
                user.lastUpdated = Date.now();
            } 
        }     
        const ccscore = scoreModel({
            noOfProblemsSolved: cc.noOfProblemsSolved,
            noOfContests: cc.noOfContests,
            contestRating: cc.rating,
        });
        user.profiles.codechef.scores = ccscore;

        //fetch from codeforces
        cf = await axios.get('https://resultanalysis-server.onrender.com/fetch/cf/'+user.profiles.codeforces.username);
        cf = cf.data.payload;
        if(!cf.noOfProblemsSolved){
            cf.noOfProblemsSolved = 0;
        }
        if(!cf.noOfContests){
            cf.noOfContests = 0;
        }
        if(!cf.rating){
            cf.rating = 0;
        }
        console.log(cf);
        if(user.profiles.codeforces.scores?.noOfProblemsSolved){
            if(user.profiles.codeforces.scores.noOfProblemsSolved !== cf.noOfProblemsSolved || user.profiles.codeforces.scores.noOfContests !== cf.noOfContests){
                user.profiles.codeforces.lastUpdated = Date.now();
                user.lastUpdated = Date.now();
            }
        }
        const cfscore = scoreModel({
            noOfProblemsSolved: cf.noOfProblemsSolved,
            noOfContests: cf.noOfContests,
            contestRating: cf.rating,
        });
        user.profiles.codeforces.scores = cfscore;
        

        //fetch from interviewbit       
        ib = await axios.get('https://resultanalysis-server.onrender.com/fetch/ib/'+user.profiles.interviewbit.username);
        ib = ib.data.payload;
        if(!ib.noOfProblemsSolved){
            ib.noOfProblemsSolved = 0;
        }
        console.log(ib);
        if(user.profiles.interviewbit.scores?.noOfProblemsSolved){
            if(user.profiles.interviewbit.scores.noOfProblemsSolved !== ib.noOfProblemsSolved){
                user.profiles.interviewbit.lastUpdated = Date.now();
                user.lastUpdated = Date.now();
            }
        }
        const ibscore = scoreModel({
            noOfProblemsSolved: ib.noOfProblemsSolved,
        });
        user.profiles.interviewbit.scores = ibscore;
        
        //fetch from spoj     
        spoj = await axios.get('https://resultanalysis-server.onrender.com/fetch/spoj/'+user.profiles.spoj.username);
        spoj = spoj.data.payload;
        if(!spoj.noOfProblemsSolved){
            spoj.noOfProblemsSolved = 0;
        }
        console.log(spoj);
        if(user.profiles.spoj.scores?.noOfProblemsSolved){
            if(user.profiles.spoj.scores.noOfProblemsSolved !== spoj.noOfProblemsSolved){
                user.profiles.spoj.lastUpdated = Date.now();
                user.lastUpdated = Date.now();
            }
        }
        const spojscore = scoreModel({
            noOfProblemsSolved: spoj.noOfProblemsSolved,
        });
        user.profiles.spoj.scores = spojscore;

        const currDate = new Date();
        // const lastUpdatedDate = user.lastUpdated;
        const lastUpdatedDate = new Date(24*3600*1000);
        if(lastUpdatedDate){
            const noofDays = datediff(parseDate(lastUpdatedDate), parseDate(currDate));
            console.log(noofDays);
            
            if(parseInt(noofDays)>=7){
                user.isActive = false;
            }
            else{
                user.isActive = true;
            }
            user.lastUpdated = lastUpdatedDate;
        }
    }

    //save to db
    await batches.save();
    return res.status(200).json({success:"scores updated"});
});

const getScores = asyncHandler(async (req,res)=>{
    const batchname = req.params.batchname;
    if(!batchname){
        return res.status(400).json({message:"batchname required"});
    }
    const batch = await Batch.findOne({batchname}).exec();
    if(!batch){
        return res.status(400).json({message:`batchname not found`});
    }
    const users = batch.users.filter(user => user.role !== "Admin");
    if(!Array.isArray(users) || users.length===0){
        return res.status(400).json({message:"users required"});
    }
    // const currDate = new Date();
    // console.log(currDate);
    const scoresData = [];
    for(let i=0;i<users.length;i++){
        let user = users[i];
        // console.log(user);
        const resObj = {};
        // console.log(user);
        resObj["fullname"] = user.fullname;
        resObj["rollno"] = user.rollno;
        resObj["lastlogin"] = user.lastLogin;
        resObj["lastUpdated"] = user.lastUpdated;
        resObj["isActive"] = user.isActive;
        resObj["total"] = 0;
        user=user.profiles;
        // console.log(user);
        const hrscore = (user.hackerrank.scores.dsScore + user.hackerrank.scores.algoScore) || 0;
        resObj["hacker"] = hrscore;
        resObj["total"] += hrscore;
        user.hackerrank.scores.total = Math.ceil(hrscore);

        const spojscore = user.spoj.scores.noOfProblemsSolved * 20 || 0;
        resObj["spoj"] = spojscore;
        resObj["total"] += spojscore;
        user.spoj.scores.total = Math.ceil(spojscore);

        const ibscore = user.interviewbit.scores.noOfProblemsSolved / 3 || 0;
        resObj["interviewbit"] = Math.ceil(ibscore);
        resObj["total"] += resObj["interviewbit"];
        user.interviewbit.scores.total = Math.ceil(ibscore);

        let lcscore = user.leetcode.scores.noOfProblemsSolved * 50 || 0;
        if(user.leetcode.scores.noOfContests>3 && user.leetcode.scores.contestRating>1300){
            lcscore += ((user.leetcode.scores.contestRating-1300)*(user.leetcode.scores.contestRating-1300))/30;
        }
        resObj["leet"] = Math.ceil(lcscore);
        resObj["total"] += resObj["leet"];
        user.leetcode.scores.total = Math.ceil(lcscore);

        let ccscore = user.codechef.scores.noOfProblemsSolved * 10 || 0;
        if(user.codechef.scores.noOfContests>3 && user.codechef.scores.contestRating>1300){
            ccscore += ((user.codechef.scores.contestRating-1300)*(user.codechef.scores.contestRating-1300))/30;
        }
        resObj["chef"] = Math.ceil(ccscore);
        resObj["total"] += resObj["chef"];
        user.codechef.scores.total = Math.ceil(ccscore);

        let cfscore = user.codeforces.scores.noOfProblemsSolved * 10 || 0;
        if(user.codeforces.scores.noOfContests>3 && user.codeforces.scores.contestRating>1200){
            cfscore += ((user.codeforces.scores.contestRating-1200)*(user.codeforces.scores.contestRating-1200))/30;
        }
        resObj["forces"] = Math.ceil(cfscore);
        resObj["total"] += resObj["forces"];
        user.codeforces.scores.total = Math.ceil(cfscore);
        users[i].total = resObj["total"];
        scoresData.push(resObj);
        // console.log(resObj);
    }
    await batch.save();
    return  res.status(200).json(scoresData);
});

const getAllBatchScores = asyncHandler(async (req,res)=>{
    const batches = await Batch.find({}).exec();
    if(batches.length===0)
        return res.status(201).json([]);
    const scoresData = [];
    for(let i=0;i<batches.length;i++){
        const resObj = {}
        const batch = batches[i];
        const arr=[];
        await axios.get('https://resultanalysis-server.onrender.com/score/getScores/'+batch.batchname)
                    .then(res=>{
                        res.data.forEach((item,index)=>{
                            arr.push({
                               rollno: item.rollno,
                               fullname: item.fullname,
                               total: item.total 
                            });
                        })
                        if(arr.length>0)
                            scoresData.push(...arr);
                    })
                    .catch(err=>{
                        console.error(err);
                    })

    }
    return res.status(200).json(scoresData);
})

const getIndScore = asyncHandler(async (req,res)=>{
    const rollno = req.params.rollno;
    if(!rollno){
        return res.status(400).json({message:"rollno required"});
    }
    const batch = await Batch.find({}).exec();
    for(let i=0;i<batch.length;i++){
        const users = batch[i].users.filter(user => user.role !== "Admin");;
        const foundUser = users.find(user => user.rollno === rollno);
        if(foundUser){
            const resObj = {}
            resObj["fullname"] = foundUser.fullname;
            resObj["rollno"] = foundUser.rollno;
            resObj["total"] = foundUser.total;  
            const scoreObj = {
                hackerrank:foundUser.profiles.hackerrank.scores.total || 0,
                leetcode:foundUser.profiles.leetcode.scores.total || 0,
                codechef:foundUser.profiles.codechef.scores.total || 0,
                codeforces:foundUser.profiles.codeforces.scores.total || 0,
                spoj:foundUser.profiles.spoj.scores.total || 0,
                interviewbit:foundUser.profiles.interviewbit.scores.total || 0,
                lcContestRating:foundUser.profiles.leetcode.scores.contestRating || 0,
                ccContestRating:foundUser.profiles.codechef.scores.contestRating || 0,
                cfContestRating:foundUser.profiles.codeforces.scores.contestRating || 0,
                noOfProblemsSolvedhr: Math.floor(foundUser.profiles.hackerrank.scores.algoScore/20 + foundUser.profiles.hackerrank.scores.dsScore/20) || 0,
                noOfProblemsSolvedlc:foundUser.profiles.leetcode.scores.noOfProblemsSolved || 0,
                noOfProblemsSolvedcc:foundUser.profiles.codechef.scores.noOfProblemsSolved || 0,
                noOfProblemsSolvedcf:foundUser.profiles.codeforces.scores.noOfProblemsSolved || 0,
                noOfProblemsSolvedspoj:foundUser.profiles.spoj.scores.noOfProblemsSolved || 0,
                noOfProblemsSolvedib:foundUser.profiles.interviewbit.scores.noOfProblemsSolved || 0,
                noOfContestshr:foundUser.profiles.hackerrank.scores.noOfContests || 0,
                noOfContestslc:foundUser.profiles.leetcode.scores.noOfContests || 0,
                noOfContestscc:foundUser.profiles.codechef.scores.noOfContests || 0,
                noOfContestscf:foundUser.profiles.codeforces.scores.noOfContests || 0,
                noOfContestsspoj:foundUser.profiles.spoj.scores.noOfContests || 0,
                noOfContestsib:foundUser.profiles.interviewbit.scores.noOfContests || 0,
            }
            resObj["scoreObj"] = scoreObj;
           return res.status(200).json(resObj); 
        }
    }
    return res.status(400).json({message:`${rollno} not found`});
});

module.exports = {
    fetchNewBatchScores,
    fetchScore,
    fetchScoreIndividual,
    fetchNewUserScore,
    getScores,
    getAllBatchScores,
    getIndScore
}

