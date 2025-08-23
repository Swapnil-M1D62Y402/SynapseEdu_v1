// controllers/studyKitController.js
import prisma from '../lib/prisma.js';
import supabase from '../lib/supabase.js';
import asyncHandler from "express-async-handler";
import path from 'path';
import { nanoid } from 'nanoid';
import { loadFromWeb, loadFromYouTube } from '../utils/loaders.js';
import jwt from 'jsonwebtoken'; // add at top of file if not present
import { ensureBucketExists } from '../lib/ensureBucket.js';

const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'sources';

// async function uploadTextToStorage(userId, studyKitId, filenameBase, textContent) {
//   const ext = ".txt";
//   const storagePath = `${userId}/${studyKitId}/${Date.now()}_${nanoid(6)}_${filenameBase}${ext}`;

//   const { data: uploadData, error: uploadError } = await supabase.storage
//     .from(bucket)
//     .upload(storagePath, Buffer.from(textContent, "utf-8"), {
//       contentType: "text/plain",
//       upsert: false,
//     });

//   if (uploadError) throw uploadError;

//   const { data: urlData, error: urlError } = supabase.storage
//     .from(bucket)
//     .getPublicUrl(storagePath);

//   if (urlError) throw urlError;

//   return {
//     storagePath: uploadData?.path || storagePath,
//     publicUrl: urlData?.publicUrl || null
//   };
// }

async function uploadTextToStorage(userId, studyKitId, filenameBase, textContent) {
  const ext = '.txt';
  const storagePath = `${userId}/${studyKitId}/${Date.now()}_${nanoid(6)}_${filenameBase}${ext}`;

  // Ensure bucket exists (noop if ensureBucketExists is implemented to be idempotent)
  try {
    if (typeof ensureBucketExists === 'function') {
      await ensureBucketExists(bucket);
    }
  } catch (err) {
    // don't crash here — we'll attempt upload and surface the real error if it occurs
    console.warn('ensureBucketExists failed (continuing):', err?.message || err);
  }

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, Buffer.from(textContent, 'utf8'), {
      contentType: 'text/plain',
      upsert: false,
    });

  if (uploadError) {
    // normalize error for upstream handling
    throw new Error(`Supabase upload error: ${uploadError?.message || JSON.stringify(uploadError)}`);
  }

  const { data: urlData, error: urlError } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);

  if (urlError) {
    throw new Error(`Failed to get public URL: ${urlError?.message || JSON.stringify(urlError)}`);
  }

  return {
    storagePath: uploadData?.path || storagePath,
    publicUrl: urlData?.publicUrl || null,
  };
}



// const createStudyKit = asyncHandler(async(req, res) => {
//   try {
//     const { name } = req.body;
//     const userId = req.user.id;

//     const studyKit = await prisma.studyKit.create({
//       data: { name, userId }
//     });

//     res.status(201).json(studyKit);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       error: 'Server error',
//       details: err.message
//     });
//   }
// });

const createStudyKit = asyncHandler(async (req, res) => {
  try {
    const { name, studyGuideSummary } = req.body;

    // Basic validation
    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, error: "Missing or invalid 'name' in request body" });
    }

    // protect middleware should attach req.user
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    // Use empty string if not provided to satisfy non-null DB column
    const summaryValue = typeof studyGuideSummary === "string" ? studyGuideSummary : "";

    const studyKit = await prisma.studyKit.create({
      data: {
        name,
        userId,
        studyGuideSummary: summaryValue
      },
    });

    return res.status(201).json(studyKit);
  } catch (err) {
    console.error("createStudyKit error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      details: err?.message ?? String(err),
    });
  }
});


// const addSources = asyncHandler(async(req, res) => {
//   try {
//     // Expect studyKitId in the form-data body (simpler for frontend)
//     const studyKitId = req.body.studyKitId;
//     if (!studyKitId) {
//       return res.status(400).json({ success: false, error: 'studyKitId required' });
//     }

//     const files = req.files || [];
//     if (files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: 'No files uploaded',
//         details: 'Please upload at least one file'
//       });
//     }

