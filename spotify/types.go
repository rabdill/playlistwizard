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
  Limit int // default 20 max 100
  //market string // figure out if we need this later
  Acousticness, Danceability, Energy, Instrumentalness, Liveness, Loudness, Speechiness, Tempo, Valence SongProperty
  Mode DiscreteSongProperty // 1=major, 0=minor
  Duration_ms, Key, Popularity, Time_signature DiscreteSongProperty
  Seed_artists string
}
// SongProperty - a range of acceptable values for a given metadata field
type SongProperty struct {
  Max, Min, Target string // TODO: flip these over to floats
}
// DiscreteSongProperty - for metadata restrictions that only accept whole numbers
type DiscreteSongProperty struct {
  //Max, Min, Target int
  Max, Min, Target string // TODO: flip these over to ints
}

// recommendationResponse - top-level response from spotify
type recommendationResponse struct {
  Tracks []Track
}
type Track struct {
  Artists []Artist `json:"artists"`
  Name string `json:"name"`
  ExternalUrls map[string]string `json:"external_urls"`
  ID string `json:"id"`
}
