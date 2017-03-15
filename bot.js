'use strict'

const rp = require('minimal-request-promise')
const botBuilder = require('claudia-bot-builder')
const fbTemplate = botBuilder.fbTemplate

function getRoverPhotos(rover, sol, nasaApiKey) {
  if (!sol)
    sol = (parseInt(Math.random() * 9) + 1) * 100

  return rp.get(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${nasaApiKey}`)
    .then(response => {
      let rawBody = response.body

      let roverInfo = JSON.parse('' + rawBody)
      let photos = roverInfo.photos.slice(0, 10)
      let roverImages = new fbTemplate.generic()

      photos.forEach(photo => {
        return roverImages.addBubble(photo.rover.name, 'At ' + photo.earth_date + ' (sol ' + photo.sol + '), using ' + photo.camera.full_name)
          .addImage(photo.img_src)
          .addButton('Download', photo.img_src)
      })

      return [
        `${roverInfo.photos[0].rover.name} rover`,
        `Landing Date: ${roverInfo.photos[0].rover.landing_date} \nTotal photos: ${roverInfo.photos[0].rover.total_photos}`,
        roverImages.get(),
        new fbTemplate.button('More actions:')
          .addButton('Show newest photos', `PHOTOS_${rover}_${roverInfo.photos[0].rover.max_sol}`)
          .addButton('Visit Wikipedia', `https://en.wikipedia.org/wiki/${rover}_(rover)`)
          .addButton('Back to start', 'MAIN_MENU')
          .get()
      ]
    })
    .catch(err => {
      console.log(err)
      return getRoverPhotos(rover, 1000, nasaApiKey)
    })
}

function mainMenu() {
  return new fbTemplate.generic()
    .addBubble(`NASA's Astronomy Picture of the Day`, 'Satellite icon by parkjisun from the Noun Project')
      .addImage('https://github.com/CodeGeekLuke/ThomTexSpaceBot/blob/master/assets/images/apod.png')
      .addButton('Show', 'SHOW_APOD')
      .addButton('What is APOD?', 'ABOUT_APOD')
      .addButton('Website', 'http://apod.nasa.gov/apod/')
    .addBubble(`Photos from NASA's rovers on Mars`, 'Curiosity Rover icon by Oliviu Stoian from the Noun Project')
      .addImage('https://github.com/CodeGeekLuke/ThomTexSpaceBot/blob/master/assets/images/rovers.png')
      .addButton('Curiosity', 'CURIOSITY_IMAGES')
      .addButton('Opportunity', 'OPPORTUNITY_IMAGES')
      .addButton('Spirit', 'SPIRIT_IMAGES')
    .addBubble('International Space Station', 'Space station icon by Lucid Formation from the Noun Project')
      .addImage('https://github.com/CodeGeekLuke/ThomTexSpaceBot/blob/master/assets/images/iss.png')
      .addButton('Current position', 'ISS_POSITION')
      .addButton('Website', 'https://www.nasa.gov/mission_pages/station/')
    .addBubble('How many people are in Space right now?', 'Astronaut icon by Javier Cabezas from the Noun Project')
      .addImage('https://github.com/CodeGeekLuke/ThomTexSpaceBot/blob/master/assets/images/astronaut.png')
      .addButton('Show', 'PEOPLE_IN_SPACE')
      .addButton('Website', 'http://www.howmanypeopleareinspacerightnow.com')
    .addBubble('Help & info', 'Monster icon by Paulo Sá Ferreira from the Noun Project')
      .addImage('https://github.com/CodeGeekLuke/ThomTexSpaceBot/blob/master/assets/images/about.png')
      .addButton('About the bot', 'ABOUT')
      .addButton('Credits', 'CREDITS')
      .addButton('Report an issue', 'https://github.com/CodeGeekLuke/ThomTexSpaceBot/issues')
    .get()
}

