const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;

// Middle Wire
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uym3z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("VacationSpot");
    const SpotCollection = await database.collection("spots");
    const bookingCollection = await database.collection("bookings");

    app.get("/spots", async (req, res) => {
      const cursor = SpotCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    // GET API data of booking
    app.get("/booking", async (req, res) => {
      const cursor = bookingCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });
    // POST API to Get Data
    app.post("/booking", async (req, res) => {
      const data = req.body;
      const result = await bookingCollection.insertOne(data);
      res.json(result);
    });
    app.put("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;

      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: data.status,
          name: data.name,
          email: data.email,
          arrival: data.arrival,
          departure: data.departure,
          roomType: data.roomType,
          roomNumber: data.roomNumber,
          des: data.des,
        },
      };
      console.log(updateDoc);
      const result = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.json(result);
    });

    // POST API for Login
    app.post("/spots", async (req, res) => {
      const data = req.body;
      const result = await SpotCollection.insertOne(data);
      res.json(result);
    });
    // DELETE Bookings
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Book Server Is Running");
});
app.listen(port, () => {
  console.log("Listening to port:", port);
});
