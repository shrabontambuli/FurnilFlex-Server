const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware //

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ezafyme.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const userCollection = client.db('FurnilFlex').collection('users');
        const productCollection = client.db('FurnilFlex').collection('products');
        const cartCollection = client.db('FurnilFlex').collection('carts');


        // get api //
        app.get('/products', async (req, res) => {
            const product = await productCollection.find().toArray();
            res.send(product);
        });

        app.get('/cart', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const product = await cartCollection.find(query).toArray();
            res.send(product);
        });



        // post api //
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already existing' })
            }
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.post('/cart', async (req, res) => {
            const data = req.body;
            const alreadyAdded = await cartCollection.findOne({ email: data.email, productId: data.productId });
            if (alreadyAdded) {
                return res.send({success: false});
            }
            const result = await cartCollection.insertOne(data);
            const cart = await cartCollection.findOne({ _id: new ObjectId(result.insertedId)});
            res.send(cart);
        });


        // app.post('/cart', async (req, res) => {
        //     const data = req.body;
        //     const alreadyAdded = await cartCollection.findOne({ email: data.email, productId: data.productId });
        //     // let result;
        //     if (alreadyAdded) {
        //         return res.send({success: false});
        //         // result = await cartCollection.updateOne({ _id: new ObjectId(alreadyAdded._id) },{ $inc: { quantity: +1 },});
        //     }
        //     // else {
        //     //     result = await cartCollection.insertOne(data);
        //     // }
        //     const result = await cartCollection.insertOne(data);
        //     // const id = result?.insertedId || alreadyAdded._id;
        //     const cart = await cartCollection.findOne({ _id: new ObjectId(result.insertedId)});
        //     res.send(cart);
        // });

        // delete api //
        app.delete('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
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
    res.send("Hello Server........!!!!!!!!!!")
})

app.listen(port, () => {
    console.log(`Server is running on port, ${port}`);
})