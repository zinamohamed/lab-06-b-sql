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

app.get('/boba', async(_req, res) => {
  try {
    const data = await client.query(`
    SELECT
      boba.id,
      boba.image,
      boba.name,
      boba.sweetness_level,
      boba.boba_type,
      boba.size,
      boba.type_id,
      boba.owner_id
    FROM boba
    JOIN types
    ON boba.type_id = types.id`);
    
    res.json(data.rows);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});


app.get('/boba/:id', async(req, res) => {
  try {
    const id = req.params.id;

    const data = await client.query(`
    SELECT
        boba.id,
        boba.image,
        boba.name,
        boba.sweetness_level,
        boba.boba_type,
        boba.size,
        boba.type_id,
        boba.owner_id
    FROM boba
    JOIN types
    ON boba.type_id = types.id
    WHERE boba.id=$1`, [id]);
    
    res.json(data.rows[0]);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/boba', async(req, res) => {
  try {
    
    const data = await client.query(`
    INSERT INTO boba (image, name, sweetness_level,  boba_type, size, type_id, owner_id) 
    values ($1, $2, $3, $4, $5, $6, $7)
    returning *
    `, 

    [
      
      req.body.image, 
      req.body.name, 
      req.body.sweetness_level,
      req.body.boba_type,
      req.body.size, 
      req.body.type_id,
      1
    ]);
    
    res.json(data.rows[0]);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});


app.delete('/boba/:id', async(req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('delete from boba where id=$1 returning *', [id]);

    res.json(data.rows[0]);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.get('/types', async(req, res) => {
  try {
    const data = await client.query(`
    SELECT *
    FROM types`);
    
    res.json(data.rows);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});

// our put route needs the ID of the item to update
app.put('/boba/:id', async(req, res) => {
  // we get that id through req.params
  const id = req.params.id;

  try {
    // then we update the candy
    const data = await client.query(`UPDATE boba
      SET image = $1, name = $2, sweetness_level = $3, boba_type= $4, size = $5
      WHERE id=$6
      returning *;
    `,
    // this array is for SQL query sanitization
    [
      req.body.image, 
      req.body.name, 
      req.body.sweetness_level, 
      req.body.boba_type,
      req.body.size,
      id,
    ]);
    
    res.json(data.rows[0]);
  } catch (e) {
    
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
