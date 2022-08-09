const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.66dpl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//Json Web Token
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const samsungCollection = client.db('bhuiyan_mobile').collection('samsung');
        const iPhoneCollection = client.db('bhuiyan_mobile').collection('iPhone');
        const xiaomiCollection = client.db('bhuiyan_mobile').collection('xiaomi');
        const oppoCollection = client.db('bhuiyan_mobile').collection('oppo');
        const vivoCollection = client.db('bhuiyan_mobile').collection('vivo');
        const realmeCollection = client.db('bhuiyan_mobile').collection('realme');
        const userCollection = client.db('bhuiyan_mobile').collection('users');

        //login user data collect
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
            res.send({ result, token });
        });

        //get all users
        app.get('/user', verifyJWT, async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        });

        //Make an Admin temporary or first admin 
        // app.put('/user/admin/:email', async(req, res) => {
        //     const email = req.params.email;
        //     const filter = {email: email};
        //     const updateDoc = {
        //         $set: {role: 'admin'},
        //     };
        //     const result = await userCollection.updateOne(filter, updateDoc);
        //     res.send(result);
        // });

        //An Admin make another admin without admin no one can do this
        app.put('/user/:admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const initiator = req.decoded.email;
            const initiatorAccount = await userCollection.findOne({ email: initiator });
            if (initiatorAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);
            }
            else {
                return res.status(403).send({ message: 'Forbidden access' });
            }
        });

        //Is this user is admin or not
        app.get('/admin/:email', verifyJWT, async(req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({email: email});
            const isAdmin = user.role === 'admin';
            res.send({admin: isAdmin});
        });
        //Remove user by admin
        // app.delete('/user/:id', async(req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     console.log('user id from node',query);
        //     const result = await userCollection.deleteOne(query);
        //     res.send(result);
        // });

        app.delete('/user/:_id', async(req, res) => {
            const id = req.params._id;
            const query = { _id: ObjectId(id) }
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        app.get('/samsung', async (req, res) => {
            const query = {};
            const cursor = samsungCollection.find(query);
            const samsungPhone = await cursor.toArray();
            res.send(samsungPhone);
        });

        app.get('/iPhone', async (req, res) => {
            const iPhoneMobile = await iPhoneCollection.find().toArray();
            res.send(iPhoneMobile);
        });

        app.get('/xiaomi', async (req, res) => {
            const xiaomiPhone = await xiaomiCollection.find().toArray();
            res.send(xiaomiPhone);
        });

        app.get('/oppo', async (req, res) => {
            const oppoPhone = await oppoCollection.find().toArray();
            res.send(oppoPhone);
        });

        app.get('/vivo', async (req, res) => {
            const vivoPhone = await vivoCollection.find().toArray();
            res.send(vivoPhone);
        });

        app.get('/realme', async (req, res) => {
            const realmePhone = await realmeCollection.find().toArray();
            res.send(realmePhone);
        })
    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Bhuiyan_Mobile');
});

app.listen(port, () => {
    console.log(`Bhuiyan_Mobile ${port}`);
})
