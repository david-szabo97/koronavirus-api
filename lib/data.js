const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const axios = require('axios').default
const parse = require('csv-parse')
const moment = require('moment')

const csvParseAsync = promisify(parse)
const writeFileAsync = promisify(fs.writeFile)
const readFileAsync = promisify(fs.readFile)

const DATA_URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/{date}.csv'
const FILE_PATH = path.join(__dirname, '..', 'downloads', 'full_data.json')

async function downloadData () {
  const dataUrl = DATA_URL.replace('{date}', moment().subtract(1, 'days').format('MM-DD-YYYY'))
  const response = await axios.get(dataUrl)

  return response.data
}

async function parseData (data) {
  const output = await csvParseAsync(data, {
    delimiter: ','
  })

  return output
}

async function processData (data) {
  const byLocation = data
    .slice(1)
    .reduce((
      acc,
      [
        fips,
        admin2,
        province,
        country,
        lastUpdate,
        latitude,
        longitude,
        confirmed,
        deaths,
        recovered,
        active,
        combinedKey
      ]
    ) => {
      const id = `${province}-${country}`

      if (acc[id]) {
        acc[id] = {
          ...acc[id],
          confirmed: acc[id].confirmed + parseInt(confirmed),
          deaths: acc[id].deaths + parseInt(deaths),
          recovered: acc[id].recovered + parseInt(recovered)
        }
      } else {
        acc[id] = {
          id,
          province,
          country,
          lastUpdate,
          confirmed: parseInt(confirmed),
          deaths: parseInt(deaths),
          recovered: parseInt(recovered),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      }

      return acc
    }, {})

  return byLocation
}

async function saveData (data) {
  await writeFileAsync(FILE_PATH, JSON.stringify(data))
  return true
}

async function loadData () {
  const raw = await readFileAsync(FILE_PATH)
  const data = JSON.parse(raw)

  return data
}

async function updateData () {
  const raw = await downloadData()
  const parsed = await parseData(raw)
  const processed = await processData(parsed)

  await saveData(processed)

  return true
}

module.exports = {
  loadData,
  updateData
}
