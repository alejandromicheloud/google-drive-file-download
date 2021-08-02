const fs = require("fs");
const { google } = require("googleapis");
const DOWNLOAD_FOLDER = "./downloads/";
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];
var googleAppConfig;

module.exports = {
  uploadFileFromGoogleDrive: uploadFileFromGoogleDrive,
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {Object} clientToken Client oauth token
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, clientToken, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );
  oAuth2Client.setCredentials(clientToken);
  callback(oAuth2Client);
}

/**
 * Download a single file
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function downloadFile(auth, fileId, callback) {
  const drive = google.drive({ version: "v3", auth });

  drive.files.get({ fileId: fileId }, (err, re) => {
    if (err) {
      return callback(err);
    }
    const FILE_LOCAL_PATH = DOWNLOAD_FOLDER + re.data.name;
    var dest = fs.createWriteStream(FILE_LOCAL_PATH);

    console.log("FILE_ID: " + fileId);
    console.log("FILE_LOCAL_PATH: " + FILE_LOCAL_PATH);

    drive.files.get(
      { fileId: fileId, alt: "media" },
      { responseType: "stream" },
      function (err, res) {
        if (err) return callback(err);
        res.data
          .on("end", () => {
            callback(false, FILE_LOCAL_PATH);
            console.log("Download complete");
          })
          .on("error", (err) => {
            console.log("Error", err);
            callback(err);
          })
          .pipe(dest);
      }
    );
  });
}

function uploadFileFromGoogleDrive(uploadData, callback) {
  // Authorize a client with credentials, then call the Google Drive API.
  let clientToken = {
    access_token: uploadData.oauthToken,
    scope: SCOPES,
    token_type: "Bearer",
  };

  // Authorize a client with credentials, then call the Google Drive API.
  authorize(JSON.parse(googleAppConfig), clientToken, function (auth) {
    downloadFile(auth, uploadData.fileId, callback);
  });
}

// Load client secrets from a local file.
fs.readFile("config/credentials.json", (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  googleAppConfig = content;
});
