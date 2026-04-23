const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { geocodeAddress } = require('./utils/geocoding');
const { sortRoutes } = require('./utils/geo');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Banco de dados em memória para simplificar o projeto inicial
let db = {
  entregas: []
};

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
        fs.unlinkSync(filePath); // Limpa arquivo temporário
        res.json(results);
      });
  } else {
    // Lógica para Excel (.xlsx)
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

  // Geocodificar todos os pontos que não têm lat/lng
  const entregasComCoords = await Promise.all(
    entregas.map(async (item) => {
      if (item.lat && item.lng) return item;
      
      const coords = await geocodeAddress(item.endereco_completo || item.endereco);
      return { ...item, ...coords };
    })
  );

  // Filtrar apenas as que conseguimos localizar
  const validas = entregasComCoords.filter(e => e.lat && e.lng);
  
  // Ordenar usando o algoritmo de vizinho mais próximo
  const rotaOrdenada = sortRoutes(pontoInicial, validas);

  db.entregas = rotaOrdenada.map((e, idx) => ({
    ...e,
    id: idx + 1,
    status: 'pendente',
    ordem: idx + 1
  }));

  res.json(db.entregas);
});

// Endpoint: Listar Entregas
app.get('/api/entregas', (req, res) => {
  res.json(db.entregas);
});

// Endpoint: Atualizar Status
app.patch('/api/entregas/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const entrega = db.entregas.find(e => e.id == id);
  if (entrega) {
    entrega.status = status;
    res.json(entrega);
  } else {
    res.status(404).send('Entrega não encontrada.');
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Entregas Fácil rodando em http://localhost:${PORT}`);
});
