
const express = require('express');
const config = require('./config');
const github = require('./github');
const getInfo = require('./getInfo');
const db = require('./db');

const { URL } = require('url');
const defaultError = { status: 403, success: false };

const router = express.Router();

router.get('/oauth-github', async (req, res) => {
  const data = (await github(req.query, config, db)) || defaultError;
  if (data.header) res.set(data.header);
  return res.status(data.status || 200).send(data.data || data);
});

router.get('/info', async (req, res) => {
  const data = (await getInfo(req.query, config, db)) || defaultError;
  if (data.header) res.set(data.header);
  return res.status(data.status || 200).send(data.data || data);
});

module.exports = router;