const api = botBuilder((request, originalApiRequest) => {
  console.log(JSON.stringify(request))
  originalApiRequest.lambdaContext.callbackWaitsForEmptyEventLoop = false

  if (!request.postback)
    return rp.get(`https://graph.facebook.com/v2.6/${request.sender}?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=${originalApiRequest.env.facebookAccessToken}`)
      .then(response => {
        const user = JSON.parse(response.body)
        return [
          `Hello ${user.first_name}. Welcome to Space Explorer! Ready to start a journey through space?`,
          'What can I do for you today?',
          mainMenu()
        ]
      })

  if (request.text === 'SHOW_APOD')
    return rp.get(`https://api.nasa.gov/planetary/apod?api_key=${originalApiRequest.env.nasaApiKey}`)
      .then(response => {
        const APOD = JSON.parse(response.body)
        return [
          `NASA's Astronomy Picture of the Day for ${APOD.date}`,
          `"${APOD.title}"` + (APOD.copyright ? `, © ${APOD.copyright}` : ''),
          APOD.media_type === 'image' ? new fbTemplate.image(APOD.url).get() : APOD.url,
          APOD.explanation,
          new fbTemplate.button('More actions:')
            .addButton('Download HD', APOD.hdurl || APOD.url)
            .addButton('Visit website', 'http://apod.nasa.gov/apod/')
            .addButton('Back to start', 'MAIN_MENU')
            .get()
        ]
      })

  if (request.text === 'ISS_POSITION')
    return rp.get('https://api.wheretheiss.at/v1/satellites/25544')
      .then(response => {
        const ISS = JSON.parse(response.body)
        return [
          new fbTemplate.generic()
            .addBubble(`International Space Station`, 'Current position')
              .addImage(`https://maps.googleapis.com/maps/api/staticmap?center=${ISS.latitude},${ISS.longitude}&zoom=2&size=640x335&markers=color:red%7C${ISS.latitude},${ISS.longitude}`)
              .addButton('Show website', 'http://iss.astroviewer.net')
            .get(),
            `International Space Station:`,
            `- Latitude: ${ISS.latitude};\n- Longitude: ${ISS.longitude};\n- Velocity: ${ISS.velocity}kmh;\n- Altitude: ${ISS.altitude};\n- Visibility: ${ISS.visibility}`
        ]
      })

  if (request.text === 'PEOPLE_IN_SPACE')
    return rp.get('http://api.open-notify.org/astros.json')
      .then(response => {
        const inSpace = JSON.parse(response.body)
        return [
          `There are ${inSpace.number} people in Space right now.`,
          inSpace.people.reduce((response, person) => {
            return response + `- ${person.name}` + ((person.craft) ? ` is on ${person.craft}` : '') + ';\n'
          }, '')
        ]
      })

  if (request.text === 'MAIN_MENU')
    return mainMenu()

  if (request.text === 'CURIOSITY_IMAGES')
    return getRoverPhotos('curiosity', null, originalApiRequest.env.nasaApiKey)

  if (request.text === 'OPPORTUNITY_IMAGES')
    return getRoverPhotos('opportunity', null, originalApiRequest.env.nasaApiKey)

  if (request.text === 'SPIRIT_IMAGES')
    return getRoverPhotos('spirit', null, originalApiRequest.env.nasaApiKey)

  if (request.text.indexOf('PHOTOS_') === 0) {
    const args = request.text.split('_')
    return getRoverPhotos(args[1], args[2], originalApiRequest.env.nasaApiKey)
  }

  if (request.text === 'ABOUT_APOD')
    return [
      `The Astronomy Picture of the Day is one of the most popular websites at NASA. In fact, this website is one of the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.`,
      `Each day a different image or photograph of our fascinating universe is featured, along with a brief explanation written by a professional astronomer.`,
      new fbTemplate.button('More actions:')
        .addButton('Show photo', 'SHOW_APOD')
        .addButton('Visit website', 'http://apod.nasa.gov/apod/')
        .addButton('Back to start', 'MAIN_MENU')
        .get()
    ]

  if (request.text === 'ABOUT')
    return [
      `ThomTex Space Explorer is simple Messenger chat bot that uses NASA's API to get the data and images about the space`,
      `It's created for fun and also as a showcase for ThomTex, deploying bots on AWS Lambda`,
      new fbTemplate.button('More actions:')
        .addButton('ThomTex', 'https://ThomTex.com')
        .addButton('Source code', 'https://github.com/CodeGeekLuke/ThomTexSpaceBot')
        .get()
    ]

  if (request.text === 'CREDITS')
    return [
      'ThomTex Space Explorer was created by The ThomTex Team',
      'Icons used for the bot are from the Noun Project',
      '- Rocket icon by misirlou, \n- Satellite icon by parkjisun, \n- Curiosity Rover icon by Oliviu Stoian, \n- Monster icon by Paulo Sá Ferreira',
      'This bot was created by ThomTex Dev Team',
      new fbTemplate.button('More actions:')
        .addButton('ThomTex', 'https://thomtex.com')
        .addButton('The Noun Project', 'https://thenounproject.com')
        .addButton('Source code', 'https://github.com/CodeGeekLuke/ThomTexSpaceBot')
        .addButton('Report a issue', 'https://github.com/CodeGeekLuke/ThomTexSpaceBot/issues')
        .get()
    ]
})

api.addPostDeployConfig('nasaApiKey', 'NASA API Key:', 'configure-app');

module.exports = api