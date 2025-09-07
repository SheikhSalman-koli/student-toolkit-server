require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.dclhmji.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const DB = client.db('student-toolkit')

    const classCollection = DB.collection('classes')

    app.post('/saveClass', async(req, res)=>{
      const newClass = req.body
      const result = await classCollection.insertOne(newClass)
      res.send(result)
    })

    app.get('/my-schedules/:email', async(req,res)=>{
       const email = req?.params.email
       const result = await classCollection.find({email}).toArray()
       res.send(result)
    })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=> {
    res.send('hello from medical camp')
})

app.listen(port,()=>{
    console.log(`medical camp is running on port ${port}`);
})