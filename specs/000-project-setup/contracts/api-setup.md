# Contratos e Configurações

## Variáveis de Ambiente Necessárias (Produção / Homologação)

Essas variáveis DEVERÃO estar preenchidas nas plataformas de hospedagem em nuvem (Render, etc.) para que a aplicação consiga levantar com sucesso sem credenciais hardcoded.

### Backend
- `DB_URL`: String de conexão JDBC (ex: `jdbc:postgresql://host:5432/saldu`)
- `DB_USERNAME`: Usuário do banco de dados na nuvem
- `DB_PASSWORD`: Senha do banco de dados na nuvem
- `JWT_SECRET`: Chave longa e segura para assinatura de tokens de autenticação (Obrigatório em PRD/HML)

### Frontend
- `NEXT_PUBLIC_API_URL`: URL base da API do backend exposta publicamente.