//     // Map uploads in parallel (robustly)
//     const uploadPromises = files.map(async (file) => {
//       const ext = path.extname(file.originalname).toLowerCase();
//       const filenameOnStorage = `${req.user.id}/${studyKitId}/${Date.now()}_${nanoid(6)}${ext}`;

//       const { data: uploadData, error: uploadError } = await supabase.storage
//         .from(bucket)
//         .upload(filenameOnStorage, file.buffer, {
//           contentType: file.mimetype,
//           upsert: false
//         });

//       if (uploadError) throw uploadError;

//       // getPublicUrl returns { data: { publicUrl } } in supabase-js
//       const { data: urlData, error: urlError } = supabase.storage
//         .from(bucket)
//         .getPublicUrl(filenameOnStorage);

//       if (urlError) throw urlError;
//       const publicUrl = urlData?.publicUrl || null;

//       const sourceRow = await prisma.source.create({
//         data: {
//           studyKitId,
//           fileUrl: publicUrl,
//           fileName: file.originalname,
//           fileType: ext.replace('.', ''),
//           fileSize: file.size,
//           storagePath: uploadData?.path || filenameOnStorage,
//           processed: false
//         }
//       });

//       return sourceRow;
//     });

//     const settled = await Promise.allSettled(uploadPromises);

//     const uploadedSources = settled
//       .filter(s => s.status === 'fulfilled')
//       .map(s => s.value);

//     const errors = settled
//       .filter(s => s.status === 'rejected')
//       .map(s => s.reason?.message || String(s.reason));

//     res.status(201).json({
//       success: errors.length === 0,
//       uploadedCount: uploadedSources.length,
//       uploadedSources,
//       errors
//     });

//   } catch (error) {
//     console.error('addSources error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Server Error',
//       details: error.message
//     });
//   }
// });

// controllers/studyKitController.js (replace only addSources with this)


