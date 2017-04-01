package main

import "net/http"
import "gopkg.in/gin-gonic/gin.v1"
import "github.com/rabdill/playlister/spotify"
import "fmt"

func main() {
  // Creates a gin router with default middleware:
  // logger and recovery (crash-free) middleware
  router := gin.Default()

  router.LoadHTMLGlob("index.tmpl")

  spotify.Token = spotify.GetToken()

  router.GET("/", index)
  router.GET("/metallica", metallica)
  router.GET("/recs", recs)

  // By default it serves on :8080 unless a
  // PORT environment variable was defined.
  router.Run()
  // router.Run(":3000") for a hard coded port
}

func index(c *gin.Context) {
  c.HTML(http.StatusOK, "index.tmpl", gin.H{
    "title": "Main website",
  })
}

func metallica(c *gin.Context) {
  resp, err := spotify.ArtistSearch("metallica")
  if err != nil {
    fmt.Println(err)
    c.JSON(500, err)
  } else {
    c.JSON(200, resp)
  }
}

func recs(c *gin.Context) {
  factors := spotify.RecommendationSettings{
    Seed_artists: []string{"2ye2Wgw4gimLv2eAKyk1NB"},
    Acousticness: spotify.SongProperty{Target: "1.0"},
    Instrumentalness: spotify.SongProperty{Min: "0.5"},
  }

  resp, err := spotify.GetRecs(factors)
  if err != nil {
    c.JSON(500, err.Error())
  } else {
    c.JSON(200, resp)
  }
}
