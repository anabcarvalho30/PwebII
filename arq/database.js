const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('card.db');

const bcrypt = require('bcrypt');
const saltRounds = 10;

db.serialize(() => {
  // Criar tabela users com foto_perfil
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT UNIQUE,
      senha TEXT,
      foto_perfil TEXT DEFAULT 'default-profile.png'
    )
  `);

  // Criar tabela card
  db.run(`
    CREATE TABLE IF NOT EXISTS card (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT,
  autorid INTEGER,
  autornome TEXT,
  genero TEXT,
  capa TEXT,
  tags TEXT,
  historia TEXT,
  FOREIGN KEY(autorid) REFERENCES users(id),
  FOREIGN KEY(autornome) REFERENCES users(nome)
)
  `);

  // Usuário exemplo
  const usuario = {
    nome: 'Bia',
    email: 'bia@email.com',
    senha: 'senhaSegura123',
    foto_perfil: 'user-avatar.jpg' // nome do arquivo dentro de /public/icons ou /public/images
  };

  // Gerar hash e inserir usuário EXEMPLO com foto_perfil
  bcrypt.hash(usuario.senha, saltRounds, (err, hash) => {
    if (err) {
      console.error('Erro ao criar hash da senha:', err);
      return;
    }
    db.run(
      `INSERT OR IGNORE INTO users (nome, email, senha, foto_perfil) VALUES (?, ?, ?, ?)`,
      [usuario.nome, usuario.email, hash, usuario.foto_perfil],
      function (err) {
        if (err) {
          console.error('Erro ao inserir usuário:', err);
        } else {
          console.log('Usuário exemplo criado ou já existia.');
          const autorId = this.lastID || 1;

          // AQUI você pode chamar a função para inserir os cards iniciais usando autorId
          inserirCardsIniciais(autorId);
        }
      }
    );
  });

  function inserirCardsIniciais(autorId) {
    db.get("SELECT COUNT(*) AS total FROM card", (err, row) => {
      if (err) {
        console.error('Erro ao verificar cards:', err);
        return;
      }
      if (row.total === 0) {
        const cardsIniciais = [
          ['NO THROUGH ROAD', autorId, 'Natalia Grecco', 'Creepypasta', 'cover2.jpg', 'terror,foundfootage', 'Foi numa madrugada sem propósito que Lucas e os amigos decidiram sair para dirigir pelos arredores da cidade. A ideia era simples: gravar um vídeo estilo "found footage" explorando ruas desconhecidas, criando suspense com cortes rápidos e sussurros fingidos. Pegaram uma câmera antiga, colocaram a bateria extra no porta-luvas e entraram no carro rindo, enquanto o GPS era ignorado de propósito. Queriam "se perder", mas só um pouco. Logo encontraram uma estrada mal sinalizada com uma placa gasta dizendo “No Through Road” — Sem Saída. Parecia perfeito. O asfalto irregular, as árvores curvadas sobre o caminho, tudo criava uma atmosfera ideal para o terror que eles queriam encenar. Entraram sem pensar duas vezes. Lucas começou a gravar, os amigos fingiam medo, e o carro seguia. Mas, após alguns minutos, algo estranho aconteceu: estavam de volta à entrada da estrada. Riram, pensaram ter dado meia-volta sem perceber. Fizeram o caminho de novo, mais atentos. Desta vez, contaram as curvas, os postes, até os buracos na pista. Mas voltaram ao mesmo ponto. O relógio do painel estava travado em 02:47, embora o tempo parecesse passar. Na terceira volta, os postes começaram a mudar de posição. Um carro abandonado surgiu no acostamento — não estava lá antes. E então, alguém viu a silhueta de uma pessoa, parada no meio da estrada. Lucas parou o carro. A figura não se mexia, nem mesmo com o farol alto. Um dos amigos desceu para filmar de perto. A câmera captou tudo: a aproximação, o silêncio cortante, e então o grito. A imagem se embaralhou quando a lente caiu no asfalto. Ao fundo, passos — leves, mas rápidos — se aproximavam da câmera caída. Um rosto aparece por um instante. Não era humano. Ou pelo menos, não mais. A fita foi encontrada dias depois, entre os arbustos próximos à estrada. A polícia não encontrou carro, amigos, nem sinais de violência — apenas o aviso na entrada, que havia sido riscado e agora dizia: “No Return Road”.'],
          ['Carne de Mim', autorId, 'Cauã Rodrigues', 'Horror Psicológico', 'Carne.jpg', 'paranoia,distorção', ''],
          ['Fita 7', autorId, 'Natalia Grecco', 'Creepypasta', 'Fita7.jpg', 'roadtrip,foundfootage', ''],
          ['Login: 03h13', autorId, 'Natalia Grecco', 'Creepypasta', 'Login.jpg', 'infernet,technohorror', ''],
          ['Andar de cima', autorId, 'Natalia Grecco', 'Lenda Urbana', 'Andar.jpg', 'terrorescolar', ''],
          ['Hospedeiro', autorId, 'Natalia Grecco', 'Body Horror', 'Hospedeiro.jpg', 'sanguinario,transformação', ''],
          ['Casarão', autorId, 'Natalia Grecco', 'Gótico', 'Casarão.jpg', 'terrorvitoriano,herancamaldita', ''],
          ['O Homem do saco', autorId, 'Ana Silva', 'GóLendas Urbanastico', 'cover1.jpg', 'terror,sobrenatural', '']
        ];

        const stmt = db.prepare("INSERT INTO card (titulo, autorid, autornome, genero, capa, tags, historia) VALUES (?, ?, ?, ?, ?, ?, ?)");
        cardsIniciais.forEach(card => stmt.run(card));
        stmt.finalize();
        console.log("Cards iniciais adicionados.");
      }
    });
  }
  // Inserir cards iniciais se não existirem
});

module.exports = db;
