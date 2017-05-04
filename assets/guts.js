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
  console.log(name + " AAA " + id);
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
  console.log(seedartists);

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

// display recommendations
function printRecs(data) {
  results = "<ul>"
  for(var i=0, rec; rec=data[i]; i++){
      results += "<li>" + rec.artists[0].name + ", \"" + rec.name + "\""
  }
  if(data.length == 0) results="Sorry, no tracks found.";
  $("#tracks").html(results);
}
