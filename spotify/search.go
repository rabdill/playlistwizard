package spotify

import "encoding/json"


func ArtistSearch(artist string) ([]Artist, error) {
  var answer artistResponse
  res, err := httpCall("https://api.spotify.com/v1/search?q=" + artist + "&type=artist")

  err = json.Unmarshal(res, &answer)
  if err != nil {
    return nil, err
  }
  return answer.Artists.Items, err
}
