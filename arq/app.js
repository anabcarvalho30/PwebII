const express = require('express');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const db = require('./database');

const app = express();

// --- Configurações ---
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Sessão ---
app.use(session({
  secret: 'seuSegredo',
  resave: false,
  saveUninitialized: false
}));

// Middleware para disponibilizar `user` nas views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// --- Multer: Upload de CAPAS ---
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/images/covers')),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.jpg', '.jpeg', '.png'].includes(ext));
  }
});

// --- Multer: Upload de FOTO DE PERFIL ---
const uploadUserPhoto = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'public/images')),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.jpg', '.jpeg', '.png'].includes(ext));
  }
});

// --- Nodemailer ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ana.menezes62@aluno.ifce.edu.br',
    pass: 'yqplvbsclrmlhdbe' // senha de app, não deixe exposta em produção!
  }
});

// --- Middleware para proteger rotas ---
function checkAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

// --- Rotas ---

// Página inicial pública, mostrando cards e dados do usuário (se logado)
app.get('/', (req, res) => {
  db.all('SELECT * FROM card', (err, rows) => {
    if (err) return res.status(500).send('Erro ao buscar cards.');
    res.render('home', { card: rows, user: req.session.user || null });
  });
});

// Login e Registro
app.get('/login', (req, res) => res.render('login', { title: 'Login' }));
app.get('/register', (req, res) => res.render('register', { title: 'Registrar' }));

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Página de configurações (perfil) — protegida
app.get('/settings', checkAuth, (req, res) => {
  res.render('settings', { user: req.session.user });
});

// Página manage
app.get('/manage', checkAuth, (req, res) => {
  const autorId = req.session.user.id;

  const query = `
    SELECT card.*, users.nome AS nome_autor
    FROM card
    JOIN users ON card.autor = users.id
    WHERE autor = ?
  `;

  db.all(query, [autorId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao buscar suas publicações.");
    }

    res.render('manage', { card: rows, user: req.session.user });
  });
});


// Página manage/edição
// Rota para editar publicação existente
app.get('/edit/:id', checkAuth, (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM card WHERE id = ?', [id], (err, card) => {
    if (err) return res.status(500).send('Erro ao buscar a publicação.');
    if (!card) return res.status(404).send('Publicação não encontrada.');
    res.render('create', { editMode: true, card, user: req.session.user });
  });
});

// Editar
const uploadSingle = upload.single('capa');

app.post('/edit/:id', checkAuth, (req, res) => {
  const storyId = req.params.id;
  const userId = req.session.user.id;

  // Usar o multer para upload da capa
  uploadSingle(req, res, (err) => {
    if (err) return res.status(400).send('Erro no upload da imagem.');

    // Buscar história para verificar autor e dados antigos da capa
    db.get('SELECT * FROM card WHERE id = ?', [storyId], (err, card) => {
      if (err) return res.status(500).send('Erro ao buscar a história.');
      if (!card) return res.status(404).send('História não encontrada.');
      if (card.autor !== userId) return res.status(403).send('Você não tem permissão para editar esta história.');

      // Campos editáveis
      const { titulo, tags, historia, genero } = req.body;
      const capa = req.file ? req.file.filename : card.capa; // usa nova capa se enviada, senão mantém antiga

      db.run(`UPDATE card SET titulo = ?, genero = ?, capa = ?, tags = ?, historia = ? WHERE id = ?`,
        [titulo, genero, capa, tags, historia, storyId],
        (err) => {
          if (err) return res.status(500).send('Erro ao atualizar a história.');
          res.redirect('/manage');
        });
    });
  });
});

//Deletar história
app.post('/delete/:id', checkAuth, (req, res) => {
  const storyId = req.params.id;
  const userId = req.session.user.id;

  db.get('SELECT * FROM card WHERE id = ?', [storyId], (err, card) => {
    if (err) return res.status(500).send('Erro ao buscar a história.');
    if (!card) return res.status(404).send('História não encontrada.');
    if (card.autor !== userId) return res.status(403).send('Você não tem permissão para deletar esta história.');

    db.run('DELETE FROM card WHERE id = ?', [storyId], (err) => {
      if (err) return res.status(500).send('Erro ao deletar a história.');
      res.redirect('/manage');
    });
  });
});



// Cadastro de usuário
app.post('/register', uploadUserPhoto.single('foto_perfil'), (req, res) => {
  const { nome, email, senha, confirmarSenha, maiorIdade } = req.body;

  if (!maiorIdade) return res.status(400).send('Você deve confirmar que é maior de 18 anos.');
  if (senha !== confirmarSenha) return res.status(400).send('As senhas não coincidem.');

  const senhaHash = bcrypt.hashSync(senha, 10);
  const fotoPerfil = req.file ? req.file.filename : 'default-profile.png';

  db.run(`INSERT INTO users (nome, email, senha, foto_perfil) VALUES (?, ?, ?, ?)`,
    [nome, email, senhaHash, fotoPerfil],
    (err) => {
      if (err) return res.status(500).send('Erro ao criar usuário. Email pode já estar em uso.');
      res.redirect('/login');
    });
});

// Login do usuário
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.send('Erro ao procurar usuário.');
    if (!user) return res.send('Email ou senha incorretos.');

    if (bcrypt.compareSync(senha, user.senha)) {
      req.session.user = user;
      res.redirect('/');
    } else {
      res.send('Email ou senha incorretos.');
    }
  });
});

app.post('/criar-historia', checkAuth, upload.single('capa'), (req, res) => {
  const { titulo, tags, historia, genero } = req.body;
  const capa = req.file ? req.file.filename : 'default.jpg';
  const autor = req.session.user.nome;

  db.run(`
    INSERT INTO card (titulo, autor, genero, capa, tags, historia)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [titulo, autor, genero, capa, tags, historia],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send("Erro ao salvar a história.");
      }
      res.redirect('/');
    });
});

// Enviar feedback via email
app.post('/send-feedback', (req, res) => {
  const { type, message, email } = req.body;
  const mailOptions = {
    from: email || 'anonimo@ifce.edu.br',
    to: 'ana.menezes62@aluno.ifce.edu.br',
    subject: `Novo feedback - ${type}`,
    text: `Mensagem:\n${message}\n\nDe: ${email || 'Anônimo'}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return res.status(500).send('Erro ao enviar o email');
    res.send('Feedback enviado com sucesso');
  });
});

// Pesquisa cards por título
app.get('/search', (req, res) => {
  const query = req.query.q;
  db.all("SELECT * FROM card WHERE titulo LIKE ?", [`%${query}%`], (err, rows) => {
    if (err) return res.status(500).send('Erro na busca.');
    res.render('home', { card: rows, search: query, user: req.session.user || null });
  });
});

// Visualizar card específico
app.get('/card/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM card WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).send("Erro ao buscar a história.");
    if (!row) return res.status(404).send("História não encontrada.");
    res.render('card', { card: row, user: req.session.user || null });
  });
});

// Rota para criar nova publicação
app.get('/create', checkAuth, (req, res) => res.render('create', { user: req.session.user }));

// --- Inicializa o servidor ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
