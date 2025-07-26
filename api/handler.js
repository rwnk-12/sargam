// /api/handler.js
// This serverless function acts as a proxy for all external API calls.

export default async function handler(request, response) {
  const targetApi = request.query.target; // 'jiosavn', 'lrc', 'lastfm'
  let externalUrl = '';

  try {
    if (targetApi === 'jiosavn') {
      const path = request.query.path;
      const jioSvnBase = 'https://jiosvn.vercel.app/api';
      externalUrl = `${jioSvnBase}${path}`;
    } else if (targetApi === 'lrc') {
      const song = request.query.song;
      const artist = request.query.artist;
      const lrcBase = 'https://applelrcfetch-2.pages.dev/api/search';
      externalUrl = `${lrcBase}?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`;
    } else if (targetApi === 'lastfm') {
        const artist = request.query.artist;
        const track = request.query.track;
        const limit = request.query.limit || 20;
        const apiKey = process.env.LASTFM_API_KEY;

        if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
            console.error("Last.fm API Key is not configured on the server.");
            return response.status(500).json({ error: 'Last.fm API key is not configured.' });
        }

        const lastfmBase = 'https://ws.audioscrobbler.com/2.0/';
        externalUrl = `${lastfmBase}?method=track.getSimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&api_key=${apiKey}&format=json&limit=${limit}`;
    } else {
      return response.status(400).json({ error: 'Invalid target API specified' });
    }

    const apiResponse = await fetch(externalUrl);

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error(`Error from external API (${externalUrl}): ${apiResponse.status}`, errorBody);
      return response.status(apiResponse.status).send(errorBody);
    }
    
    const data = await apiResponse.json();

    // --- CRITICAL COST-SAVING CHANGE ---
    // This header instructs Vercel's Edge Network to cache the response.
    // s-maxage=3600: Cache for 1 hour on the edge. Subsequent identical requests will be served
    // from the cache and will NOT invoke this function, saving you costs.
    // stale-while-revalidate=86400: If a request comes after 1 hour, serve the old (stale)
    // data immediately while re-fetching the new data in the background for the next user.
    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    
    return response.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return response.status(500).json({ error: 'An error occurred in the proxy server.', details: error.message });
  }
}