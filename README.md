# Super Tuner for Spotify

*Important note: This is not an official Spotify app. Its only association with the company is that it uses the Spotify Web API.*

## Deployment

The Super Tuner is written entirely in client-side Javascript. Simply deploy all of these files to a web server (or a document host such as Amazon S3 or, even easier, [GitHub Pages](https://pages.github.com/)) and it should run itself. (More detailed instructions to come.)

There are, however, several steps outside of the actual application that need to be taken care of.

### Configuration

The Super Tuner will not work without a Spotify application client ID. These are freely available to anyone who registers their application at [Spotify's developer portal](https://developer.spotify.com/).

1. Go to https://developer.spotify.com/my-applications/#!/ and log in with your regular Spotify credentials. (A standard Spotify login should work fine; Premium access isn't necessary.)
1. Click the "Create an app" button, and fill in a name and description.
1. This should take you to your new app's configuration dashboard. Here is where you will find your "Client ID," a string of letters and numbers that basically acts as your app's "username." **Copy this value and paste it into the `client_id` variable declaration in the `guts.js` file.** The "Client Secret" would normally be the equivalent of your app's password, but since the app itself will not be making any calls to Spotify, you don't need this for anything. *Even so, make sure nobody gets access to this secret. Anyone who has it can make API calls pretending to be you.*
1. Add a URL to the "Redirect URIs" field. This should be the URL at which the app's `index.html` file will be available. If you're running locally somewhere, it might be `http://localhost:8000`. The app was initially deployed at `https://richabdill.com/supertuner`, so that is the redirect URL that was registered. **Add this URL as the value of the `root_url` variable, immediately beneath the `client_id` variable in `guts.js`.**
1. Click "Save" at the bottom of the Spotify app config dashboard.

At this point, everything should be ready to go: Navigate to wherever you've hosted the files and try to log in. The most likely error you're going to run into is here: If you click the login button but get an error about an invalid redirect URL, double-check to make sure the `root_url` value matches the redirect URI you registered with Spotify: Forgetting a trailing slash, for example, or adding an extra one, can cause this error to be thrown.
