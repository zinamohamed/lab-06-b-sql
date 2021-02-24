const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

// async/await needs to run in a function
run();

async function run() {

  try {
    // initiate connecting to db
    await client.connect();

    // run a query to create tables
    await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY NOT NULL,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                );           
                CREATE TABLE products (
                    id SERIAL PRIMARY KEY NOT NULL,
                    image VARCHAR(512) NOT NULL,
                    name VARCHAR(512) NOT NULL,
                    size VARCHAR(512) NOT NULL,
                    price VARCHAR(512) NOT NULL,
                    category_id INTEGER NOT NULL REFRENCES categories(id),
                    owner_id INTEGER NOT NULL REFERENCES users(id)
                );
                CREATE TABLE categories (
                    id SERIAL PRIMARY KEY NOT NULL,
                    name VARCHAR(512) NOT NULL
                )
        `);

    // eslint-disable-next-line no-console
    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    // problem? let's see the error...
    // eslint-disable-next-line no-console
    console.log(err);
  }
  finally {
    // success or failure, need to close the db connection
    client.end();
  }

}
