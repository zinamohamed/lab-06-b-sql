require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns products', async() => {

      const expectation = [
        {
          'id': 1, 
          'image': 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          'name': 'Niacinamide 10%', 
          'size': '16ml',
          'price': '$15',
          'type': 'Serum',
          'owner_id': 1
        }, 
        {
          'id': 2, 
          'image': 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          'name': 'Retinol 0.5%', 
          'size': '12ml',
          'price': '$35',
          'type': 'Exfoliant',
          'owner_id': 1
        },
        {
          'id': 3, 
          'image': 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          'name': 'AHA+BHA Solution', 
          'size': '12ml',
          'price': '$50',
          'type': 'Exfoliant',
          'owner_id': 1
        },
      ];

      const data = await fakeRequest(app)
        .get('/products')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    
    test('returns single product', async() => {

      const expectation =
      {
        'id': 1, 
        'image': 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
        'name': 'Niacinamide 10%', 
        'size': '16ml',
        'price': '$15',
        'type': 'Serum',
        'owner_id': 1
      };

      const data = await fakeRequest(app)
        .get('/products/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    
    test('creates a new product and that new product is in our product list', async() => {
      // define the new product we want create
      const newProduct = { 
        
        'image': 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
        'name': 'Alpha Arbutin', 
        'size': '12ml',
        'price': '$12',
        'type': 'Serum',
        
        
      };

      // define what we expect that product to look like after SQL does its thing
      const expectedProduct = {
        ...newProduct,
        'id': 4,
        'owner_id': 1,
      };

      // use the post endpoint to create a product
      const data = await fakeRequest(app)
        .post('/products')
        // pass in our new product as the req.body
        .send(newProduct)
        .expect('Content-Type', /json/)
        .expect(200);

      // we expect the post endpoint to responds with our expected product
      expect(data.body).toEqual(expectedProduct);

      //  check that the new product is in DB
      const allProducts = await fakeRequest(app)
        // fetch all the products
        .get('/products')
        .expect('Content-Type', /json/)
        .expect(200);

      // find Alpha Arbutin
      const alphaArbutin = allProducts.body.find(product => product.name === 'Alpha Arbutin');

      // check to see that Alpha Arbutin matches the one we expected
      expect(alphaArbutin).toEqual(expectedProduct);
    });
    
    test('updates a product', async() => {
      // define the new candy we want create
      const newProduct = {
        
        'image': 'test',
        'name': 'test', 
        'size': 'test',
        'price': 'test',
        'type': 'test',
        
      };

      const expectedProduct = {
        ...newProduct,
        'id': 1,
        'owner_id': 1,
      };


      // use the put endpoint to update a candy
      await fakeRequest(app)
        .put('/products/1')
        // pass in our new candy as the req.body
        .send(newProduct)
        .expect('Content-Type', /json/)
        .expect(200);

      // go grab the candy we expect to be updated
      const updatedProduct = await fakeRequest(app)
        .get('/products/1')
        .expect('Content-Type', /json/)
        .expect(200);

      // check to see that it matches our expectations
      expect(updatedProduct.body).toEqual(expectedProduct);
    });
  });
});