const addSources = asyncHandler(async (req, res) => {
  await ensureBucketExists(bucket);
  try {
    // Log incoming headers/body/files for debugging
    console.log("===== addSources called =====");
    console.log("Headers:", {
      authorization: req.headers.authorization,
      'content-type': req.headers['content-type'],
    });
    // req.body for multipart might be empty depending on multer timing; we'll log keys
    console.log("Body keys:", Object.keys(req.body || {}));
    console.log("Files present:", Array.isArray(req.files) ? req.files.length : req.files);

    // If protect middleware isn't being used or req.user undefined, try decode token
    if (!req.user) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          console.log("Decoded token payload:", decoded);
          // optional: set req.user minimally so later code that uses req.user.id works
          req.user = { id: decoded.userId };
        } catch (err) {
          console.warn("Token verify failed:", err.message);
        }
      } else {
        console.warn("No req.user and no Bearer token present");
      }
    } else {
      console.log("req.user:", req.user);
    }

    // Now get studyKitId from either form-data or query (robust)
    let studyKitId = req.body?.studyKitId ?? req.query?.studyKitId ?? req.params?.studyKitId;
    if (!studyKitId) {
      console.warn("Missing studyKitId in request (body/query/params)");
      return res.status(400).json({ success: false, error: 'studyKitId required' });
    }

    const files = req.files || [];
    if (files.length === 0) {
      console.warn("No files attached in request.files");
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
        details: 'Please upload at least one file'
      });
    }

    // Upload files in parallel (keep try/catch for each)
    const uploadPromises = files.map(async (file) => {
      console.log("Uploading file:", file.originalname, "size:", file.size, "mimetype:", file.mimetype);
      const ext = path.extname(file.originalname).toLowerCase();
      const userId = req.user?.id ?? 'anonymous';
      const filenameOnStorage = `${userId}/${studyKitId}/${Date.now()}_${nanoid(6)}${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filenameOnStorage, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase upload error for", file.originalname, uploadError);
        throw new Error(`Supabase upload failed: ${uploadError.message || JSON.stringify(uploadError)}`);
      }
      console.log("Supabase uploaded. uploadData:", uploadData);

      const { data: urlData, error: urlError } = supabase.storage
        .from(bucket)
        .getPublicUrl(filenameOnStorage);

      if (urlError) {
        console.error("Supabase getPublicUrl error:", urlError);
        throw new Error(`Failed to get public url: ${urlError.message || JSON.stringify(urlError)}`);
      }
      const publicUrl = urlData?.publicUrl || null;
      console.log("Public URL:", publicUrl);

      // Save to DB
      const sourceRow = await prisma.source.create({
        data: {
          studyKitId,
          fileUrl: publicUrl,
          fileName: file.originalname,
          fileType: ext.replace('.', ''),
          fileSize: file.size,
          storagePath: uploadData?.path || filenameOnStorage,
          processed: false
        }
      });

      console.log("DB source created:", sourceRow.id);
      return sourceRow;
    });

    const settled = await Promise.allSettled(uploadPromises);

    const uploadedSources = settled
      .filter(s => s.status === 'fulfilled')
      .map(s => s.value);

    const errors = settled
      .filter(s => s.status === 'rejected')
      .map(s => s.reason?.message || String(s.reason));

    console.log("Upload summary: uploadedCount=", uploadedSources.length, "errors:", errors);

    res.status(201).json({
      success: errors.length === 0,
      uploadedCount: uploadedSources.length,
      uploadedSources,
      errors
    });

  } catch (error) {
    console.error('addSources error (catch):', error);
    res.status(500).json({
      success: false,
      error: 'Server Error',
      details: error.message
    });
  }
});


// const addLinkSource = asyncHandler(async (req, res) => {
//   try {
//     const { studyKitId, url, kind } = req.body; // kind optional: 'youtube'|'web'
//     const userId = req.user.id;

//     if (!studyKitId || !url) {
//       return res.status(400).json({ success: false, error: "studyKitId and url required" });
//     }

//     // Attempt extraction
//     let text = null;
//     try {
//       if (kind === 'youtube' || /youtu\.?be/.test(url)) {
//         text = await loadFromYouTube(url);
//       } else {
//         text = await loadFromWeb(url);
//       }
//     } catch (err) {
//       console.warn("Extraction failed:", err?.message || err);
//       text = null;
//     }

//     // If we got meaningful text, upload as .txt and create Source row pointing to it
//     if (text && text.trim().length > 50) {
//       const filenameBase = (new URL(url).hostname || 'source').replace(/\W+/g, '_').slice(0, 40);
//       const uploadRes = await uploadTextToStorage(userId, studyKitId, filenameBase, text);

//       const sourceRow = await prisma.source.create({
//         data: {
//           studyKitId,
//           fileUrl: uploadRes.publicUrl,
//           fileName: `${filenameBase}.txt`,
//           fileType: 'text',
//           fileSize: Buffer.byteLength(text, 'utf8'),
//           storagePath: uploadRes.storagePath,
//           processed: false
//         }
//       });

//       // Fire-and-forget: notify Python to ingest (do not block response)
//       (async () => {
//         try {
//           // create signed url for Python (valid for 1 hour)
//           const { data: signedData, error: signedErr } = await supabase.storage
//             .from(bucket)
//             .createSignedUrl(uploadRes.storagePath, 60 * 60);
//           if (!signedErr && signedData?.signedUrl) {
//             await ragIngest({
//               studyKitId,
//               sourceId: sourceRow.id,
//               signedUrl: signedData.signedUrl,
//               fileType: 'text'
//             });
//             // option: update processed=true when ragIngest succeeds (you can do that here)
//           }
//         } catch (err) {
//           console.warn("ragIngest (background) failed:", err?.message || err);
//         }
//       })();

//       return res.status(201).json({ success: true, source: sourceRow, extracted: true });
//     }

//     // Fallback: create a link-only Source row (no text uploaded)
//     const sourceLinkRow = await prisma.source.create({
//       data: {
//         studyKitId,
//         fileUrl: url,
//         fileName: url.slice(0, 255),
//         fileType: 'link',
//         storagePath: null,
//         processed: false
//       }
//     });

//     res.status(201).json({
//       success: true,
//       source: sourceLinkRow,
//       extracted: false,
//       note: 'No extractable text — stored as link'
//     });

//   } catch (err) {
//     console.error("addLinkSource error:", err);
//     res.status(500).json({ success: false, error: 'Server error', details: err.message });
//   }
// });

// const addLinkSource = asyncHandler(async (req, res) => {
//   try {
//     const { studyKitId, url, kind } = req.body;
//     const userId = req.user.id;

//     if (!studyKitId || !url) {
//       return res.status(400).json({ success: false, error: "studyKitId and url required" });
//     }

//     // Extract text
//     let text = null;
//     try {
//       if (kind === "youtube" || /youtu\.?be/.test(url)) {
//         text = await loadFromYouTube(url);
//       } else {
//         text = await loadFromWeb(url);
//       }
//     } catch (err) {
//       console.warn("Extraction failed:", err?.message || err);
//       text = null;
//     }

//     // If extraction succeeded, save as .txt file
//     if (text && text.trim().length > 50) {
//       const filenameBase = (new URL(url).hostname || "source")
//         .replace(/\W+/g, "_")
//         .slice(0, 40);

//       const uploadRes = await uploadTextToStorage(userId, studyKitId, filenameBase, text);

//       const sourceRow = await prisma.source.create({
//         data: {
//           studyKitId,
//           fileUrl: uploadRes.publicUrl,
//           fileName: `${filenameBase}.txt`,
//           fileType: "text",
//           fileSize: Buffer.byteLength(text, "utf8"),
//           storagePath: uploadRes.storagePath,
//           processed: false,
//         },
//       });

//       return res.status(201).json({
//         success: true,
//         source: sourceRow,
//         extracted: true,
//       });
//     }

//     // Otherwise, fallback: just store the link
//     const sourceLinkRow = await prisma.source.create({
//       data: {
//         studyKitId,
//         fileUrl: url,
//         fileName: url.slice(0, 255),
//         fileType: "link",
//         storagePath: null,
//         processed: false,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       source: sourceLinkRow,
//       extracted: false,
//       note: "No extractable text — stored as link only",
//     });
//   } catch (err) {
//     console.error("addLinkSource error:", err);
//     res.status(500).json({ success: false, error: "Server error", details: err.message });
//   }
// });


// const addTextSource = asyncHandler(async (req, res) => {
//   try {
//     const { studyKitId, text, title } = req.body;
//     const userId = req.user.id;

//     if (!studyKitId || !text) return res.status(400).json({ success: false, error: 'studyKitId and text required' });

//     const filenameBase = (title || 'pasted_text').replace(/\s+/g, '_').slice(0, 40);
//     const uploadRes = await uploadTextToStorage(userId, studyKitId, filenameBase, text);

//     const sourceRow = await prisma.source.create({
//       data: {
//         studyKitId,
//         fileUrl: uploadRes.publicUrl,
//         fileName: `${filenameBase}.txt`,
//         fileType: 'text',
//         fileSize: Buffer.byteLength(text, 'utf8'),
//         storagePath: uploadRes.storagePath,
//         processed: false
//       }
//     });

//     // background ingest
//     (async () => {
//       try {
//         const { data: signedData, error: signedErr } = await supabase.storage
//           .from(bucket)
//           .createSignedUrl(uploadRes.storagePath, 60 * 60);
//         if (!signedErr && signedData?.signedUrl) {
//           await ragIngest({ studyKitId, sourceId: sourceRow.id, signedUrl: signedData.signedUrl, fileType: 'text' });
//         }
//       } catch (err) {
//         console.warn("ragIngest (background) failed:", err?.message || err);
//       }
//     })();

//     res.status(201).json({ success: true, source: sourceRow });

//   } catch (err) {
//     console.error("addTextSource error:", err);
//     res.status(500).json({ success: false, error: 'Server error', details: err.message });
//   }
// });



// export async function addTextSource(studyKitId, text, title = "Untitled Text") {
//   if (!text || typeof text !== "string") {
//     throw new Error("addTextSource: text must be a non-empty string");
//   }
//   if (!studyKitId) {
//     throw new Error("addTextSource: studyKitId is required");
//   }

//   // 1. Create source record in DB
//   const source = await prisma.source.create({
//     data: {
//       type: "TEXT",
//       title,
//       studyKitId,
//     },
//   });

//   // 2. Ingest text 
//   try {
//     await ingestText(studyKitId, source.id, text);
//   } catch (err) {
//     console.error("❌ RAG ingestion failed:", err);
//     // Optionally delete the source if ingestion fails
//     // await prisma.source.delete({ where: { id: source.id } });
//     throw new Error("RAG ingestion failed, source not added");
//   }

//   return source;
// }

const addLinkSource = asyncHandler(async (req, res) => {
  try {
    const { studyKitId, url, kind } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Not authorized' });

    if (!studyKitId || !url) {
      return res.status(400).json({ success: false, error: 'studyKitId and url required' });
    }

    // Attempt text extraction using loader.js
    let text = null;
    try {
      if (kind === 'youtube' || /youtu\.?be/.test(url)) {
        text = await loadFromYouTube(url);
      } else {
        text = await loadFromWeb(url);
      }
    } catch (err) {
      console.warn('Extraction failed:', err?.message || err);
      text = null;
    }

    if (text && text.trim().length > 50) {
      const filenameBase = (new URL(url).hostname || 'source').replace(/\W+/g, '_').slice(0, 40);
      const uploadRes = await uploadTextToStorage(userId, studyKitId, filenameBase, text);

      const sourceRow = await prisma.source.create({
        data: {
          studyKitId,
          fileUrl: uploadRes.publicUrl,
          fileName: `${filenameBase}.txt`,
          fileType: 'text',
          fileSize: Buffer.byteLength(text, 'utf8'),
          storagePath: uploadRes.storagePath,
          processed: false,
        },
      });

      return res.status(201).json({ success: true, source: sourceRow, extracted: true });
    }

    // fallback: store link-only
    const sourceLinkRow = await prisma.source.create({
      data: {
        studyKitId,
        fileUrl: url,
        fileName: url.slice(0, 255),
        fileType: 'link',
        storagePath: null,
        processed: false,
      },
    });

    return res.status(201).json({
      success: true,
      source: sourceLinkRow,
      extracted: false,
      note: 'No extractable text — stored as link',
    });
  } catch (err) {
    console.error('addLinkSource error:', err);
    return res.status(500).json({ success: false, error: 'Server error', details: err?.message ?? String(err) });
  }
});

/**
 * addTextSource
 * - receives { studyKitId, text, title? } in JSON
 * - uploads the text as .txt to Supabase and creates a Source row
 * - does NOT call any embedding/ingest pipeline
 */
const addTextSource = asyncHandler(async (req, res) => {
  try {
    const { studyKitId, text, title } = req.body;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, error: 'Not authorized' });

    if (!studyKitId || !text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'studyKitId and non-empty text required' });
    }

    const filenameBase = (title || 'pasted_text').replace(/\s+/g, '_').slice(0, 40);
    const uploadRes = await uploadTextToStorage(userId, studyKitId, filenameBase, text);

    const sourceRow = await prisma.source.create({
      data: {
        studyKitId,
        fileUrl: uploadRes.publicUrl,
        fileName: `${filenameBase}.txt`,
        fileType: 'text',
        fileSize: Buffer.byteLength(text, 'utf8'),
        storagePath: uploadRes.storagePath,
        processed: false,
      },
    });

    return res.status(201).json({ success: true, source: sourceRow });
  } catch (err) {
    console.error('addTextSource error:', err);
    return res.status(500).json({ success: false, error: 'Server error', details: err?.message ?? String(err) });
  }
});

export { createStudyKit, addSources, addLinkSource, addTextSource };
