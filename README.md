# MTG SYSTEM ERP — Backend C# + PWA Mobile

Sistema ERP completo com **ASP.NET Core 8 + SQLite + PWA**.

---

## 📁 Estrutura do Projeto

```
MtgSystem/
├── Controllers/
│   ├── AuthController.cs       ← Login, Registro, Perfil
│   ├── ProductsController.cs   ← CRUD de produtos
│   ├── StockController.cs      ← Movimentação de estoque
│   └── UsersController.cs      ← Usuários + Dashboard
├── Data/
│   └── AppDbContext.cs         ← EF Core + SQLite + Seed
├── DTOs/
│   └── DTOs.cs                 ← Objetos de transferência
├── Models/
│   └── Models.cs               ← Entidades do banco
├── Services/
│   └── AuthService.cs          ← JWT + BCrypt
├── wwwroot/                    ← Frontend (HTML/CSS/JS)
│   ├── index.html
│   ├── dashboard.html
│   ├── produtos.html
│   ├── estoque.html
│   ├── relatorios.html
│   ├── usuarios.html
│   ├── configuracoes.html
│   ├── manual.html
│   ├── offline.html
│   ├── app-bundle.css
│   ├── app-bundle.js           ← UI (sem localStorage)
│   ├── api-client.js           ← Comunicação com API C#
│   ├── sw.js                   ← Service Worker (PWA)
│   ├── manifest.json           ← PWA manifest
│   ├── icons/                  ← Ícones do app
│   └── assets/images/logo.jpeg
├── Program.cs                  ← Entry point + configuração
├── appsettings.json
└── MtgSystem.csproj
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Visual Studio 2022 ou VS Code com extensão C#

### Passos

```bash
# 1. Entrar na pasta do projeto
cd MtgSystem

# 2. Restaurar dependências
dotnet restore

# 3. Rodar o projeto
dotnet run

# 4. Acessar no navegador
# http://localhost:5000
```

O banco SQLite (`mtgsystem.db`) é criado automaticamente na primeira execução com dados de demonstração.

### Login inicial
- **E-mail:** admin@mtg.com
- **Senha:** admin123

---

## 📡 API Endpoints

### Autenticação (sem token)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login — retorna JWT |
| POST | `/api/auth/register` | Registrar novo usuário |
| GET | `/api/auth/me` | Dados do usuário logado |
| POST | `/api/auth/change-password` | Alterar senha |

### Produtos (token obrigatório)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/products` | Listar (paginação, filtros, busca) |
| GET | `/api/products/{id}` | Buscar por ID |
| GET | `/api/products/categories` | Listar categorias |
| POST | `/api/products` | Criar produto |
| PUT | `/api/products/{id}` | Atualizar produto |
| DELETE | `/api/products/{id}` | Excluir produto |

### Estoque (token obrigatório)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/stock` | Listar movimentações |
| POST | `/api/stock/{productId}` | Registrar entrada/saída |
| GET | `/api/stock/product/{id}` | Histórico de um produto |
| GET | `/api/stock/stats` | Estatísticas gerais |

### Usuários (Admin only)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/users` | Listar usuários |
| POST | `/api/users` | Criar usuário |
| PUT | `/api/users/{id}` | Atualizar usuário |
| DELETE | `/api/users/{id}` | Excluir usuário |
| GET | `/api/users/logs` | Histórico de ações |
| DELETE | `/api/users/logs` | Limpar histórico |

### Dashboard
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/dashboard` | KPIs + gráficos + alertas |

### Swagger (Documentação interativa)
Acesse `http://localhost:5000/swagger` em modo desenvolvimento.

---

## 📱 PWA — Instalar no Celular

### Android (Chrome)
1. Abra o site no Chrome
2. Menu (⋮) → **"Adicionar à tela inicial"**
3. Confirme — o app aparece como ícone na tela

### iPhone (Safari)
1. Abra o site no Safari
2. Botão Compartilhar (□↑) → **"Adicionar à Tela de Início"**
3. Confirme — o app aparece como ícone na tela

### Funcionalidades PWA
- ✅ Funciona offline (telas em cache)
- ✅ Ícone na tela inicial
- ✅ Tela cheia sem barra do navegador
- ✅ Tema da barra de status personalizado
- ✅ Cache automático de assets

---

## ☁️ Opções de Hospedagem (Gratuitas ou Baratas)

### 1. Render.com (Recomendado — Gratuito)
```bash
# 1. Criar conta em render.com
# 2. New → Web Service → conectar GitHub
# 3. Build Command: dotnet publish -c Release -o out
# 4. Start Command: dotnet out/MtgSystem.dll
# 5. Pronto! URL automática
```

### 2. Railway.app (Gratuito com limites)
```bash
# 1. Criar conta em railway.app
# 2. New Project → Deploy from GitHub
# 3. Adicionar variável: ASPNETCORE_ENVIRONMENT=Production
# 4. Deploy automático
```

### 3. Azure App Service (Microsoft)
```bash
# Via Visual Studio:
# Botão direito no projeto → Publish → Azure App Service
# Ou via CLI:
az webapp up --name mtgsystem-erp --runtime "DOTNET:8"
```

### 4. VPS (mais controle)
```bash
# Publicar:
dotnet publish -c Release -o /var/www/mtgsystem

# Criar serviço systemd:
sudo nano /etc/systemd/system/mtgsystem.service

# Conteúdo:
[Unit]
Description=MTG SYSTEM ERP
After=network.target

[Service]
WorkingDirectory=/var/www/mtgsystem
ExecStart=/usr/bin/dotnet MtgSystem.dll
Restart=always
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://localhost:5000

[Install]
WantedBy=multi-user.target

# Ativar:
sudo systemctl enable mtgsystem
sudo systemctl start mtgsystem

# Nginx como proxy reverso:
server {
    listen 80;
    server_name seudominio.com;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
    }
}
```

---

## 🔒 Segurança em Produção

Antes de publicar, altere no `appsettings.json`:
```json
{
  "Jwt": {
    "Key": "COLOQUE-UMA-CHAVE-LONGA-E-ALEATORIA-AQUI-MINIMO-32-CHARS"
  }
}
```

Ou melhor, use variável de ambiente:
```bash
export Jwt__Key="SuaChaveSuperSecretaAqui"
```

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Backend | ASP.NET Core 8 (C#) |
| Banco | SQLite + Entity Framework Core |
| Auth | JWT Bearer + BCrypt |
| Docs | Swagger / OpenAPI |
| Frontend | HTML5 + CSS3 + JavaScript puro |
| Mobile | PWA (Progressive Web App) |
| Cache offline | Service Worker |
