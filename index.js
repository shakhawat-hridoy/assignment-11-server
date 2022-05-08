const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.dbName}:${process.env.dbPass}@cluster0.miwtj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const fruitCollection = client.db("perfume-store").collection("perfumes");

    app.get("/items", async (req, res) => {
      const query = {};
      const cursor = fruitCollection.find(query);
      console.log(cursor);

      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);

      let items;

      if (page || size) {
        items = await cursor
          .skip(page * size)
          .limit(size)
          .toArray();
      } else {
        items = await cursor.toArray();
      }

      res.send(items);
    });

    app.get("/itemsCount", async (req, res) => {
      const query = {};
      const cursor = fruitCollection.find(query);

      const count = await fruitCollection.estimatedDocumentCount();
      res.send({ count });
    });

    app.get("/item/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await fruitCollection.findOne(query);
      res.send(result);
    });

    app.put("/delivered/:id", async (req, res) => {
      const id = req.params.id;
      const updatedItem = req.body;

      console.log(updatedItem);

      const filter = { _id: ObjectId(id) };

      const options = { upsert: true };

      const updatedDoc = {
        $set: {
          Quantity: updatedItem.Quantity,
          sale: updatedItem.sale,
        },
      };

      const result = await fruitCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });

    app.put("/restock/:id", async (req, res) => {
      const id = req.params.id;
      const updatedItem = req.body;

      const filter = { _id: ObjectId(id) };

      const options = { upsert: true };

      const updatedDoc = {
        $set: {
          Quantity: updatedItem.Quantity,
        },
      };

      const result = await fruitCollection.updateOne(
        filter,
        updatedDoc,
        options
      );

      res.send(result);
    });

    app.post("/addnewitem", async (req, res) => {
      const newItem = req.body;
      const result = await fruitCollection.insertOne(newItem);

      res.send(result);
    });

    app.post("/deleteitem", async (req, res) => {
      const id = req.body;
      console.log(id);

      const result = await fruitCollection.deleteOne({ _id: ObjectId(id) });

      res.send(result);
    });
  } finally {
    /* await client.close(); */
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Fruit server is running");
});

app.listen(port, () => {
  console.log("Fruit-server is runnig in", port);
});
