import prisma from '../lib/prisma.js';
import supabase from '../lib/supabase.js';
import asyncHandler from "express-async-handler";
import path from 'path';

const createStudyKit = asyncHandler(async(req, res) => {
    try {

        const {name} = req.body;
        const userId = req.user.id; //from protect middleware

        const studyKit = await prisma.studyKit.create({
            data: {
                name,
                userId
            },
        })
        
        res.status(201).json(studyKit);

    }catch(err){
        res.status(500).json({ 
            success: false,
            error: 'Not authorized',
            details: 'Failed to create StudyKit' 
        });
    }
})

const addSources = asyncHandler(async(req, res) => {
    try {
        
        const studyKitId = req.params.id; //from URL param
        if(!req.file || req.files.length === 0)   
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
                details: 'Please upload a file'
            });

        const uploadedSources = [];
        
        for(const file of req.files)
        {

            const fileExt = path.extname(file.originalname).toLowerCase();
            const fileName = `${Date.now()}_${fileExt}`;
            const bucket = 'sources';

            const {data, error} = await supabase.storage
                .from(bucket)
                .upload(fileName, file.buffer,{
                    contentType: file.mimetype,
                    upsert: true // Overwrite if file already exists
                })
            if(error) {
                console.error('Supabase upload error:', error);
                return res.status(500).json({
                    success: false,
                    error: 'File upload failed',
                    details: error.message
                });
            }

            const {publicURL} = supabase.storage.from(bucket).getPublicUrl(fileName);

            // Save source to database
            const source = await prisma.source.create({
                data: {
                    studyKitId,
                    fileUrl: publicUrl,
                    fileName: file.originalname,
                    fileType: fileExt.replace('.', ''),
                    fileSize: file.size,
                    storagePath: data.path,
                },
            });
            uploadedSources.push(source);
        }
        
        res.status(201).json({
            success: true,
            message: 'Source added successfully',
            source
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Server Error',
            details: 'Failed to create StudyKit' 
        });
    }
})


export {addSources, createStudyKit};

