const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.66dpl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });

async function run(){
    try{
        await client.connect();
        const samsungCollection = client.db('bhuiyan_mobile').collection('samsung');
        const iPhoneCollection = client.db('bhuiyan_mobile').collection('iPhone');
        const xiaomiCollection = client.db('bhuiyan_mobile').collection('xiaomi');
        const oppoCollection = client.db('bhuiyan_mobile').collection('oppo');
        const vivoCollection = client.db('bhuiyan_mobile').collection('vivo');
        const realmeCollection = client.db('bhuiyan_mobile').collection('realme');
        const userCollection = client.db('bhuiyan_mobile').collection('users');

        //login user data collect
        app.put('/user/:email', async(req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = {upsert: true};
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });
        
        //get all users
        app.get('/user', async(req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });

        app.get('/samsung', async(req, res) => {
            const query = {};
            const cursor = samsungCollection.find(query);
            const samsungPhone = await cursor.toArray();
            res.send(samsungPhone);
        });

        app.get('/iPhone', async(req, res) => {
            const iPhoneMobile = await iPhoneCollection.find().toArray();
            res.send(iPhoneMobile);
        });

        app.get('/xiaomi', async(req, res) => {
            const xiaomiPhone = await xiaomiCollection.find().toArray();
            res.send(xiaomiPhone);
        });

        app.get('/oppo', async(req, res) => {
            const oppoPhone = await oppoCollection.find().toArray();
            res.send(oppoPhone);
        });

        app.get('/vivo', async(req, res) => {
            const vivoPhone = await vivoCollection.find().toArray();
            res.send(vivoPhone);
        });

        app.get('/realme', async(req, res) => {
            const realmePhone = await realmeCollection.find().toArray();
            res.send(realmePhone);
        })
    }
    finally{

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Bhuiyan_Mobile');
});

app.listen(port, () => {
    console.log(`Bhuiyan_Mobile ${port}`);
})
