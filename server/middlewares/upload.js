import multer from 'multer';

// store file in memory to upload directly to Supabase
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10mb
});

export default upload;
