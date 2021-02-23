const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/products', async(_req, res) => {
  try {
    const data = await client.query('SELECT * from products');
    
    res.json(data.rows);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/products/:id', async(req, res) => {
  try {
    const id = req.params.id;

    const data = await client.query('SELECT * from products WHERE id=$1', [id]);
    
    res.json(data.rows[0]);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/products', async(req, res) => {
  try {
    
    const data = await client.query(`
    insert into products (image, name, size, price, type, owner_id) 
    values ($1, $2, $3, $4, $5, $6)
    returning *
    `, 

    [
      
      req.body.image, 
      req.body.name, 
      req.body.size, 
      req.body.price,
      req.body.type,
      1
    ]);
    
    res.json(data.rows[0]);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.put('/products/:id', async(req, res) => {
  
  const id = req.params.id;

  try {
    
    const data = await client.query(`
      UPDATE products SET image = $1, name = $2, size = $3, price = $4, type = $5 
      WHERE id=$6
      returning *;
    `,
    
    [
      
      req.body.image, 
      req.body.name, 
      req.body.size, 
      req.body.price,
      req.body.type,
      id,
    ]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
