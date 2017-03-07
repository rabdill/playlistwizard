package spotify

import "encoding/json"
import "net/http"
import "strconv"
import "fmt"
import "bytes"

func GetRecs(input RecommendationSettings) ([]Track, error) {
  url, err := buildRecQuery(input, "https://api.spotify.com/v1/recommendations")
  if(err != nil) {
    return []Track{}, err
  }
  var answer recommendationResponse
  fmt.Println(url)
  req, err := http.NewRequest("GET", url, nil)
  if(err != nil) {
    return []Track{}, err
  }
  fmt.Printf("TOKEN ISSSS %s", Token)
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
  result := make(map[string]float64) // needs to be float64 to convert to string

  // TODO: made this less stupid
  if input.Acousticness.Min != 0 {
    result["min_acousticness"] = input.Acousticness.Min
  }
  if input.Acousticness.Max != 0 {
    result["max_acousticness"] = input.Acousticness.Max
  }
  if input.Acousticness.Target != 0 {
    result["target_acousticness"] = input.Acousticness.Target
  }

  if input.Danceability.Min != 0 {
    result["min_danceability"] = input.Danceability.Min
  }
  if input.Danceability.Max != 0 {
    result["max_danceability"] = input.Danceability.Max
  }
  if input.Danceability.Target != 0 {
    result["target_danceability"] = input.Danceability.Target
  }

  if input.Energy.Min != 0 {
    result["min_energy"] = input.Energy.Min
  }
  if input.Energy.Max != 0 {
    result["max_energy"] = input.Energy.Max
  }
  if input.Energy.Target != 0 {
    result["target_energy"] = input.Energy.Target
  }

  if input.Instrumentalness.Min != 0 {
    result["min_instrumentalness"] = input.Instrumentalness.Min
  }
  if input.Instrumentalness.Max != 0 {
    result["max_instrumentalness"] = input.Instrumentalness.Max
  }
  if input.Instrumentalness.Target != 0 {
    result["target_instrumentalness"] = input.Instrumentalness.Target
  }

  if input.Liveness.Min != 0 {
    result["min_liveness"] = input.Liveness.Min
  }
  if input.Liveness.Max != 0 {
    result["max_liveness"] = input.Liveness.Max
  }
  if input.Liveness.Target != 0 {
    result["target_liveness"] = input.Liveness.Target
  }

  if input.Loudness.Min != 0 {
    result["min_loudness"] = input.Loudness.Min
  }
  if input.Loudness.Max != 0 {
    result["max_loudness"] = input.Loudness.Max
  }
  if input.Loudness.Target != 0 {
    result["target_loudness"] = input.Loudness.Target
  }

  if input.Speechiness.Min != 0 {
    result["min_speechiness"] = input.Speechiness.Min
  }
  if input.Speechiness.Max != 0 {
    result["max_speechiness"] = input.Speechiness.Max
  }
  if input.Speechiness.Target != 0 {
    result["target_speechiness"] = input.Speechiness.Target
  }

  if input.Tempo.Min != 0 {
    result["min_tempo"] = input.Tempo.Min
  }
  if input.Tempo.Max != 0 {
    result["max_tempo"] = input.Tempo.Max
  }
  if input.Tempo.Target != 0 {
    result["target_tempo"] = input.Tempo.Target
  }

  if input.Valence.Min != 0 {
    result["min_valence"] = input.Valence.Min
  }
  if input.Valence.Max != 0 {
    result["max_valence"] = input.Valence.Max
  }
  if input.Valence.Target != 0 {
    result["target_valence"] = input.Valence.Target
  }

  if input.Mode.Target != 0 { // NOTE: some only get a target
    result["target_mode"] = input.Mode.Target
  }
  if input.Key.Target != 0 {
    result["target_key"] = input.Key.Target
  }
  if input.Time_signature.Target != 0 {
    result["target_time_signature"] = input.Time_signature.Target
  }

  if input.Duration_ms.Min != 0 {
    result["min_duration_ms"] = input.Duration_ms.Min
  }
  if input.Duration_ms.Max != 0 {
    result["max_duration_ms"] = input.Duration_ms.Max
  }
  if input.Duration_ms.Target != 0 {
    result["target_duration_ms"] = input.Duration_ms.Target
  }

  if input.Popularity.Min != 0 {
    result["min_popularity"] = input.Popularity.Min
  }
  if input.Popularity.Max != 0 {
    result["max_popularity"] = input.Popularity.Max
  }
  if input.Popularity.Target != 0 {
    result["target_popularity"] = input.Popularity.Target
  }

  if len(input.Seed_artists) > 0 {
    result["seed_artists"] = input.Seed_artists[0] // NOTE THIS ISNT RIGHT AND WILL NOT KEEP MULTIPLE SEEDS
  }

  // build the actual URL (this request is NEVER SENT)
  req, err := http.NewRequest("GET", url, nil)
  if err != nil {
    return "", err
  }

  query := req.URL.Query()
  for k, v := range result {
    query.Add(k, strconv.FormatFloat(v, 'f', -1, 32))
  }
  req.URL.RawQuery = query.Encode()

  return req.URL.String(), err
}
