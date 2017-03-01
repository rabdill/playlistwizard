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

// FOR ARTIST SEARCH
type artistresponse struct {
  Artists artistwrapper `json:"artists"`
}
type artistwrapper struct {
  Items []Artist `json:"items"`
}
