const express = require('express');
let apiRouter = express.Router();

const knex = require('knex') ({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

let endpoint = '/'
apiRouter.get(endpoint + 'produtos', (req, res) => {
  knex
  .select('*')
  .from('produto')
  .then(produtos => res.status(200).json(produtos));
});

module.exports = apiRouter;