// /api/handler.js
// This serverless function acts as a secure proxy for all external API calls.

export default async function handler(request, response) {
  const targetApi = request.query.target;
  let externalUrl = '';
  const apiKey = process.env.LASTFM_API_KEY;
  const lastfmBase = 'https://ws.audioscrobbler.com/2.0/';

  const buildLastFmUrl = (params) => {
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error('Last.fm API Key is not configured on the server.');
    }
    const query = new URLSearchParams({ ...params, api_key: apiKey, format: 'json' });
    return `${lastfmBase}?${query.toString()}`;
  };

  try {
    if (targetApi === 'jiosavn') {
      const path = request.query.path;
      externalUrl = `https://jiosvn.vercel.app/api${path}`;
    } else if (targetApi === 'lrc') {
      const lrcBase = process.env.LRC_API;
      if (!lrcBase) throw new Error('Server lyrics service is misconfigured.');
      externalUrl = `${lrcBase}?song=${encodeURIComponent(request.query.song)}&artist=${encodeURIComponent(request.query.artist)}&format=ttml`;
    } else if (targetApi === 'lastfm') {
      externalUrl = buildLastFmUrl({ method: 'track.getSimilar', artist: request.query.artist, track: request.query.track, limit: request.query.limit || 30 });
    } else if (targetApi === 'lastfm-artist-toptracks') {
      externalUrl = buildLastFmUrl({ method: 'artist.gettoptracks', artist: request.query.artist, limit: request.query.limit || 30 });
    } else if (targetApi === 'lastfm-similar-artists') {
      externalUrl = buildLastFmUrl({ method: 'artist.getsimilar', artist: request.query.artist, limit: 10 });
    } else if (targetApi === 'lastfm-track-tags') {
      externalUrl = buildLastFmUrl({ method: 'track.gettoptags', artist: request.query.artist, track: request.query.track });
    } else if (targetApi === 'lastfm-tag-tracks') {
      externalUrl = buildLastFmUrl({ method: 'tag.gettoptracks', tag: request.query.tag, limit: 30 });
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
    console.error('Proxy error:', error.message);
    return response.status(500).json({ error: 'An error occurred in the proxy server.', details: error.message });
  }
}
