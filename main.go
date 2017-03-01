package main

import "gopkg.in/gin-gonic/gin.v1"
import "github.com/rabdill/playlister/spotify"
import "fmt"

func main() {
  // Creates a gin router with default middleware:
  // logger and recovery (crash-free) middleware
  router := gin.Default()

  router.GET("/", cool)

  // By default it serves on :8080 unless a
  // PORT environment variable was defined.
  router.Run()
  // router.Run(":3000") for a hard coded port
}

func cool(c *gin.Context) {
  resp, err := spotify.ArtistSearch("metallica")
  if err != nil {
    fmt.Println(err)
    c.JSON(500, err)
  } else {
    c.JSON(200, resp)
  }
}
