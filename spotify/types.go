package spotify

type Artist struct {
  Id string `json:"id"`
  Name string `json:"name"`
  Popularity int `json:"popularity"`
  Type string `json:"type"`
  Uri string `json:"uri"`
  Genres []string `json:"genres"`
  ExternalUrls map[string]string `json:"external_urls"`
}

// ----- ARTIST SEARCH
// artistResponse - top-level response from Spotify
type artistResponse struct {
  Artists artistWrapper `json:"artists"`
}
// artistWrapper - holds the array of artists within artistResponse from Spotify
type artistWrapper struct {
  Items []Artist `json:"items"`
}

// ----- RECOMMENDATION REQUEST

// RecommendationQuery - collecting user parameters to rearrange and send to Spotify
type RecommendationSettings struct {
  limit int // default 20 max 100
  //market string // figure out if we need this later
  acousticness, danceability, energy, instrumentalness, liveness, loudness, speechiness, tempo, valence SongProperty
  mode DiscreteSongProperty // 1=major, 0=minor
  duration_ms, key, popularity, time_signature DiscreteSongProperty
}
// SongProperty - a range of acceptable values for a given metadata field
type SongProperty struct {
  max, min, target float32
}
// DiscreteSongProperty - for metadata restrictions that only accept whole numbers
type DiscreteSongProperty struct {
  max, min, target int
}

// recommendationResponse - top-level response from spotify
type recommendationResponse struct {
  Tracks []Track
}
type Track struct {
  artists []Artist
  // more *tk
}
