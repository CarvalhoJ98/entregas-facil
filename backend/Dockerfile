# Usamos uma versão leve do Node.js
FROM node:20-slim

# Instalamos dependências necessárias para o SQLite3 compilar se necessário
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Pasta onde o código vai ficar dentro do container
WORKDIR /app

# Copiamos os arquivos de configuração primeiro (otimiza o cache do Docker)
COPY package*.json ./

# Instalamos as dependências
RUN npm install

# Copiamos o resto do código
COPY . .

# Expomos a porta que o servidor usa
EXPOSE 3001

# Comando para iniciar o servidor
CMD ["npm", "start"]
