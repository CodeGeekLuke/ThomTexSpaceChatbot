'use strict'

const fbTemplate = require('claudia-bot-builder').fbTemplate

function credits() {
  return [
    'Claudia Bot Builder was created by Luke Thompson and the ThomTex team!',
    'Icons used for the bot are from the Noun Project',
    '- Rocket icon by Joseph Webster, \n- Satellite icon by Joseph Webster, \n- Curiosity Rover icon by Joseph Webster, \n- Monster icon by Joseph Webster',
    'This bot was created by Claudia Bot Builder team',
    new fbTemplate.Button('More actions:')
      .addButton('Source Code', 'https://github.com/CodeGeekLuke/ThomTexSpaceBot')
      .addButton('The Noun Project', 'https://thenounproject.com')
      .get()
  ]
}

module.exports = credits
