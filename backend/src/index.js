const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const { geocodeAddress } = require('./utils/geocoding');
const { sortRoutes } = require('./utils/geo');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Configuração do Banco de Dados SQLite
let db;
(async () => {
  // Garantir que a pasta 'data' exista (especialmente importante no Docker)
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  db = await open({
    filename: path.join(dataDir, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS entregas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destinatario TEXT,
      endereco TEXT,
      lat REAL,
      lng REAL,
      status TEXT DEFAULT 'pendente',
      ordem INTEGER
    )
  `);
  console.log('✅ Banco de Dados SQLite pronto.');
})();

// Endpoint: Upload de arquivo
app.post('/api/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send('Nenhum arquivo enviado.');

  const results = [];
  const filePath = path.join(__dirname, '..', file.path);

  if (file.originalname.endsWith('.csv')) {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        fs.unlinkSync(filePath);
        res.json(results);
      });
  } else {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    fs.unlinkSync(filePath);
    res.json(data);
  }
});

// Endpoint: Gerar Rota
app.post('/api/roteirizar', async (req, res) => {
  const { entregas, pontoInicial } = req.body;

  if (!entregas || entregas.length === 0) {
    return res.status(400).send('Lista de entregas vazia.');
  }

  // Limpar entregas antigas (opcional, para esse projeto simples)
  await db.run('DELETE FROM entregas');

  const entregasComCoords = await Promise.all(
    entregas.map(async (item) => {
      const endereco = item.endereco_completo || item.endereco;
      if (item.lat && item.lng) return { ...item, endereco };

      const coords = await geocodeAddress(endereco);
      return { ...item, ...coords, endereco };
    })
  );

  const validas = entregasComCoords.filter(e => e.lat && e.lng);
  const rotaOrdenada = sortRoutes(pontoInicial, validas);

  // Salvar no SQLite
  for (let i = 0; i < rotaOrdenada.length; i++) {
    const e = rotaOrdenada[i];
    await db.run(
      'INSERT INTO entregas (destinatario, endereco, lat, lng, ordem) VALUES (?, ?, ?, ?, ?)',
      [e.destinatario || e.nome, e.endereco, e.lat, e.lng, i + 1]
    );
  }

  const todas = await db.all('SELECT * FROM entregas ORDER BY ordem ASC');
  res.json(todas);
});

// Endpoint: Listar Entregas
app.get('/api/entregas', async (req, res) => {
  const entregas = await db.all('SELECT * FROM entregas ORDER BY ordem ASC');
  res.json(entregas);
});

// Endpoint: Atualizar Status
app.patch('/api/entregas/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  await db.run('UPDATE entregas SET status = ? WHERE id = ?', [status, id]);
  const atualizada = await db.get('SELECT * FROM entregas WHERE id = ?', [id]);

  if (atualizada) {
    res.json(atualizada);
  } else {
    res.status(404).send('Entrega não encontrada.');
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
