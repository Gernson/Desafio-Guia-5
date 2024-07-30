import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: 'https://guia-turistico-maranhao.vercel.app/', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

async function testConnection() {
  try {
    await prisma.$connect();
    console.log("conectado com o banco de dados");
  } catch (error) {
    console.error("falha ao conectar com o banco de dados", error);
  }
}

testConnection();

app.get('/', (req, res) => {
  res.send('hello3');
});

// Rota para buscar todos os destinos
app.get('/destinos', async (req, res) => {
  try {
    console.log('buscando todos os destinos...');
    const destinos = await prisma.destination.findMany({
      take: 100, 
    });
    console.log('destinos buscados com sucesso:', destinos.length);
    res.json(destinos);
  } catch (error) {
    console.error('erro ao buscar destinos:', error);
    res.status(500).json({ error: 'erro interno do servidor' });
  }
});

// rota para buscar destino pelo id
app.get('/destinos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`buscando destino com ID: ${id}`);
    const destino = await prisma.destination.findUnique({
      where: { id },
      include: { atrativos: true },
    });
    if (!destino) {
      res.status(404).json({ error: 'destino não encontrado' });
    } else {
      console.log('destino buscado com sucesso:', destino);
      res.json(destino);
    }
  } catch (error) {
    console.error('erro ao buscar destino:', error);
    res.status(500).json({ error: 'erro interno do servidor' });
  }
});

// rota para criar um novo destino
app.post('/destinos', async (req, res) => {
  const { name, region, description, latitude, longitude, bestPeriod, photos } = req.body;
  try {
    console.log('criando um novo destino:', req.body);
    const novoDestino = await prisma.destination.create({
      data: { name, region, description, latitude, longitude, bestPeriod, photos },
    });
    console.log('novo destino criado:', novoDestino);
    res.status(201).json(novoDestino);
  } catch (error) {
    console.error('erro ao criar destino:', error);
    res.status(500).json({ error: 'erro interno do servidor' });
  }
});

// rota para buscar atrativos por destino id
app.get('/destinos/:id/atrativos', async (req, res) => {
  const { id } = req.params;
  try {
    console.log(`buscando atrativos para o destino ID: ${id}`);
    const atrativos = await prisma.atrativo.findMany({
      where: { destinationId: id },
    });
    console.log('atrativos buscados com sucesso:', atrativos.length);
    res.json(atrativos);
  } catch (error) {
    console.error('erro ao buscar atrativos:', error);
    res.status(500).json({ error: 'erro interno do servidor' });
  }
});

// rota para criar um novo atrativo
app.post('/atrativos', async (req, res) => {
  const { name, type, description, tips, destinationId } = req.body;
  try {
    console.log('criando um novo atrativo:', req.body);
    const novoAtrativo = await prisma.atrativo.create({
      data: { name, type, description, tips, destinationId },
    });
    console.log('novo atrativo criado:', novoAtrativo);
    res.status(201).json(novoAtrativo);
  } catch (error) {
    console.error('erro ao criar atrativo:', error);
    res.status(500).json({ error: 'erro interno do servidor' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
