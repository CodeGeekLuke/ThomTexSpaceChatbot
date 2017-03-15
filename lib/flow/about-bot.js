'use strict'

const fbTemplate = require('claudia-bot-builder').fbTemplate

function aboutBot() {
  return [
      `ThomTex Space Explorer is simple Messenger chat bot that uses NASA's API to get the data and images about the space`,
      `It's created for fun and also as a showcase for ThomTex, deploying bots on AWS Lambda`,
      new fbTemplate.button('More actions:')
        .addButton('ThomTex', 'https://ThomTex.com')
        .addButton('Source code', 'https://github.com/CodeGeekLuke/ThomTexSpaceBot')
        .get()
    ]
}

module.exports = aboutBot
