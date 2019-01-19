const fs = require('fs');
const path = require('path');
const serverConfigAddr = path.resolve(__dirname, '../../nip_login_config.js');

let config = {
  githubClientId:       null,
  githubClientSecret:   null,
  tbaccessKeyId:        null,
  tbsecretAccessKey:    null,
	tbendpoint:           null,
	tbinstancename:       null,
};


if (fs.existsSync(serverConfigAddr)) {
  try {
    const serverConfig = require(serverConfigAddr);
    config = Object.assign(config, serverConfig);
  } catch(e) {}
}

module.exports = config;