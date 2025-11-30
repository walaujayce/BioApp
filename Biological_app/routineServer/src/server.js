const express = require('express');
const other = require('./tool/other.js')
const app = express();

// send mail to remind not upload data
other.weeklySendMail();

const port = 8080;

app.listen(port, () => {
  console.log(`Server is up and running on port ${port}...`);
});
