const DB_FILE = process.env.COMIC_READER_DB_FILE || './comics.sqlite'

const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: DB_FILE },
  useNullAsDefault: false
})

function galleriesSchema(t) {
  t.integer('id').primary()
  t.integer('tid')
  t.string('title')
  t.string('thumbnail')
  t.timestamp('uploaded')
  t.float('rating')
  t.string('uploader')
  t.integer('pages')
  t.boolean('has_torrent')
  t.string('source')
}

function tagsSchema(t) {
  t.string('id').primary()
  t.string('category')
}

function galleryTagsSchema(t) {
  t.integer('gallery')
  t.foreign('gallery').references('galleries.id')
  t.string('tag')
  t.foreign('tag').references('tags.id')
  t.primary(['gallery', 'tag'])
}

function galleryDownloadsSchema(t) {
  t.integer('gallery')
  t.foreign('gallery').references('galleries.id')
  t.string('location')
  t.primary(['gallery', 'location'])
}

Promise.resolve()
  .then(() => knex.schema.hasTable('galleries'))
  .then(exists => { if (!exists) { return knex.schema.createTable('galleries', galleriesSchema) }})
  .then(() => knex.schema.hasTable('tags'))
  .then(exists => { if (!exists) { return knex.schema.createTable('tags', tagsSchema) }})
  .then(() => knex.schema.hasTable('gallery_tags'))
  .then(exists => { if (!exists) { return knex.schema.createTable('gallery_tags', galleryTagsSchema) }})
  .then(() => knex.schema.hasTable('gallery_downloads'))
  .then(exists => { if (!exists) { return knex.schema.createTable('gallery_downloads', galleryDownloadsSchema) }})
  .then(() => console.log('all tables ready!'))
  .catch(e => console.log(e))
