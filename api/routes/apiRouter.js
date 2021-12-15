const express = require('express');
let apiRouter = express.Router();

let endpoint = '/'
apiRouter.get(endpoint + 'produtos', (req, res) => {
  res.status(200).json({ id: 1, descricao: 'produto 1' })
});

module.exports = apiRouter;