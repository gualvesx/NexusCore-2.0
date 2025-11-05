# Configuração do Firebase

## Regras do Firestore

Para que o sistema funcione corretamente, você precisa configurar as seguintes regras no Firebase Console:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto: `banco-vc`
3. Vá em **Firestore Database** > **Rules**
4. Cole as seguintes regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a coleção leaders (professores)
    match /leaders/{userId} {
      // Permitir leitura apenas para o próprio usuário autenticado
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Permitir criação apenas para novos usuários (signup)
      allow create: if request.auth != null && request.auth.uid == userId;
      
      // Permitir atualização apenas para o próprio usuário
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // Não permitir delete
      allow delete: if false;
    }
    
    // Adicione outras regras conforme necessário para outras coleções
  }
}
```

## Configuração de Autenticação

1. Vá em **Authentication** > **Sign-in method**
2. Ative os seguintes provedores:
   - **Email/Password** (já deve estar ativo)
   - **Google** (configure conforme necessário)

### Configuração do Google Sign-in:

1. Clique em **Google** na lista de provedores
2. Clique em **Habilitar**
3. Configure o **Nome público do projeto**
4. Configure o **Email de suporte**
5. Salve

## Verificação de Email

Por padrão, o Firebase requer verificação de email para login com Email/Password. Para desabilitar isso durante o desenvolvimento:

1. Vá em **Authentication** > **Settings**
2. Vá até **User actions** > **Email enumeration protection**
3. Configure conforme sua preferência

## Testando as Regras

Após configurar as regras, teste o sistema:

1. Tente fazer login com email/senha
2. Tente fazer login com Google
3. Verifique se consegue acessar o dashboard
4. Tente editar seu perfil

Se você ver o erro "Missing or insufficient permissions", as regras não foram aplicadas corretamente.

## Estrutura de Dados

### Coleção: leaders

```json
{
  "full_name": "string",
  "username": "string", 
  "email": "string",
  "cpf": "string",
  "birthDate": "string",
  "position": "string",
  "createdAt": "string (ISO timestamp)"
}
```

## Troubleshooting

### Erro: "Missing or insufficient permissions"

- Verifique se as regras do Firestore foram publicadas corretamente
- Certifique-se de que o usuário está autenticado
- Verifique se o UID do usuário corresponde ao documento que está tentando acessar

### Login com Google não funciona

- Verifique se o Google Sign-in está habilitado nas configurações
- Configure as URLs autorizadas no Google Cloud Console
- Certifique-se de que o domínio está autorizado no Firebase

### Email não verificado bloqueia login

- Para desenvolvimento, você pode desabilitar a verificação de email
- Em produção, instrua os usuários a verificarem o email antes de fazer login
