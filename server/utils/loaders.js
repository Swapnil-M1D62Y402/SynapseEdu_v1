// server/lib/loader.js
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

/**
 * Extract readable text from a webpage using Readability.
 */
export async function loadFromWeb(url) {
  const resp = await fetch(url, { method: "GET", headers: { "User-Agent": "Mozilla/5.0 (langchain-loader)" } });
  if (!resp.ok) {
    throw new Error(`Failed to fetch URL: ${resp.status} ${resp.statusText}`);
  }
  const html = await resp.text();
  const dom = new JSDOM(html, { url });
  const reader = new Readability(dom.window.document);
  const article = reader.parse();

  if (article && article.textContent) return article.textContent;
  return dom.window.document.body?.textContent || "";
}

/**
 * Extract transcript text from a YouTube URL or video id.
 * Uses dynamic import to safely load the CommonJS package.
 */
export async function loadFromYouTube(urlOrId) {
  try {
    // Normalize video id
    let id = urlOrId;
    if (/(youtube\.com|youtu\.be)/.test(urlOrId)) {
      const m = urlOrId.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      if (m && m[1]) id = m[1];
      else {
        const m2 = urlOrId.match(/([0-9A-Za-z_-]{11})/);
        if (m2 && m2[1]) id = m2[1];
        else id = null;
      }
    }

    if (!id) return null;

    // dynamic import so CommonJS module shape is handled
    const mod = await import("youtube-transcript").catch((e) => {
      // If dynamic import fails, rethrow with useful message
      throw new Error(`Failed to import youtube-transcript: ${e.message}`);
    });

    // Resolve possible export shapes:
    // - mod.getTranscript
    // - mod.default.getTranscript
    // - mod.default (function)
    let getTranscript = null;
    if (typeof mod.getTranscript === "function") getTranscript = mod.getTranscript;
    else if (mod.default && typeof mod.default.getTranscript === "function") getTranscript = mod.default.getTranscript;
    else if (typeof mod.default === "function") getTranscript = mod.default;
    else if (typeof mod === "function") getTranscript = mod;

    if (!getTranscript) {
      throw new Error("youtube-transcript: cannot find getTranscript export");
    }

    // call getTranscript; it may return array of { text, ... } or throw
    const parts = await getTranscript(id);
    if (!parts || parts.length === 0) return null;
    return parts.map((p) => p.text).join(" ");
  } catch (err) {
    console.warn("YouTube transcript extraction error:", err?.message || err);
    return null;
  }
}
