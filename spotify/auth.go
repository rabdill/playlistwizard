package spotify

import "os"
import "fmt"
import "encoding/base64"
import "encoding/json"
import "net/http"
import "bytes"

type TokenResponse struct{
  Token string `json:"access_token"`
  expires_in int
}

var Token string // holds the access token for Spotify

func GetToken() string {
  spotClient := os.Getenv("spotClient")
  spotSecret := os.Getenv("spotSecret")
  combo := fmt.Sprintf("%s:%s", spotClient, spotSecret)

  zing := base64.StdEncoding.EncodeToString([]byte(combo))

  // build request
  jsonStr := []byte("grant_type=client_credentials")
  tokenUrl := "https://accounts.spotify.com/api/token"
  req, err := http.NewRequest("POST", tokenUrl, bytes.NewBuffer(jsonStr))
  req.Header.Set("Authorization", fmt.Sprintf("Basic %s", zing))
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

  var tok TokenResponse
  err = json.Unmarshal(buf.Bytes(), &tok); if err != nil {
    panic(err)
  }

  return tok.Token
}
