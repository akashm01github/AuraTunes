const express = require('express');


const uploadFile = require('../service/storage.service')

const multer = require('multer');


const router = express.Router();

const songModel = require('../models/song.model');





const upload = multer({storage:multer.memoryStorage()});



router.post('/songs',upload.single("audio"), async(req,res)=>{
        console.log(req.body);
        console.log(req.file);
        const fileData = await uploadFile((req.file));
        
        const song = await songModel.create({
            title:req.body.title,
            artist:req.body.artist,
            audio:fileData.url,
            mood:req.body.mood
        })


        res.json({
            message : "Song Created Successfully",
            song:song
        })
})


router.get('/songs',async (req,res)=>{
    const {mood} = req.query;

    const song = await songModel.find({
        mood:mood
    })

    res.status(200).json({
        message : "Songs Fetched Successfully",
        song
    })

})




module.exports = router;