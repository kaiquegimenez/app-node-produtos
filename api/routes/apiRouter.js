const express = require('express');
let apiRouter = express.Router();

const knex = require('knex') ({
  client: 'postgresql',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
});

let endpoint = '/'
apiRouter.get(endpoint + 'produtos', (req, res) => {
  knex
  .select('*')
  .from('produto')
  .then(produtos => res.status(200).json(produtos));
});

module.exports = apiRouter;