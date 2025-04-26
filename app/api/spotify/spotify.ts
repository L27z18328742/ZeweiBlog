const SPOTIFY_TOKEN_API = `https://accounts.spotify.com/api/token`
const SPOTIFY_NOW_PLAYING_API = `https://api.spotify.com/v1/me/player/currently-playing`
const SPOTIFY_TOP_TRACKS_API = `https://api.spotify.com/v1/me/top/tracks`

let {
  SPOTIFY_CLIENT_ID: client_id,
  SPOTIFY_CLIENT_SECRET: client_secret,
  SPOTIFY_REFRESH_TOKEN:
    refresh_token = 'AQDP7dH5HBHPvv1TGU9EjrW_NxIyisPgwjbO-VMp0hf6X0at5lOb_UqzmavcjBRO5UrxZg_4laWzgJe-er2XBk-o-mHwxXosuPeC0MDy7Q8Lq7CdsbfMKKkQ43SuFiu6Erw',
} = process.env

let basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64')

async function getAccessToken() {
  let response = await fetch(SPOTIFY_TOKEN_API, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    cache: 'no-store',
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  })
  console.log('Spotify token response', response)

  return response.json()
}

export async function getNowPlaying() {
  let { access_token } = await getAccessToken()
  console.log('Spotify access token', access_token)
  let url = new URL(SPOTIFY_NOW_PLAYING_API)
  url.searchParams.append('additional_types', 'track,episode')

  return fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    cache: 'no-store',
  })
}

export async function getTopTracks() {
  let { access_token } = await getAccessToken()

  return fetch(SPOTIFY_TOP_TRACKS_API, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
}
