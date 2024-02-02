const cors = require('cors');
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();

const app = express();

// Middile Ware
app.use(cors());
app.use(express.json())

// // For Handleing Cors Policy issues
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'https://edulodge-6481d.web.app');
//   next();
// })

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jvqibpv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    const usersCollection = client.db('Collages').collection('users');
    const collageCollection = client.db('Collages').collection('collages');
    const admissionsCollection = client.db('Collages').collection('admissions');
    const reviewsCollection = client.db('Collages').collection('reviews');
    const researchCollection = client.db('Collages').collection('research');

    

    // Search collages by collegeName
    app.get('/search-collages', async (req, res) => {
      const query = req.query.query;
      const result = await collageCollection.find({ collegeName: { $regex: query, $options: 'i' } }).toArray();
      res.send(result);
    });

    // Research Paper Api
    app.get('/research-papers', async (req, res) => {
      const result = await researchCollection.find().toArray();
      res.send(result)
    })

    // Client Feedback api 
    app.get('/reviews', async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })
    // Upload Feedback api
    app.post('/reviews', async (req, res) => {
      const newFeedback = req.body;
      const result = await reviewsCollection.insertOne(newFeedback);
      res.send(result)
    })

    // Admissions COllections api 
    app.post('/admissions', async (req, res) => {
      const application = req.body;
      const result = await admissionsCollection.insertOne(application);
      res.send(result);
    })

    app.get('/applications', async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      const query = { email: email };
      const result = await admissionsCollection.findOne(query);
      // console.log(result);
      res.send(result)
    })

    // Collage Api
    app.get('/all-collages', async (req, res) => {
      const result = await collageCollection.find().toArray()
      res.send(result)
    })

    // Collage Details 
    app.get('/details/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      // console.log(query);
      const result = await collageCollection.findOne(query);
      res.send(result)
    })


    // User Post On Database.
    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const exitingUser = await usersCollection.findOne(query);
      if (exitingUser) {
        // console.log(exitingUser);
        return res.send({ Message: 'User Already exiting on Database' })
      }
      const result = await usersCollection.insertOne(user);
      // console.log(result);
      res.send(result)
    })

    // New endpoint for handling PUT request to update user profile
    app.put('/user/:id', async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      delete updatedUser._id;

      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updatedUser },
        { returnOriginal: false }
      );
      // Set the CORS headers to allow requests from the 'https://edulodge-6481d.web.app' domain
      res.setHeader('Access-Control-Allow-Origin', 'https://edulodge-6481d.web.app');
      res.setHeader('Access-Control-Allow-Methods', 'PUT');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.send({ status: 'success' }); // Sending a dummy response for demonstration purposes
    });

    // Get User for Build Profile Info.
    app.get('/user', async (req, res) => {
      const email = req.query.email;
      const user = await usersCollection.findOne({ email });
      // console.log(user);
      res.send(user);
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Asslamualikom Server Is Running')
})

app.listen(port, () => {
  console.log('Hey! Developer!! No Pain No Gain');
  console.log(`Server is Running On Port ${port}`);
})