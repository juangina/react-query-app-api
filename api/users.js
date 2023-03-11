const express = require('express');
const usersRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

usersRouter.param('userId', (req, res, next, userId) => {
  const sql = 'SELECT * FROM Users WHERE Users.id = $userId';
  const values = {$userId: userId};
  db.get(sql, values, (error, user) => {
    if (error) {
      next(error);
    } else if (user) {
      req.user = user;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

usersRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Users',
    (err, users) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json(users);
      }
    });
});

usersRouter.get('/:userId', (req, res, next) => {
  res.status(200).json(req.user);
});

usersRouter.post('/', (req, res, next) => {
  const name = req.body.name,
        email = req.body.email
  if (!name || !email) {
    return res.sendStatus(400);
  }

  const sql = 'INSERT INTO Users (name, email)' +
      'VALUES ($name, $email)';
  const values = {
    $name: name,
    $email: email
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Users WHERE Users.id = ${this.lastID}`,
        (error, user) => {
          res.status(201).json(user);
        });
    }
  });
});

usersRouter.put('/:userId', (req, res, next) => {
  const name = req.body.name,
        email = req.body.email
  if (!name || !email) {
    return res.sendStatus(400);
  }

  const sql = 'UPDATE Users SET name = $name, email = $email WHERE Users.id = $userId';
  const values = {
    $name: name,
    $email: email,
    $userId: req.params.userId
  };

  db.run(sql, values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Users WHERE Users.id = ${req.params.userId}`,
        (error, user) => {
          res.status(200).json(user);
        });
    }
  });
});

usersRouter.delete('/:userId', (req, res, next) => {
  const userItemSql = 'SELECT * FROM Users WHERE Users.id = $userId';
  const userItemValues = {$userId: req.params.userId};
  db.get(userItemSql, userItemValues, (error, user) => {
    if (error) {
      next(error);
    } else if (!user) {
      return res.sendStatus(400);
    } else {
      const deleteSql = 'DELETE FROM Users WHERE Users.id = $userId';
      const deleteValues = {$userId: req.params.userId};

      db.run(deleteSql, deleteValues, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });

    }
  });
});

module.exports = usersRouter;