const fs = require("fs");
const { google } = require("googleapis");
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
const CLIENT_ACCESS_TOKEN =
  "ya29.a0ARrdaM8fWFs8tQ2kCeO_XybCr9g_Pp2p8dPgeX0eksGZ49q3noqVfwyXxAoW5TnOuLsT1A3CQjdkWgzVHsVDdsS3pX3ee1ho9Tl4nmwYbLVCCOg7_iF4pQk5y_BqvctyWcrK43Kgj8T2QHwiO3YhUKb6yKPc";
const FILE_ID = "0B4CYFFBz1pocNjJMb1hPNUZEU1U";
const DOWNLOAD_FOLDER = "./downloads/";

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Authorize a client with credentials, then call the Google Drive API.
  let clientToken = {
    access_token: CLIENT_ACCESS_TOKEN,
    scope: SCOPES,
    token_type: "Bearer",
  };

  oAuth2Client.setCredentials(clientToken);
  callback(oAuth2Client);
}

/**
 * Download a single file
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function downloadFile(auth) {
  const drive = google.drive({ version: "v3", auth });

  drive.files.get({ fileId: FILE_ID }, (er, re) => {
    if (er) {
      console.log(er);
      return;
    }
    const FILE_LOCAL_PATH = DOWNLOAD_FOLDER + re.data.name;
    var dest = fs.createWriteStream(FILE_LOCAL_PATH);

    console.log("FILE_ID: " + FILE_ID);
    console.log("FILE_LOCAL_PATH: " + FILE_LOCAL_PATH);

    drive.files.get(
      { fileId: FILE_ID, alt: "media" },
      { responseType: "stream" },
      function (err, res) {
        res.data
          .on("end", () => {
            console.log("Download complete");
          })
          .on("error", (err) => {
            console.log("Error", err);
          })
          .pipe(dest);
      }
    );
  });
}

// Load client secrets from a local file.
fs.readFile("config/credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(content), downloadFile);
});
