require('dotenv').config();
const express = require('express');
const { connectToDb } = require('./db.js');

const fs = require('fs');
const { ApolloServer } = require('apollo-server-express');

const port = process.env.API_SERVER_PORT;

const productList = async () => db.collection('products').find({}).toArray();

const addProduct = async (_, { product }) => {
  const newProduct = { ...product };
  newProduct.id = await getNextSequence('products');

  const result = await db.collection('products').insertOne(newProduct);
  const savedProduct = await db.collection('products')
    .findOne({ _id: result.insertedId });
  return savedProduct;
};

const resolvers = {
  Query: {
    productList,
  },
  Mutation: {
    addProduct,
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
  resolvers,
});

const app = express();

app.use(express.static('public'));

server.start().then(async () => {
  server.applyMiddleware({ app, path: '/graphql' });
  await connectToDb();
  app.listen({ port: port }, () =>
    console.log('UI started on port 8000'),
    console.log('API started on port 3000 and GraphQL Studio Sandbox accessible at localhost:3000' + server.graphqlPath)
  );
});