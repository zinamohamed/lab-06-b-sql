const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();
    
    await client.query(`
            DROP TABLE IF EXISTS users CASCADE;
            DROP TABLE IF EXISTS products;
            DROP TABLE IF EXISTS categories CASCADE;
        `);

    // eslint-disable-next-line no-console
    console.log(' drop tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
