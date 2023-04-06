const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const router = express.Router();

app.use(bodyParser.json());

// 创建数据库连接池
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Ga6125375',
  database: 'user',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 设置允许跨域访问
router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 注册用户
router.post('/register', (req, res) => {
  const { username, password } = req.body;

  // 从连接池获取连接
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500); // 内部服务器错误
    }

    // 查询是否已存在该用户名
    connection.query('SELECT * FROM userinfo WHERE username = ?', [username], (err, results) => {
      if (err) {
        console.error(err);
        connection.release(); // 释放连接
        return res.sendStatus(500); // 内部服务器错误
      }

      if (results.length > 0) {
        connection.release(); // 释放连接
        return res.status(400).send('用户名已存在'); // 注册失败
      }

      // 插入新用户
      connection.query('INSERT INTO userinfo SET ?', { username, password }, (err, results) => {
        connection.release(); // 释放连接

        if (err) {
          console.error(err);
          return res.sendStatus(500); // 内部服务器错误
        }

        res.sendStatus(201); // 注册成功
      });
    });
  });
});

// 登录用户
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 从连接池获取连接
  pool.getConnection((err, connection) => {
    if (err) {
      console.error(err);
      return res.sendStatus(500); // 内部服务器错误
    }

    // 查询用户是否存在
    connection.query('SELECT * FROM userinfo WHERE username = ? AND password = ?', [username, password], (err, results) => {
      connection.release(); // 释放连接

      if (err) {
        console.error(err);
        return res.sendStatus(500); // 内部服务器错误
      }

      if (results.length > 0) {
        res.sendStatus(200); // 登录成功
      } else {
        res.sendStatus(401); // 登录失败
      }
    });
  });
});

app.use('/', router);

app.listen(5500, () => console.log('服务已启动，5500端口监听中'));
