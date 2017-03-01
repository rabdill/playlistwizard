package spotify

import "net/http"
import "encoding/json"
//import "io/ioutil"
import "fmt"
import "bytes"

func ArtistSearch(artist string) ([]Artist, error) {
  var answer Artistresponse
  res, err := http.Get("https://api.spotify.com/v1/search?q=" + artist + "&type=artist")
  if err != nil {
    return nil, err
  }
  buf := new(bytes.Buffer)
  buf.ReadFrom(res.Body)
  fmt.Println(buf.String())
  err = json.Unmarshal(buf.Bytes(), &answer)
  if err != nil {
    return nil, err
  }
  fmt.Println(answer)
  return answer.Artists.Items, err
}

type Artistresponse struct {
  Artists artistwrapper `json:"artists"`
}

type artistwrapper struct {
  Items []Artist `json:"items"`
}

type Artist struct {
  Id string `json:"id"`
  Name string `json:"name"`
  Popularity int `json:"popularity"`
  Type string `json:"type"`
  Uri string `json:"uri"`
  Genres []string `json:"genres"`
  ExternalUrls map[string]string `json:"external_urls"`
}
