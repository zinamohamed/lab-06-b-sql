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
  });
});
