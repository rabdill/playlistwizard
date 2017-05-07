/*
Super Tuner for Spotify, a metadata-powered playlist generator
Copyright (C) 2017 Richard Abdill.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var super_tuner = (function() {
// **** APP CONFIG:
var client_id = "1234example7094742example"; // spotify app client ID
var root_url = "http://localhost:8000/" // where the main page of your app lives

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
// **************

var seedartists = []; // for storing artists to be sent with request
var USERTOKEN="", USERID; // user data for authenticating back to spotify
var TRACK_IDS = []; // used for storing the IDs of recommended tracks

// iterates through the knobs array and generates sliders for each
function createKnobs() {
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

		toWrite += `<tr><td><span class="check"><input type="checkbox" id="` + knob + `_toggle"></span><label for="` + knob + `">` + knob + `</label><td>
		<input type="range" min="0" max="` + max + `" value="` + start_val + `" step="` + step + `" id="` + knob + `" oninput="super_tuner.outputUpdate('` + knob + `_value', value)">
		<td><output for="` + knob + `" id="` + knob + `_value">` + start_val + `</output>`;
	}
	$("#knobtable").html(toWrite);
}

// Prints a link to the Spotify auth page
function setLoginUrl() {
	$("#loginlink").html(`<a href="https://accounts.spotify.com/authorize?client_id=` + client_id + `&redirect_uri=` + encodeURIComponent(root_url) + `&response_type=token&scope=playlist-modify-private">Click here to get started.</a>`);
}

// updates slider labels to reflect value of their slider
function outputUpdate(id, val) {
	document.querySelector('#' + id).value = val;
}

// get options for seed artists based on a typed name:
var artistSearch = function() {
	// kick off the loading spinner:
	document.getElementById("artistspinner").style.display = "block";

	// send request
	$.get("https://api.spotify.com/v1/search?q=" + $("#artistsearch").val() + "&type=artist")
	.done(function( data ) {
		results = "";
		for(var i=0, band; band=data.artists.items[i]; i++){
			results += `<label class="labelbutton label label-success" onclick="super_tuner.addArtist('` + band.name + `', '` + band.id + `')"><span class="glyphicon glyphicon-plus"></span></label>` + band.name + `<br>`;
		}
		if(data.length == 0) results = "Sorry, no artists found.";
		$("#artistoptions").html(results);
	})
	.fail(function(err) {
		console.log("Error in artist search:");
		console.log(err);
	});

	// we're done loading:
	document.getElementById("artistspinner").style.display = "none";
}

// check if we have enough data for a recommendations request.
// controls the GET RECS button and the hints for what data is required.
function assessRecsButton() {
	document.getElementById("seed_required").hidden = (seedartists.length > 0);
	document.getElementById("login_required").hidden = (USERTOKEN != "");
	document.getElementById("recsbutton").disabled = !(USERTOKEN && seedartists.length > 0);
}

// print the seed artists
function updateSeedArtists() {
	results = "";
	for(var i=0, band; band=seedartists[i]; i++){
		results += `<label class="labelbutton label label-danger" onclick="super_tuner.removeArtist('` + band.id + `')\"><span class="glyphicon glyphicon-minus"></span></label>` + band.name + `<br>`;
	}
	$("#seedartistsdisplay").html(results);
	// check to see if the modified seed artist list will provide the
	//  required data:
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

// send recommendations request:
var getRecs = function() {
	// start loading spinner
	document.getElementById("resultspinner").style.display = "block";

	// build query string of artists
	artistIDs = "";
	for(var i=0, band; band=seedartists[i]; i++){
		artistIDs += band.id;
		if(i+1 != seedartists.length) artistIDs += ",";
	}

	// build and send request:
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
	return values;
}

// display recommendations in list
function printRecs(data) {
	results = ``
	for(var i=0, rec; rec=data.tracks[i]; i++){
		// print each track with a "play preview" button
		results += `<label class="labelbutton label label-`
		if(rec.preview_url) {
			results += `success" onclick="super_tuner.playPreview('` + rec.preview_url + `')"`
		} else {
			// if the preview clip isn't available, don't make the button green
			results += `default" style="cursor:auto"`
		}
		results += `><span class="glyphicon glyphicon-play"></span></label>` + rec.artists[0].name + `, "` + rec.name + `"<br>`;
		TRACK_IDS.push(rec.id);
	}
	if(data.tracks.length == 0) results = "Sorry, no tracks found.";

	$("#tracks").html(results);
	document.getElementById("resultspinner").style.display = "none";
}

// called by the exportPlaylist() function, which only creates an empty list
function addTracksToList(playlist_id) {
	var toSend = `{"uris":[`;
	// build the JSON body full of Spotify track URIs
	for(var i=0; i < TRACK_IDS.length; i++) {
		toSend += `"spotify:track:` + TRACK_IDS[i] + `"`;
		// add a comma unless it's the last one
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

// create playlist
function exportPlaylist() {
	playlist_name = "Creative name to come";

	$.ajax({
		url: "https://api.spotify.com/v1/users/" + USERID + "/playlists",
		type: "POST",
		beforeSend: function(request) {
			request.setRequestHeader("Authorization", "Bearer " + USERTOKEN);
			request.setRequestHeader("Content-Type", "application/json");
		},
		// NOTE: `data` has to be a string, not a JS object.
		data: `{"name": "` + playlist_name + `", "public": false, "description": \"Created by Super Tuner.\"}`
		// TODO: block injection point here in playlist_name
	})
	.done(function(data) {
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
	// User name:
	USERID = user.id;
	$("#loginlink").html(`<strong>Welcome, ` + user.id + `!</strong> | <a href="` + root_url + `">(Log out)</a>`);

	// Profile pic:
	if(user.images.length > 0) {
		var profpic = document.getElementById("profpic");
		profpic.src = user.images[0].url;
		profpic.style.display = "inline";
	}
}
// look to see if there is a user token in the URL.
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

// plays an MP3 file from the url passed to it. for previews.
function playPreview(url) {
	var player = document.getElementById("current_preview");
	player.src = url;
  player.play();
}

// add sliders for each metric
createKnobs();
// fill in the app-specific data
setLoginUrl();
// check for a user and process it
checkForUser();

// public functions used from index.html
return {
	artistSearch: artistSearch,
	getRecs: getRecs,
	addArtist: addArtist,
	removeArtist: removeArtist,
	playPreview: playPreview,
	outputUpdate: outputUpdate,
}

})();
