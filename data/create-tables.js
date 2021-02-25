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
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                );    
                CREATE TABLE types (
                  id SERIAL PRIMARY KEY NOT NULL,
                  name VARCHAR(512) NOT NULL
              );       
                CREATE TABLE boba (
                    id SERIAL PRIMARY KEY NOT NULL,
                    image VARCHAR(512) NOT NULL,
                    name VARCHAR(512) NOT NULL,
                    sweetness_level VARCHAR(512) NOT NULL,
                    boba_type VARCHAR(512) NOT NULL,
                    size VARCHAR(512) NOT NULL,
                    type_id INTEGER NOT NULL REFERENCES types(id),
                    owner_id INTEGER NOT NULL REFERENCES users(id)
                );
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
