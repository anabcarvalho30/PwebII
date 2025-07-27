const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('card.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS card (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT,
      autor TEXT,
      genero TEXT,
      capa TEXT,
      tags TEXT,
      historia TEXT
    )
  `);

  db.get("SELECT COUNT(*) AS total FROM card", (err, row) => {
    if (row.total === 0) {
      const cardsIniciais = [
        ['NO THROUGH ROAD', 'Natalia Grecco', 'Creepypasta', 'cover2.jpg', 'terror,foundfootage', 'Foi numa madrugada sem propósito que Lucas e os amigos decidiram sair para dirigir pelos arredores da cidade. A ideia era simples: gravar um vídeo estilo "found footage" explorando ruas desconhecidas, criando suspense com cortes rápidos e sussurros fingidos. Pegaram uma câmera antiga, colocaram a bateria extra no porta-luvas e entraram no carro rindo, enquanto o GPS era ignorado de propósito. Queriam "se perder", mas só um pouco. Logo encontraram uma estrada mal sinalizada com uma placa gasta dizendo “No Through Road” — Sem Saída. Parecia perfeito. O asfalto irregular, as árvores curvadas sobre o caminho, tudo criava uma atmosfera ideal para o terror que eles queriam encenar. Entraram sem pensar duas vezes. Lucas começou a gravar, os amigos fingiam medo, e o carro seguia. Mas, após alguns minutos, algo estranho aconteceu: estavam de volta à entrada da estrada. Riram, pensaram ter dado meia-volta sem perceber. Fizeram o caminho de novo, mais atentos. Desta vez, contaram as curvas, os postes, até os buracos na pista. Mas voltaram ao mesmo ponto. O relógio do painel estava travado em 02:47, embora o tempo parecesse passar. Na terceira volta, os postes começaram a mudar de posição. Um carro abandonado surgiu no acostamento — não estava lá antes. E então, alguém viu a silhueta de uma pessoa, parada no meio da estrada. Lucas parou o carro. A figura não se mexia, nem mesmo com o farol alto. Um dos amigos desceu para filmar de perto. A câmera captou tudo: a aproximação, o silêncio cortante, e então o grito. A imagem se embaralhou quando a lente caiu no asfalto. Ao fundo, passos — leves, mas rápidos — se aproximavam da câmera caída. Um rosto aparece por um instante. Não era humano. Ou pelo menos, não mais. A fita foi encontrada dias depois, entre os arbustos próximos à estrada. A polícia não encontrou carro, amigos, nem sinais de violência — apenas o aviso na entrada, que havia sido riscado e agora dizia: “No Return Road”.'],
        ['Carne de Mim', 'Cauã Rodrigues', 'Horror Psicológico', 'Carne.jpg', 'paranoia,distorção', ''],
        ['Fita 7', 'Natalia Grecco', 'Creepypasta', 'Fita7.jpg', 'roadtrip,foundfootage', ''],
        ['Login: 03h13', 'Natalia Grecco', 'Creepypasta', 'Login.jpg', 'infernet,technohorror', ''],
        ['Andar de cima', 'Natalia Grecco', 'Lenda Urbana', 'Andar.jpg', 'terrorescolar', ''],
        ['Hospedeiro', 'Natalia Grecco', 'Body Horror', 'Hospedeiro.jpg', 'sanguinario,transformação', ''],
        ['Casarão', 'Natalia Grecco', 'Gótico', 'Casarão.jpg', 'terrorvitoriano,herancamaldita', ''],
        ['O Homem do saco', 'Ana Silva', 'GóLendas Urbanastico', 'cover1.jpg', 'terror,sobrenatural', '']
      ];

      const stmt = db.prepare("INSERT INTO card (titulo, autor, genero, capa, tags, historia) VALUES (?, ?, ?, ?, ?, ?)");
      cardsIniciais.forEach(card => stmt.run(card));
      stmt.finalize();
      console.log("Cards iniciais adicionados.");
    }
  });
});


module.exports = db;