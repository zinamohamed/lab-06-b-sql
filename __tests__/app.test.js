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

    test('returns all boba', async() => {

      const expectation = [
        {
          id: 3, 
          image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          name: 'Honey Lemonade Tea', 
          sweetness_level: '50%',
          boba_type: 'Popping Boba',
          size: '20ml',
          type_id: 1,
          owner_id:1,         
        },
        {
          id: 2, 
          image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          name: 'Tropical Fruit Tea', 
          sweetness_level: '80%',
          boba_type: 'Tapioca Pearl',
          size: '16ml',
          type_id: 1,
          owner_id:1,
         
        },
        {
          id: 1, 
          image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          name: 'Mango Passion Tea', 
          sweetness_level: '100%',
          boba_type: 'Lychee Jelly',
          size: '12ml',
          type_id: 1,
          owner_id:1,
        }, 
        {
          id: 6, 
          image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          name: 'Classic Milk Tea', 
          sweetness_level: '100%',
          boba_type: 'Popping Boba',
          size: '12ml',
          type_id: 2,
          owner_id:1,
          
        },
        {
          id: 5, 
          image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          name: 'Taro Pearl Milk Tea', 
          sweetness_level: '80%',
          boba_type: 'Tapioca Pearl',
          size: '12ml',
          type_id: 2,
          owner_id:1,
          
        },
        {
          id: 4, 
          image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          name: 'Hokkaido Milk Tea', 
          sweetness_level: '50%',
          boba_type: 'Tapioca Pearl',
          size: '12ml',
          type_id: 2,
          owner_id:1,
          
        },
        {
          id: 9, 
          image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          name: 'Classic Black Tea', 
          sweetness_level: '50%',
          boba_type: 'Popping Boba',
          size: '12ml',
          type_id: 3,
          owner_id:1,
          
        },
        {
          id: 8, 
          image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          name: 'Winter-Lemon Tea', 
          sweetness_level: '80%',
          boba_type: 'Tapioca Pearls',
          size: '12ml',
          type_id: 3,
          owner_id:1,
          
        },
        {
          id: 7, 
          image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
          name: 'Classic Green Tea', 
          sweetness_level: '100%',
          boba_type: 'Lychee Jelly',
          size: '12ml',
          type_id: 3,
          owner_id:1,
          
        },
      ];

      const data = await fakeRequest(app)
        .get('/boba')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    
    test('returns single Boba', async() => {

      const expectation =
      {
        id: 9, 
        image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
        name: 'Classic Black Tea', 
        sweetness_level: '50%',
        boba_type: 'Popping Boba',
        size: '12ml',
        type_id: 3,
        owner_id: 1
        
      };

      const data = await fakeRequest(app)
        .get('/boba/9')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
    
    test('creates a new Boba and that new Boba is in our Boba list', async() => {
      // define the new Boba we want create
      const newBoba = { 
        
         
        image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
        name: 'Classic Oolong Tea', 
        sweetness_level: '50%',
        boba_type: 'Popping Boba',
        size: '16ml',
        type_id: 3,
        

        
        
      };

      // define what we expect that Boba to look like after SQL does its thing
      const expectedBoba = {
        ...newBoba,
        id: 10,
        owner_id: 1,

      };

      // use the post endpoint to create a Boba
      const data = await fakeRequest(app)
        .post('/boba')
        // pass in our new Boba as the req.body
        .send(newBoba)
        .expect('Content-Type', /json/)
        .expect(200);

      // we expect the post endpoint to responds with our expected Boba
      expect(data.body).toEqual(expectedBoba);

      //  check that the new Boba is in DB
      const allBoba = await fakeRequest(app)
        // fetch all the boba
        .get('/boba')
        .expect('Content-Type', /json/)
        .expect(200);

      
      const newTea = allBoba.body.find(bobas => bobas.name === 'Classic Oolong Tea');


      
      expect(newTea).toEqual(expectedBoba);
    });
    
    test('updates a Boba', async() => {
      // define the new Bobawe want create
      const newBoba = {
        image: 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
        name: 'Honey Lemonade Tea', 
        sweetness_level: '50%',
        boba_type: 'Popping Boba',
        size: '20ml',
        type_id: 1,
      };

      const expectedBoba = {
        ...newBoba,
        id: 3,
        owner_id:1
      };
      
      // use the put endpoint to update a candy
      await fakeRequest(app)
        .put('/boba/3')
        .send(newBoba)
        .expect('Content-Type', /json/)
        .expect(200);

      // go grab the Bobawe expect to be updated
      const updatedBoba = await fakeRequest(app)
        .get('/boba/3')
        .expect('Content-Type', /json/)
        .expect(200);

      // check to see that it matches our expectations
      expect(updatedBoba.body).toEqual(expectedBoba);
    });
    
    test('returns types', async() => {

      const expectation = [
        {
          id: 1,
          name: 'Fruit Tea',
        },
        {
          id: 2,
          name: 'Milk Tea',
        },
        {
          id: 3,
          name: 'Brewed Tea',
        }
      ];

      const data = await fakeRequest(app)
        .get('/types')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('deletes Boba from Boba directory', async() => { 
      
      const deletedBoba = { 
        'id': 5, 
        'image': 'https://media2.giphy.com/media/aMO3eGc9frP9i24AqG/source.gif',
        'name': 'Taro Pearl Milk Tea', 
        'sweetness_level': '80%',
        'boba_type': 'Tapioca Pearl',
        'size': '12ml',
        'type_id': 2,
        'owner_id':1,
      };

      const data = await fakeRequest(app)
        .delete('/boba/5')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(data.body).toEqual(deletedBoba);

      const nothing = await fakeRequest(app)
        .get('/boba/5')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(nothing.body).toEqual('');
    });
  });
});
