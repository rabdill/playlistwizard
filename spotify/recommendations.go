package spotify

import "encoding/json"
import "net/http"
import "fmt"
import "bytes"

func GetRecs(input RecommendationSettings) ([]Track, error) {
  url, err := buildRecQuery(input, "https://api.spotify.com/v1/recommendations")
  if(err != nil) {
    return []Track{}, err
  }
  var answer recommendationResponse
  req, err := http.NewRequest("GET", url, nil)
  if(err != nil) {
    return []Track{}, err
  }
  req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", Token))
  req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

  // do request
  client := &http.Client{}
  resp, err := client.Do(req)
  if err != nil {
    panic(err)
  }
  defer resp.Body.Close()

  buf := new(bytes.Buffer)
  buf.ReadFrom(resp.Body)
  if(resp.StatusCode != 200) {
    panic(buf.String())
  }

  err = json.Unmarshal(buf.Bytes(), &answer); if(err != nil) {
    return []Track{}, err
  }
  return answer.Tracks, err
}

func buildRecQuery(input RecommendationSettings, url string) (string, error) {
  result := make(map[string]string)

  // TODO: made this less stupid
  if input.Acousticness.Min != "" {
    result["min_acousticness"] = input.Acousticness.Min
  }
  if input.Acousticness.Max != "" {
    result["max_acousticness"] = input.Acousticness.Max
  }
  if input.Acousticness.Target != "" {
    result["target_acousticness"] = input.Acousticness.Target
  }

  if input.Danceability.Min != "" {
    result["min_danceability"] = input.Danceability.Min
  }
  if input.Danceability.Max != "" {
    result["max_danceability"] = input.Danceability.Max
  }
  if input.Danceability.Target != "" {
    result["target_danceability"] = input.Danceability.Target
  }

  if input.Energy.Min != "" {
    result["min_energy"] = input.Energy.Min
  }
  if input.Energy.Max != "" {
    result["max_energy"] = input.Energy.Max
  }
  if input.Energy.Target != "" {
    result["target_energy"] = input.Energy.Target
  }

  if input.Instrumentalness.Min != "" {
    result["min_instrumentalness"] = input.Instrumentalness.Min
  }
  if input.Instrumentalness.Max != "" {
    result["max_instrumentalness"] = input.Instrumentalness.Max
  }
  if input.Instrumentalness.Target != "" {
    result["target_instrumentalness"] = input.Instrumentalness.Target
  }

  if input.Liveness.Min != "" {
    result["min_liveness"] = input.Liveness.Min
  }
  if input.Liveness.Max != "" {
    result["max_liveness"] = input.Liveness.Max
  }
  if input.Liveness.Target != "" {
    result["target_liveness"] = input.Liveness.Target
  }

  if input.Loudness.Min != "" {
    result["min_loudness"] = input.Loudness.Min
  }
  if input.Loudness.Max != "" {
    result["max_loudness"] = input.Loudness.Max
  }
  if input.Loudness.Target != "" {
    result["target_loudness"] = input.Loudness.Target
  }

  if input.Speechiness.Min != "" {
    result["min_speechiness"] = input.Speechiness.Min
  }
  if input.Speechiness.Max != "" {
    result["max_speechiness"] = input.Speechiness.Max
  }
  if input.Speechiness.Target != "" {
    result["target_speechiness"] = input.Speechiness.Target
  }

  if input.Tempo.Min != "" {
    result["min_tempo"] = input.Tempo.Min
  }
  if input.Tempo.Max != "" {
    result["max_tempo"] = input.Tempo.Max
  }
  if input.Tempo.Target != "" {
    result["target_tempo"] = input.Tempo.Target
  }

  if input.Valence.Min != "" {
    result["min_valence"] = input.Valence.Min
  }
  if input.Valence.Max != "" {
    result["max_valence"] = input.Valence.Max
  }
  if input.Valence.Target != "" {
    result["target_valence"] = input.Valence.Target
  }

  if input.Mode.Target != "" { // NOTE: some only get a target
    result["target_mode"] = input.Mode.Target
  }
  if input.Key.Target != "" {
    result["target_key"] = input.Key.Target
  }
  if input.Time_signature.Target != "" {
    result["target_time_signature"] = input.Time_signature.Target
  }

  if input.Duration_ms.Min != "" {
    result["min_duration_ms"] = input.Duration_ms.Min
  }
  if input.Duration_ms.Max != "" {
    result["max_duration_ms"] = input.Duration_ms.Max
  }
  if input.Duration_ms.Target != "" {
    result["target_duration_ms"] = input.Duration_ms.Target
  }

  if input.Popularity.Min != "" {
    result["min_popularity"] = input.Popularity.Min
  }
  if input.Popularity.Max != "" {
    result["max_popularity"] = input.Popularity.Max
  }
  if input.Popularity.Target != "" {
    result["target_popularity"] = input.Popularity.Target
  }

  if len(input.Seed_artists) > 0 {
    result["seed_artists"] = input.Seed_artists
  }

  result["limit"] = "20"

  // build the actual URL (this request is NEVER SENT)
  req, err := http.NewRequest("GET", url, nil)
  if err != nil {
    return "", err
  }

  query := req.URL.Query()
  for k, v := range result {
    query.Add(k, v)
  }
  req.URL.RawQuery = query.Encode()

  return req.URL.String(), err
}
