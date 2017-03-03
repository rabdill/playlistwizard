package spotify

import "encoding/json"

func GetRecs(input RecommendationSettings) ([]Track, error) {
  var answer recommendationResponse
  res, err := httpCall("https://api.spotify.com/v1/recommendations")
  err = json.Unmarshal(res, &answer)

  return answer.Tracks, err
}

func buildRecQuery(input RecommendationSettings, url string) (string, error) {

  // TODO: made this less stupid
  if input.acousticness.min != 0 {
    result["min_acousticness"] = input.acousticness.min
  }
  if input.acousticness.max != 0 {
    result["max_acoustic"] = input.acousticness.max
  }
  if input.acousticness.target != 0 {
    result["target_acousticness"] = input.acousticness.target
  }

  if input.danceability.min != 0 {
    result["min_danceability"] = input.danceability.min
  }
  if input.danceability.max != 0 {
    result["max_danceability"] = input.danceability.max
  }
  if input.danceability.target != 0 {
    result["target_danceability"] = input.danceability.target
  }

  if input.energy.min != 0 {
    result["min_energy"] = input.energy.min
  }
  if input.energy.max != 0 {
    result["max_energy"] = input.energy.max
  }
  if input.energy.target != 0 {
    result["target_energy"] = input.energy.target
  }

  if input.instrumentalness.min != 0 {
    result["min_instrumentalness"] = input.instrumentalness.min
  }
  if input.instrumentalness.max != 0 {
    result["max_instrumentalness"] = input.instrumentalness.max
  }
  if input.instrumentalness.target != 0 {
    result["target_instrumentalness"] = input.instrumentalness.target
  }

  if input.liveness.min != 0 {
    result["min_liveness"] = input.liveness.min
  }
  if input.liveness.max != 0 {
    result["max_liveness"] = input.liveness.max
  }
  if input.liveness.target != 0 {
    result["target_liveness"] = input.liveness.target
  }

  if input.loudness.min != 0 {
    result["min_loudness"] = input.loudness.min
  }
  if input.loudness.max != 0 {
    result["max_loudness"] = input.loudness.max
  }
  if input.loudness.target != 0 {
    result["target_loudness"] = input.loudness.target
  }

  if input.speechiness.min != 0 {
    result["min_speechiness"] = input.speechiness.min
  }
  if input.speechiness.max != 0 {
    result["max_speechiness"] = input.speechiness.max
  }
  if input.speechiness.target != 0 {
    result["target_speechiness"] = input.speechiness.target
  }

  if input.tempo.min != 0 {
    result["min_tempo"] = input.tempo.min
  }
  if input.tempo.max != 0 {
    result["max_tempo"] = input.tempo.max
  }
  if input.tempo.target != 0 {
    result["target_tempo"] = input.tempo.target
  }

  if input.valence.min != 0 {
    result["min_valence"] = input.valence.min
  }
  if input.valence.max != 0 {
    result["max_valence"] = input.valence.max
  }
  if input.valence.target != 0 {
    result["target_valence"] = input.valence.target
  }

  if input.mode.target != 0 { // NOTE: some only get a target
    result["target_mode"] = input.mode.target
  }
  if input.key.target != 0 {
    result["target_key"] = input.key.target
  }
  if input.time_signature.target != 0 {
    result["target_time_signature"] = input.time_signature.target
  }

  if input.duration_ms.min != 0 {
    result["min_duration_ms"] = input.duration_ms.min
  }
  if input.duration_ms.max != 0 {
    result["max_duration_ms"] = input.duration_ms.max
  }
  if input.duration_ms.target != 0 {
    result["target_duration_ms"] = input.duration_ms.target
  }

  if input.popularity.min != 0 {
    result["min_popularity"] = input.popularity.min
  }
  if input.popularity.max != 0 {
    result["max_popularity"] = input.popularity.max
  }
  if input.popularity.target != 0 {
    result["target_popularity"] = input.popularity.target
  }

  // build the actual URL
  req, err := http.NewRequest("GET", url, nil)
  if err != nil {
    return "", err
  }

  q := req.URL.Query()
  for k, v := range m {
    q.Add(k, v)
  }
  req.URL.RawQuery = q.Encode()

  return req.URL.String(), err
}
