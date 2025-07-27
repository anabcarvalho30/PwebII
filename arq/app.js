const express = require('express');
const path = require('path');
const app = express();
const db = require('./database');
const multer = require('multer');

// Configurações
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/images/covers'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: function (req, file, cb) {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos JPG e PNG são permitidos.'));
    }
  }
});

// Rotas
app.get('/', (req, res) => {
  db.all('SELECT * FROM card', (err, rows) => {
    if (err) {
      return res.status(500).send('Erro ao buscar cards.');
    }
    res.render('home', { card: rows });
  });
});
app.get('/create', (req, res) => res.render('create'));
app.get('/manage', (req, res) => res.render('manage'));
app.get('/settings', (req, res) => res.render('settings'));

app.post('/criar-historia', upload.single('capa'), (req, res) => {
  
  const { titulo, tags, historia, genero } = req.body;
  console.log(req.body);
  
  const autor = 'Autor Desconhecido';
  const capa = req.file ? req.file.filename : 'default.jpg';

  db.run(`
    INSERT INTO card (titulo, autor, genero, capa, tags, historia)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [titulo, autor, genero, capa, tags, historia],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send("Erro ao salvar a história.");
      }
      res.redirect('/'); // Redireciona para a home após publicação
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

app.get('/search', (req, res) => {
    const query = req.query.q;
    // Aqui você implementará a lógica de pesquisa depois
    res.render('search', { 
        title: 'Resultados da Pesquisa',
        currentPage: 'search',
        query,
        results: [] // Array vazio por enquanto
    });
});
app.get('/card/:id', (req, res) => {
  const id = req.params.id;

  db.get('SELECT * FROM card WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao buscar a história.");
    }

    if (!row) {
      return res.status(404).send("História não encontrada.");
    }

    res.render('card', { card: row });
  });
});

