const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const googleDrive = require("./controllers/GoogleDrive");

const PORT = 80;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/upload", (req, res) => {
  let uploadData = req.body;
  googleDrive.uploadFileFromGoogleDrive(
    uploadData,
    function (err, uploadedFile) {
      if (err) return res.status(500).json(err);
      uploadData.uploadedFile = uploadedFile;
      res.status(200).json(uploadData);
    }
  );
  console.log(uploadData);
});

app.use(express.static("public"));

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
