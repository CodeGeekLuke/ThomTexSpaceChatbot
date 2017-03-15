/* global describe, it, expect */
'use strict'

const about = require('../../lib/flow/about-bot')
const expected = [
  'ThomTex Space Explorer is simple Messenger chat bot that uses NASA\s API to get the data and images about the space',
  'It\'s created for fun and also as a showcase for ThomTex, creating chat bots for various platform and deploying them on AWS Lambda',
  {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: 'More actions:',
        buttons: [{
          title: 'ThomTex',
          type: 'web_url',
          url: 'https://www.thomtex.com'
        }, {
          title: 'Source code',
          type: 'web_url',
          url: 'https://github.com/CodeGeekLuke/ThomTexSpaceBot'
        }]
      }
    }
  }
]

describe('About the bot', () => {
  it('should be a function', () => {
    expect(typeof about).toBe('function')
  })

  it('should transform the template to the expected json', () => {
    expect(about()).toEqual(expected)
  })
})
