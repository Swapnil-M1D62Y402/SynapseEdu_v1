// lib/ensureBucket.js
import supabase from './supabase.js';

let bucketChecked = false;

export async function ensureBucketExists(bucketName) {
  if (bucketChecked) return;

  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) {
    console.error('listBuckets error:', listErr);
    throw listErr;
  }

  const exists = (buckets || []).some(b => b.name === bucketName);
  if (!exists) {
    const { error: createErr } = await supabase.storage.createBucket(bucketName, {
      public: true, // or false if you prefer private and use signed URLs
      fileSizeLimit: 20 * 1024 * 1024, // optional
      allowedMimeTypes: ['application/pdf', 'text/plain'] // optional
    });
    if (createErr) {
      console.error('createBucket error:', createErr);
      throw createErr;
    }
    console.log('Created storage bucket:', bucketName);
  }

  bucketChecked = true;
}
