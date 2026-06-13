# 🍽️ Restaurante Saboroso - Painel Admin & Reservas

Sistema web em Node.js para gestão de restaurante. Possui interface pública para clientes realizarem agendamentos e um painel administrativo completo com atualizações em tempo real, relatórios e e-mails automáticos.

---

## 🚀 Funcionalidades

### 🌐 Área Pública (Cliente)

- **Reserva de Mesas:** Formulário com validação de dados para agendamentos.
- **Confirmação por E-mail:** Envio automático com dados formatados em `DD/MM/YYYY`.
- **Cardápio e Contato:** Menu dinâmico e envio de mensagens para a administração.

### 📊 Painel Administrativo (Admin)

- **Dashboard:** Gráficos de linha (Chart.js) com o volume mensal de reservas.
- **CRUD Completo:** Gestão de menus, usuários, contatos e reservas.
- **Tempo Real:** Atualização instantânea do painel via WebSockets (Socket.io).
- **E-mails de Fluxo:** Notificações automatizadas enviadas ao cliente:
  - **Cancelamento:** Alerta imediato caso a reserva seja excluída.
  - **Edição:** Informativo comparativo mostrando os dados antigos lado a lado com os novos.
- **Exportação CSV:** Download de relatórios filtrados por data, otimizados para o Excel.

---

## 🛠️ Tecnologias

- **Backend:** Node.js / Express
- **Banco de Dados:** MySQL (via Promises)
- **View Engine:** EJS
- **Real-time:** Socket.io
- **E-mails:** Nodemailer (SMTP seguro via `.env`)
- **Gráficos & Datas:** Chart.js / Moment.js
- **Interface:** Bootstrap / AdminLTE

---

## 🔧 Configuração

### Passo a Passo

1. **Clone o projeto:**

   ```bash
   git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
   cd seu-repositorio
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente (.env):**
   Crie um arquivo `.env` na raiz do projeto:

   ```env
   DB_HOST=localhost
   DB_USER=seu_usuario
   DB_PASS=sua_senha
   DB_NAME=saboroso

   MAILER_USER="seu-email@gmail.com"
   MAILER_PASSWORD="sua-senha-de-app-de-16-digitos"
   ```

4. **Banco de Dados:**
   Execute o script SQL incluso na pasta para criar as tabelas necessárias.

5. **Inicie o servidor:**
   ```bash
   npm start
   ```
   Acesse `http://localhost:3000` no navegador.

---

## 🔒 Boas Práticas

- **Segurança:** Proteção de chaves e credenciais sensíveis via `.env`.
- **Escopo Assíncrono:** Congelamento de variáveis na memória para evitar dados `undefined`.
- **Compatibilidade:** Uso de CSS inline em tabelas HTML para perfeita renderização dos e-mails.
