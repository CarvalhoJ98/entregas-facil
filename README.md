# 🚚 Entregas Fácil - Sistema de Roteirização

Bem-vindo ao seu projeto de estudo! Este sistema ajuda entregadores a organizar seus pedidos de forma inteligente, usando geolocalização para sugerir a melhor rota.

## 🛠 Como rodar o projeto

Como você está em transição de carreira, aqui está o passo a passo para colocar tudo para funcionar:

### 1. Instale o Node.js
Se ainda não tem, baixe e instale a versão LTS no site oficial: [nodejs.org](https://nodejs.org/).

### 2. Prepare o Backend
Abra o terminal na pasta `backend` e rode:
```bash
npm install
npm run dev
```
O servidor vai rodar em `http://localhost:3001`.

### 3. Prepare o Frontend
Abra outro terminal na pasta `frontend` e rode:
```bash
npm install
npm run dev
```
O app vai abrir em `http://localhost:5173`.

---

## 📄 Arquivo de Exemplo para Teste

Você pode criar um arquivo chamado `teste.csv` com o seguinte conteúdo para testar o sistema agora mesmo:

```csv
destinatario,endereco_completo
Joao Silva,"Avenida Paulista, 1000, São Paulo, SP"
Maria Souza,"Rua Augusta, 500, São Paulo, SP"
Carlos Lima,"Rua Oscar Freire, 200, São Paulo, SP"
Ana Oliveira,"Rua da Consolação, 1500, São Paulo, SP"
```

---

## 🧪 O que você vai aprender aqui?

1.  **Frontend (React):** Como gerenciar estados, fazer chamadas de API com Axios e usar bibliotecas de mapas (Leaflet).
2.  **Backend (Node.js):** Como criar uma API REST, receber arquivos (Multer) e processar dados.
3.  **Lógica:** Como calcular distâncias geográficas e ordenar itens por proximidade.
4.  **Design:** Como usar Tailwind CSS para criar interfaces modernas e limpas.

---

## 🚀 Próximos Desafios (Para você evoluir)
- [ ] Adicionar um banco de dados real (SQLite) para que os dados não sumam ao reiniciar o servidor.
- [ ] Criar um botão para "Exportar Rota" em PDF ou TXT.
- [ ] Adicionar suporte para múltiplos entregadores.

Divirta-se codando! 🚀
