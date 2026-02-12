const fs = require("fs");

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

async function getAccessToken() {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(client_id + ":" + client_secret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token,
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function getCurrentlyPlaying(access_token) {
  const response = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    }
  );

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

(async () => {
  const access_token = await getAccessToken();
  const song = await getCurrentlyPlaying(access_token);

  let status = "Not playing anything";

  if (song && song.item) {
    status = `🎵 ${song.item.name} - ${song.item.artists
      .map((a) => a.name)
      .join(", ")}`;
  }

  const readme = fs.readFileSync("README.md", "utf8");

  const newReadme = readme.replace(
    /<!-- SPOTIFY_START -->.*<!-- SPOTIFY_END -->/s,
    `<!-- SPOTIFY_START -->\n${status}\n<!-- SPOTIFY_END -->`
  );

  fs.writeFileSync("README.md", newReadme);
})();
