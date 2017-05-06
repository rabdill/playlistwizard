package main

import "gopkg.in/gin-gonic/gin.v1"
import "github.com/rabdill/playlister/spotify"

func main() {
  // Creates a gin router with default middleware:
  // logger and recovery (crash-free) middleware
  router := gin.Default()

  spotify.Token = spotify.GetToken()

  router.Static("/assets", "./assets")
  // By default it serves on :8080 unless a
  // PORT environment variable was defined.
  router.Run()
  // router.Run(":3000") for a hard coded port
}


func recs(c *gin.Context) {
  seed := c.DefaultQuery("artist_id", "2ye2Wgw4gimLv2eAKyk1NB")

  factors := spotify.RecommendationSettings{
    Seed_artists: seed,
    // Acousticness: spotify.SongProperty{Target: "1.0"},
    // Instrumentalness: spotify.SongProperty{Min: "0.5"},
  }
  params := c.Request.URL.Query()

  // TODO: use reflection to make this not awful
  if(len(params["acousticness"]) > 0) {
    factors.Acousticness = spotify.SongProperty{Target: params["acousticness"][0]}
  }
  if(len(params["danceability"]) > 0) {
    factors.Danceability = spotify.SongProperty{Target: params["danceability"][0]}
  }
  if(len(params["energy"]) > 0) {
    factors.Energy = spotify.SongProperty{Target: params["energy"][0]}
  }
  if(len(params["instrumentalness"]) > 0) {
    factors.Instrumentalness = spotify.SongProperty{Target: params["instrumentalness"][0]}
  }
  if(len(params["liveness"]) > 0) {
    factors.Liveness = spotify.SongProperty{Target: params["liveness"][0]}
  }
  if(len(params["loudness"]) > 0) {
    factors.Loudness = spotify.SongProperty{Target: params["loudness"][0]}
  }
  if(len(params["mode"]) > 0) {
    factors.Mode = spotify.DiscreteSongProperty{Target: params["mode"][0]}
  }
  if(len(params["popularity"]) > 0) {
    factors.Popularity = spotify.DiscreteSongProperty{Target: params["popularity"][0]}
  }
  if(len(params["speechiness"]) > 0) {
    factors.Speechiness = spotify.SongProperty{Target: params["speechiness"][0]}
  }
  if(len(params["valence"]) > 0) {
    factors.Valence = spotify.SongProperty{Target: params["valence"][0]}
  }

  resp, err := spotify.GetRecs(factors)
  if(err != nil){
    c.JSON(500, err.Error())
  } else {
    c.JSON(200, resp)
  }
}

func search(c *gin.Context) {
  query := c.DefaultQuery("artist_name", "metallica");
  artists, err := spotify.ArtistSearch(query)
  if(err != nil){
    c.JSON(500, err.Error())
  } else {
    c.JSON(200, artists)
  }
}
