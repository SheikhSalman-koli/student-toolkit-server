require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000
const OpenAI = require("openai");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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

const openAi = new OpenAI({
  apiKey: process.env.API_KEY_AI
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const DB = client.db('student-toolkit')

    const classCollection = DB.collection('classes')
    const budgetCollection = DB.collection('budget')

    app.post('/saveClass', async (req, res) => {
      const newClass = req.body
      const result = await classCollection.insertOne(newClass)
      res.send(result)
    })

    app.get('/my-schedules/:email', async (req, res) => {
      const email = req?.params.email
      //  console.log(email, req.params);
      const result = await classCollection.find({ email }).sort({ startTime: 1 }).toArray()
      res.send(result)
    })

    app.delete('/deleteschedule/:id', async (req, res) => {
      const id = req?.params.id
      const filter = { _id: new ObjectId(id) }
      const result = await classCollection.deleteOne(filter)
      res.send(result)
    })

    app.patch('/update-schedule/:id', async (req, res) => {
      const id = req?.params.id
      const filter = { _id: new ObjectId((id)) }
      const updatedData = req?.body
      const options = { upsert: true }
      const updatedDoc = {
        $set: updatedData
      }
      const updatedResult = await classCollection.updateOne(filter, updatedDoc, options)
      res.send(updatedResult)
    })

    app.post('/saveBudget', async (req, res) => {
      const newBudget = req?.body
      const result = await budgetCollection.insertOne(newBudget)
      res.send(result)
    })


    // open AI
    app.post("/chat", async (req, res) => {
      try {
        const { message } = req.body;

        const response = await openAi.chat.completions.create({
          model: "gpt-4o-mini", // or "gpt-4o", "gpt-4.1"
          messages: [{ role: "user", content: message }],
        });

        res.json({ reply: response.choices[0].message.content });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
      }
    });




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('hello from student toolkit')
})

app.listen(port, () => {
  console.log(`Toolkit is running on port ${port}`);
})