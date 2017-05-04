var seedartists = [];

function outputUpdate(id, val) {
	document.querySelector('#' + id).value = val;
}

// get options for seed artists based on a typed name:
function artistSearch() {
  $.get( "/search", {"artist_name": $("#artistsearch").val()})
  .done(function( data ) {
    results = "";
    for(var i=0, band; band=data[i]; i++){
      results += "<button onclick=\"addArtist('" + band.name + "', '" + band.id + "')\">" + band.name + "</button><br>";
    }
    if(data.length == 0) results = "Sorry, no artists found.";
    $("#artistoptions").html(results);
  })
  .fail(function(err) {
    console.log("SOMETHING BROKE");
    console.log(err);
  });
}

// print the seed artists
function updateSeedArtists() {
  results = "<ul>";
  for(var i=0, band; band=seedartists[i]; i++){
    results += "<li><button onclick=\"removeArtist('" + band.id + "')\">remove</button>" + band.name;
  }
  results += "</ul>";
  $("#seedartistsdisplay").html(results);
}
// add an artist to the list of seeds
function addArtist(name, id) {
  seedartists.push({"name": name, "id": id});
  updateSeedArtists();
}

// remove an artist from the list of seeds
function removeArtist(id) {
  for(var i=0, band; band=seedartists[i]; i++){
    if(band.id == id) {
      seedartists.splice(i, 1);
      break;
    }
  }
  updateSeedArtists();
}

// send the seed artist, get the recs:
function getRecs() {
  artistIDs = "";
  for(var i=0, band; band=seedartists[i]; i++){
    artistIDs += band.id;
    if(i+1 != seedartists.length) artistIDs += ",";
  }
  params = getKnobValues();
  params.artist_id = artistIDs;
  $.get("/recs", params).done(printRecs);
}

function getKnobValues() {
  values = {};
  categories = [
    "acousticness",
    "danceability",
    "energy",
    "instrumentalness",
    "liveness",
    "loudness",
    //"mode",
    "popularity",
    "speechiness",
    "valence",
  ];
  for(var i=0, cat; cat=categories[i]; i++) {
    if($("#" + cat + "_toggle").is(':checked')) {
      values[cat] = document.querySelector('#' + cat).value;
    }
  }
  // the "Mode" value is handled differently:
  if($("#mode_toggle").is(':checked')) {
    values["mode"] = $('input[name=mode]:checked').val();
  }
  return values;
}

var TRACK_IDS = [];
// display recommendations
function printRecs(data) {
  results = "<ul>"
  for(var i=0, rec; rec=data[i]; i++){
    results += "<li>" + rec.artists[0].name + ", \"" + rec.name + "\"";
    TRACK_IDS.push(rec.id);
  }
  if(data.length == 0) results="Sorry, no tracks found.";
  $("#tracks").html(results);
}

// called by the exportPlaylist() function, which only creates an empty list
function addTracksToList(playlist_id) {
  var toSend = `{"uris":[`;
  // build the JSON body full of Spotify track URIs
  for(var i=0; i < TRACK_IDS.length; i++) {
    toSend += `"spotify:track:` + TRACK_IDS[i] + `"`;
    if(i != TRACK_IDS.length - 1) toSend += ",";
  }
  toSend += `]}`;

  // send that badass request
  $.ajax({
    url: "https://api.spotify.com/v1/users/" + USERID + "/playlists/" + playlist_id + "/tracks",
    type: "POST",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", "Bearer " + USERTOKEN);
      request.setRequestHeader("Content-Type", "application/json");
    },
    data: toSend
  })
  .done(function( data ) {
    console.log("We sent the tracks!!!");
    console.log(data);
    addTracksToList(data.id);
  })
  .fail(function(err) {
    console.log("SOMETHING BROKE IN TRACK ADD");
    console.log(err.responseJSON.error);
  });
}

function exportPlaylist() {
  playlist_name = document.getElementById("playlistname").value;

  $.ajax({
    url: "https://api.spotify.com/v1/users/" + USERID + "/playlists",
    type: "POST",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", "Bearer " + USERTOKEN);
      request.setRequestHeader("Content-Type", "application/json");
    },
    data: `{"name": "` + playlist_name + `", "public": false, "description": \"Created by Playlist Wizard.\"}` // NOTE: This has to be a string, not a JS object.
    // TODO: block injection point here in playlist_name
  })
  .done(function( data ) {
    console.log("HOLY CRAP IT WORKED?");
    console.log(data);
    addTracksToList(data.id);
  })
  .fail(function(err) {
    console.log("SOMETHING BROKE IN EXPORT");
    console.log(err.responseJSON.error);
  });
}
// turns a hash fragment passed to the function into
// key/value pairs
function splitHashValues(hashfrag) {
  var answer = {};
  var components = _.words(hashfrag, /[^&]+/g);
  for(var i=0; i < components.length; i++) {
    var split = _.split(components[i], '=', 2);
    answer[split[0]] = split[1];
  }
  return answer;
}

var USERTOKEN, USERID;
// indicates a user is already logged in
function setUser(username) {
  USERID = username;
  document.getElementById("userdisplay").innerHTML = "Welcome, " + username + "!";
}
// on pageload, look to see if there is a user token in the URL.
function checkForUser() {
  if(!window.location.hash) return;
  fragment = _.trimStart(window.location.hash, '#');
  params = splitHashValues(fragment);
  USERTOKEN = params.access_token;
  getUserData();
}

// use the token we have to fetch a user's profile.
function getUserData() {
  $.ajax({
    url: "https://api.spotify.com/v1/me",
    type: "GET",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", "Bearer " + USERTOKEN);
    }
  })
  .done(function( data ) {
    setUser(data.id);
  })
  .fail(function(err) {
    console.log("SOMETHING BROKE IN HERE");
    console.log(err);
  });
}

// when the page loads this script, check for a user and process it
checkForUser();
