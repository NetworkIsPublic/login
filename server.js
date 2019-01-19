const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const apiRoutes = require('./server/routes');

const port = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json({
  strict: false,
}));
app.use(cors());
app.use(apiRoutes);

app.use((req, res) => {
  res.send({
    success: false,
    error: 'welcome to nip login',
  });
});
app.listen(port);