const express = require('express');
let apiRouter = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



const knex = require('knex')({
  client: 'postgresql',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }
});

let checkUser = (req, res, next) => {
  let authToken = req.headers["authorization"];
  if(!authToken) {
    res.status(401).json({"message": "Token requirida"});
  } else {
    let token = authToken.split(" ")[1];
    req.token = token;
    jwt.verify(req.token, process.env.SECRET_KEY, (err, decodeToken) => {
      if(err) {
        res.status(401).json({"message": "Acesso negado"});
        return;
      }
      req.usuarioId = decodeToken.id;
      next();
    })
  }
  // Localiza o usuário no banco de dados

  // // Valida informação (senha || token)
  // let ok = true;
  // // Retorna resultado
  // if (ok) {
  //   next();
  // } else {
  //   res.status(401).json({ message: 'Acesso negado' });
  // }
}

let isAdmin = (req, res, next) => {
  knex
    .select("*")
    .from("usuario")
    .where({id: req.usuarioId})
    .then(usuarios => {
      if(!usuarios.length) {
        res.status(401).json({"message": "Acesso negado"});
        return;
      }
      let usuario = usuarios[0];
      let roles = usuario.roles.split(";");
      let adminRole = roles.find(i => i ==='ADMIN');
      if(adminRole === 'ADMIN') {
        next();
        return;
      } else {
        res.status(403).json({"message": "Acesso restrito a administradores"});
        return;
      }
    });

}

let endpoint = '/'

apiRouter.post(endpoint + 'seguranca/register', (req, res) => {
  knex('usuario')
    .insert({
      nome: req.body.nome,
      login: req.body.login,
      senha: bcrypt.hashSync(req.body.senha, 8),
      email: req.body.email
    }, ['id'])
    .then((result) => {
      let usuario = result[0]
      res.status(200).json({ "id": usuario.id })
      return
    })
    .catch(err => {
      res.status(500).json({
        message: 'Erro ao registrar usuario - ' + err.message
      })
    })
})

apiRouter.post(endpoint + 'seguranca/login', (req, res) => {
  knex
    .select('*').from('usuario').where({ login: req.body.login })
    .then(usuarios => {
      if (usuarios.length) {
        let usuario = usuarios[0]
        let checkSenha = bcrypt.compareSync(req.body.senha, usuario.senha)
        if (checkSenha) {
          var tokenJWT = jwt.sign({ id: usuario.id },
            process.env.SECRET_KEY, {
            expiresIn: 3600
          })
          res.status(200).json({
            id: usuario.id,
            login: usuario.login,
            nome: usuario.nome,
            roles: usuario.roles,
            token: tokenJWT
          })
          return
        }
      }
      res.status(200).json({ message: 'Login ou senha incorretos' })
    })
    .catch(err => {
      res.status(500).json({
        message: 'Erro ao verificar login - ' + err.message
      })
    })
})

apiRouter.get(endpoint + 'municipio/:municipio', checkUser, (req, res) => {
  knex
    .select('*')
    .from('votacao_candidato_munzona_2020_sp')
    .where({nm_municipio: req.params.municipio})
    .then(municipio => res.status(200).json(municipio));
});

apiRouter.get(endpoint + 'cargo/:cargo', checkUser, (req, res) => {
  knex
    .select('*')
    .from('votacao_candidato_munzona_2020_sp')
    .where({ds_cargo: req.params.cargo})
    .then(cargo => res.status(200).json(cargo));
});

apiRouter.get(endpoint + 'candidato_votos_total/:municipio/:cargo/:nome', checkUser, (req, res) => {
  knex
    .select('*')
    .from('votacao_candidato_munzona_2020_sp')
    .where({nm_municipio: req.params.municipio, ds_cargo: req.params.cargo, nm_candidato: req.params.nome})
    .then(candidato_total => res.status(200).json(candidato_total));
});

apiRouter.get(endpoint + 'candidato_votos_secao/:municipio/:cargo/:nome', checkUser, (req, res) => {
  knex
    .select('*')
    .from('votacao_secao_2020_sp')
    .where({nm_municipio: req.params.municipio, cd_cargo: req.params.cargo, nm_votavel: req.params.nome})
    .then(candidato_secao => res.status(200).json(candidato_secao));
});

apiRouter.get(endpoint + 'local_votacao/:nm_municipio/:nr_local_votacao', checkUser, (req, res) => {
  knex
    .select('*')
    .from('eleitorado_local_votacao_2020')
    .where({nm_municipio: req.params.nm_municipio, nr_local_votacao: req.params.nr_local_votacao})
    .then(local_votacao => res.status(200).json(local_votacao));
});

// apiRouter.get(endpoint + 'produtos/:municipio/:nome', checkUser, (req, res) => {
//   knex
//     .select('*')
//     .from('eleitorado_local_votacao_2020')
//     .where({ nm_municipio: req.params.id,  })
//     .then(produtos => {
//       if (produtos.length) {
//         let produto = produtos[0]
//         res.status(200).json(produto);
//       } else {
//         res.status(404).json({ message: "Item não localizado" });
//       }
//     }).catch(err => res.status(500).json(
//       { message: "Erro no servidor - " + err.message }
//     ))
// });

// apiRouter.delete(endpoint + 'produtos/:id', checkUser, isAdmin, (req, res) => {
//   knex('produto')
//     .where({ id: req.params.id })
//     .del()
//     .then(produtos => {
//       res.status(200).json({ message: "Item excluído com sucesso" });
//     }).catch(err => res.status(500).json(
//       { message: "Erro no servidor ao excluir- " + err.message }
//     ))
// })

// apiRouter.post(endpoint + 'produtos', checkUser, isAdmin, (req, res) => {
//   knex('produto')
//     .insert({
//       id: 9,
//       descricao: "Maionese 250gr",
//       valor: 7.2,
//       marca: "Helmanns"
//     }).then(produtos => {
//       res.status(200).json({ message: "Item inserido com sucesso" })
//     }).catch(err => res.status(500).json(
//       { message: "Erro no servidor ao inserir" + err.message }
//     ))
// })

module.exports = apiRouter;