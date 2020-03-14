const express = require('express')
const cors = require('cors')
const { loadData, updateData } = require('./data')

const app = express()
const port = process.env.PORT || 3000

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/covid-19-data', async (req, res) => {
  const data = await loadData()
  res.json(data)
})

app.post('/covid-19-data-update', async (req, res) => {
  await updateData()
  res.json({ success: true })
})

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`)
})
