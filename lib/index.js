const CronJob = require('cron').CronJob
const { updateData } = require('./data')

const job = new CronJob('0 */4 * * *', async () => {
  await updateData()
  console.log('Updated data')
})
job.start()

updateData()
require('./web')
