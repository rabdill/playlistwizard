var seedartists = [];
// user data for authenticating back to spotify
var USERTOKEN="", USERID;
var knobs = [
	"acousticness",
	"danceability",
	"energy",
	"instrumentalness",
	"liveness",
	"loudness",
	"popularity",
	"speechiness",
	"valence",
];

function createKnobs() {
	var table = document.getElementById("knobtable");
	var toWrite = "";
	for(var i=0, knob; knob=knobs[i]; i++) {
		var step = 0.01;
		var max = 1;
		var start_val = 0.5;
		if(knob == "popularity") {
			 // no idea why this has to be on a different scale
			step = 1.0;
			max = 100;
			start_val = 50;
		}

		toWrite += `<tr><td><input type="checkbox" id="` + knob + `_toggle"><label for="` + knob + `">` + knob + `</label><td>
		<input type="range" min="0" max="` + max + `" value="` + start_val + `" step="` + step + `" id="` + knob + `" oninput="outputUpdate('` + knob + `_value', value)">
		<td><output for="` + knob + `" id="` + knob + `_value">` + start_val + `</output>`;
	}
	table.innerHTML = toWrite;
}

function setLoginUrl() {
	// **** SET THIS TO YOUR SPOTIFY APP CLIENT ID
	var client_id = "6869dc1d98d84251b578e6a0a3f81731";
	// **************

	document.getElementById("loginlink").innerHTML = `<a href="https://accounts.spotify.com/authorize?client_id=` + client_id + `&redirect_uri=` + encodeURIComponent(window.location.href) + `&response_type=token&scope=playlist-modify-private">Click here to get started.</a>`;
}

// updates labels to reflect value of their slider; called from index
function outputUpdate(id, val) {
	document.querySelector('#' + id).value = val;
}

// get options for seed artists based on a typed name:
function artistSearch() {
	document.getElementById("artistspinner").style.display = "block";
	$.get("https://api.spotify.com/v1/search?q=" + $("#artistsearch").val() + "&type=artist")
	.done(function( data ) {
		results = "";
		for(var i=0, band; band=data.artists.items[i]; i++){
			results += "<button onclick=\"addArtist('" + band.name + "', '" + band.id + "')\">" + band.name + "</button><br>";
		}
		if(data.length == 0) results = "Sorry, no artists found.";
		$("#artistoptions").html(results);
	})
	.fail(function(err) {
		console.log("Error in artist search:");
		console.log(err);
	});
	document.getElementById("artistspinner").style.display = "none";
}

// check if we have enough data for a recommendations request
function assessRecsButton() {
	document.getElementById("seed_required").hidden = (seedartists.length > 0);
	document.getElementById("login_required").hidden = (USERTOKEN != "");
	document.getElementById("recsbutton").disabled = !(USERTOKEN && seedartists.length > 0);
}

// print the seed artists
function updateSeedArtists() {
	results = "<ul>";
	for(var i=0, band; band=seedartists[i]; i++){
		results += "<li><button onclick=\"removeArtist('" + band.id + "')\">remove</button>" + band.name;
	}
	results += "</ul>";
	$("#seedartistsdisplay").html(results);

	assessRecsButton();
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
	document.getElementById("resultspinner").style.display = "block";
	artistIDs = "";
	for(var i=0, band; band=seedartists[i]; i++){
		artistIDs += band.id;
		if(i+1 != seedartists.length) artistIDs += ",";
	}
	params = getKnobValues();
	params.seed_artists = artistIDs;
	$.ajax({
		url: "https://api.spotify.com/v1/recommendations",
		type: "GET",
		beforeSend: function(request) {
			request.setRequestHeader("Authorization", "Bearer " + USERTOKEN);
			request.setRequestHeader("Content-Type", "application/json");
		},
		data: params
	}).done(printRecs);
	// TODO: catch errors here
}

// translate sliders into key/value pairs
function getKnobValues() {
	values = {};
	for(var i=0, knob; knob=knobs[i]; i++) {
		if($("#" + knob + "_toggle").is(':checked')) {
			values["target_" + knob] = document.querySelector('#' + knob).value;
		}
	}
	console.log(values);
	return values;
}

