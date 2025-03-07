
export async function getOsuToken() {
    const response = await fetch('https://osu.ppy.sh/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.OSU_CLIENT_ID,
        client_secret: process.env.OSU_CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'public',
      }),
    });
  
    const data = await response.json();
    return data.access_token;
  }

  export async function fetchBeatmapInfo(id: number) {
    const token = await getOsuToken();
  
    const response = await fetch(`https://osu.ppy.sh/api/v2/beatmapsets/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  
    if (!response.ok) {
      // Retornar um objeto com todos os campos indicados como erro
      return {
        id: id,
        title: "Error: Beatmap not found",
        artist: "Error: Beatmap not found",
        creator: "Error: Beatmap not found",
        user_id: null,
        username: "Error: Beatmap not found",
        bpm: null,
        status: "Error: Beatmap not found",
        diffs: [],
        last_updated: null,
        thumbnail: null,
        nsfw: null,
        tags: null,
      };
    }
  
    const data = await response.json();
    
    const user = data.related_users.find((user: any) => user.id === data.user_id);
    
    return {
      id: data.id,
      title: data.title,
      artist: data.artist,
      creator: data.creator,
      user_id: data.user_id,
      username: user ? user.username : null,
      bpm: data.bpm,
      status: data.status,
      diffs: data.beatmaps.map((bm: any) => ({ mode: bm.mode, stars: bm.difficulty_rating })),
      last_updated: data.last_updated,
      thumbnail: data.covers.card,
      nsfw: data.nsfw,
      tags: data.tags,
    };
  }