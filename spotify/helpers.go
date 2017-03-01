package spotify

import "net/http"
import "bytes"

func httpCall(url string) ([]byte, error) {
  res, err := http.Get(url)
  if err != nil {
    return nil, err
  }
  buf := new(bytes.Buffer)
  buf.ReadFrom(res.Body)
  return buf.Bytes(), err
}