// used for storing the IDs of recommended tracks
var TRACK_IDS = [];
// display recommendations in list
function printRecs(data) {
	results = "<ul>"
	for(var i=0, rec; rec=data.tracks[i]; i++){
		results += "<li>" + rec.artists[0].name + ", \"" + rec.name + "\"";
		TRACK_IDS.push(rec.id);
	}
	if(data.tracks.length == 0) results="Sorry, no tracks found.";
	$("#tracks").html(results);
	document.getElementById("resultspinner").style.display = "none";
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

	// send request
	$.ajax({
		url: "https://api.spotify.com/v1/users/" + USERID + "/playlists/" + playlist_id + "/tracks",
		type: "POST",
		beforeSend: function(request) {
			request.setRequestHeader("Authorization", "Bearer " + USERTOKEN);
			request.setRequestHeader("Content-Type", "application/json");
		},
		data: toSend
	})
	.done(function(data) {
		console.log("Tracks successfully added.");
		console.log(data);
		var exportbutton = document.getElementById("exportbutton");
		exportbutton.innerHTML = "Exported!";
		exportbutton.className = "btn btn-success";
		exportbutton.disabled = true;

	})
	.fail(function(err) {
		console.log("Error adding tracks to playlist:");
		console.log(err.responseJSON.error);
	});
}

// create playlist, add tracks
function exportPlaylist() {
	playlist_name = "Creative name to come";

	$.ajax({
		url: "https://api.spotify.com/v1/users/" + USERID + "/playlists",
		type: "POST",
		beforeSend: function(request) {
			request.setRequestHeader("Authorization", "Bearer " + USERTOKEN);
			request.setRequestHeader("Content-Type", "application/json");
		},
		data: `{"name": "` + playlist_name + `", "public": false, "description": \"Created by Super Tuner.\"}` // NOTE: This has to be a string, not a JS object.
		// TODO: block injection point here in playlist_name
	})
	.done(function( data ) {
		console.log("Playlist created");
		addTracksToList(data.id);
	})
	.fail(function(err) {
		console.log("Error creating empty playlist:");
		console.log(err.responseJSON.error);
	});
}

// turns a hash fragment passed to the function into
// key/value pairs. used to pull data from window URL
function splitHashValues(hashfrag) {
	var answer = {};
	var components = _.words(hashfrag, /[^&]+/g);
	for(var i=0; i < components.length; i++) {
		var split = _.split(components[i], '=', 2);
		answer[split[0]] = split[1];
	}
	return answer;
}

// if a user is logged in, let them do all the nice logged-in stuff
function setUser(user) {
	console.log(user);
	// User name:
	USERID = user.id;
	document.getElementById("loginlink").innerHTML = "<strong>Welcome, " + user.id + "!</strong>";

	// Profile pic:
	if(user.images.length > 0) {
		var profpic = document.getElementById("profpic");
		profpic.src = user.images[0].url;
		profpic.style.display = "inline";
	}
}
// on pageload, look to see if there is a user token in the URL.
function checkForUser() {
	if(!window.location.hash) return;
	fragment = _.trimStart(window.location.hash, '#');
	params = splitHashValues(fragment);
	USERTOKEN = params.access_token;
	assessRecsButton();
	getUserData();
}

// use a token to fetch a user's profile.
function getUserData() {
	$.ajax({
		url: "https://api.spotify.com/v1/me",
		type: "GET",
		beforeSend: function(request) {
			request.setRequestHeader("Authorization", "Bearer " + USERTOKEN);
		}
	})
	.done(function( data ) {
		setUser(data);
	})
	.fail(function(err) {
		console.log("Error fetching user data:");
		console.log(err.responseJSON.error);
	});
}

// add sliders for each metric
createKnobs();
// fill in the app-specific data
setLoginUrl();
// when the page loads this script, check for a user and process it
checkForUser();
