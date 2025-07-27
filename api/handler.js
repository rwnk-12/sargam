// /api/handler.js
// This serverless function acts as a secure proxy for all external API calls.

export default async function handler(request, response) {
  // --- SECURITY CHECK: Verify the request comes from our own website ---
  const referer = request.headers.referer;
  const allowedDomain = process.env.APP_URL;

  // This check now specifically targets Vercel production deployments.
  // It will NOT block requests during local development or in Vercel preview deployments.
  if (process.env.VERCEL_ENV === 'production') {
    if (!allowedDomain) {
      console.error("CRITICAL: The APP_URL environment variable is not set in your Vercel project.");
      return response.status(500).json({ error: 'Server security is misconfigured.' });
    }
    // Block the request if it doesn't have a referer or if the referer doesn't match your app's URL.
    if (!referer || !referer.startsWith(allowedDomain)) {
      return response.status(403).json({ error: 'Forbidden: This API cannot be accessed from this origin.' });
    }
  }
  // --- END SECURITY CHECK ---


  const targetApi = request.query.target;
  let externalUrl = '';

  try {
    if (targetApi === 'jiosavn') {
      const path = request.query.path;
      const jioSvnBase = 'https://jiosvn.vercel.app/api';
      externalUrl = `${jioSvnBase}${path}`;
    } else if (targetApi === 'lrc') {
      const lrcBase = process.env.LRC_API;
      if (!lrcBase) {
        console.error("CRITICAL: LRC_API environment variable is not set.");
        return response.status(500).json({ error: 'Server lyrics service is misconfigured.' });
      }
      
      const song = request.query.song;
      const artist = request.query.artist;
      externalUrl = `${lrcBase}?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}&format=ttml`;
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

    response.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    
    return response.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    return response.status(500).json({ error: 'An error occurred in the proxy server.', details: error.message });
  }
}
