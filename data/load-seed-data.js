/* eslint-disable no-console */
const client = require('../lib/client');
// import our seed data:
const boba = require('./boba.js');
const usersData = require('./users.js');
const typesData = require('./types.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
    
    await Promise.all(
      typesData.map(type => {
        return client.query(`
                      INSERT INTO types (name)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [type.name]);
      })
    );
    
    const user = users[0].rows[0];

    await Promise.all(
      boba.map(bobas => {
        return client.query(`
                    INSERT INTO boba (image, name, sweetness_level, boba_type, size, type_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [bobas.image, bobas.name, bobas.sweetness_level, bobas.boba_type, bobas.size, bobas.type_id, user.id]);
      })
    );
    

    // eslint-disable-next-line no-console
    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
