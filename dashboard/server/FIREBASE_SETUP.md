# Configuração do Firebase Admin SDK

Para que o backend possa verificar os tokens JWT do Firebase, você precisa configurar o Firebase Admin SDK.

## Passo 1: Obter a Service Account Key

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** (ícone de engrenagem) > **Contas de Serviço**
4. Clique em **Gerar nova chave privada**
5. Será baixado um arquivo JSON

## Passo 2: Configurar no Backend

### Opção A: Variável de Ambiente (Recomendado para Produção)

1. Abra o arquivo JSON baixado
2. Copie **todo o conteúdo** do arquivo
3. No arquivo `.env` do servidor, adicione:

```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"seu-projeto",...}'
```

**Importante**: Cole o JSON completo em uma única linha entre aspas simples.

### Opção B: Arquivo Local (Desenvolvimento)

1. Salve o arquivo JSON na pasta `server/` com o nome `firebase-service-account.json`
2. Adicione no `.gitignore`: `server/firebase-service-account.json`
3. Modifique `server/index.ts` para usar:

```typescript
import serviceAccount from './firebase-service-account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});
```

## Como Funciona

1. **Frontend**: Usuário faz login via Firebase Authentication
2. **Frontend**: Obtém o ID Token com `await user.getIdToken()`
3. **Frontend**: Envia o token no header: `Authorization: Bearer <token>`
4. **Backend**: Middleware `authenticateToken` verifica o token com Firebase Admin
5. **Backend**: Se válido, permite acesso às rotas protegidas

## Segurança

- **NUNCA** commite a service account key no git
- Use variáveis de ambiente em produção
- Mantenha o arquivo `.json` fora do repositório
- Adicione `*.json` no `.gitignore` da pasta server

## Testando

Após configurar, teste fazendo login no frontend e acessando uma rota protegida do backend.
