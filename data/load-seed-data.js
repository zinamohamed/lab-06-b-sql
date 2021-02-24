/* eslint-disable no-console */
const client = require('../lib/client');
// import our seed data:
const products = require('./products.js');
const usersData = require('./users.js');
const categoriesData = require('./categories.js');
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
      categoriesData.map(category => {
        return client.query(`
                      INSERT INTO categories (name)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [category.name]);
      })
    );
    
    const user = users[0].rows[0];

    await Promise.all(
      products.map(product => {
        return client.query(`
                    INSERT INTO products (image, name, size, price, category_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
        [product.image, product.name, product.size, product.price, product.category_id, user.id]);
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
