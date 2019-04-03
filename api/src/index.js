const express = require('express')
const app = express()

const PORT = process.env.COMIC_READER_PORT || 3000

app.use(express.json())
require('./reader')(app)
require('./writer')(app)

app.listen(PORT, () => console.log(`Comic reader listening on port ${PORT}!`))
