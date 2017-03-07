package spotify

import "net/http"
import "bytes"
import "fmt"
import "errors"

type checkforerror struct {
  sentError sentError `json: error`
}
type sentError struct {
  status int `json: status`
  message string `json: message`
}

func httpCall(url string) ([]byte, error) {
  res, err := http.Get(url)
  if err != nil {
    return nil, err
  }
  buf := new(bytes.Buffer)
  buf.ReadFrom(res.Body)
  // check for errors within the response
  if(res.StatusCode > 299) {
    message := fmt.Sprintf("Received unexpected status code: %d from response of %s", res.StatusCode, buf.String())
    err = errors.New(message)
  }
  return buf.Bytes(), err
}
