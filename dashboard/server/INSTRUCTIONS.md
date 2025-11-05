# 🚀 Como executar o Backend

## Pré-requisitos

- Node.js 18+ instalado
- MariaDB/MySQL rodando
- Banco de dados `v_o_c_e` criado e populado

## Instalação

1. Entre na pasta do servidor:
```bash
cd server
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure suas credenciais do banco:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=v_o_c_e
DB_PORT=3306
JWT_SECRET=sua-chave-secreta-super-segura
PORT=3000
```

## Executar

### Modo Desenvolvimento (com hot reload):
```bash
npm run dev
```

### Modo Produção:
```bash
npm run build
npm start
```

O servidor estará disponível em `http://localhost:3000`

## Testar API

Teste o endpoint de health:
```bash
curl http://localhost:3000/health
```

## Configurar Frontend

No projeto frontend, crie um arquivo `.env` com:
```
VITE_API_URL=http://localhost:3000/api
```

Agora o frontend irá conectar com o backend!

## Endpoints Disponíveis

- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Criar conta
- GET `/api/dashboard/stats` - Estatísticas
- GET `/api/logs/recent` - Logs recentes
- GET `/api/students` - Listar estudantes
- GET `/api/classes` - Listar turmas
- GET `/api/analytics/categories` - Analytics por categoria

Veja mais detalhes no arquivo `README.md`
