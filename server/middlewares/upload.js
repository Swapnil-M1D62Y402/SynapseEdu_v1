import multer from 'multer';

// store file in memory to upload directly to Supabase
const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
