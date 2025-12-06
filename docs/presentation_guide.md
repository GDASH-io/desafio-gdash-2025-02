# Guia de Apresentação Técnica do Projeto

Este guia detalhado vai te ajudar a explicar o funcionamento técnico do projeto "Desafio GDash". O sistema é uma aplicação distribuída moderna, utilizando microsserviços e mensageria.

## Visão Geral da Arquitetura

O projeto segue uma arquitetura orientada a eventos, onde diferentes serviços se comunicam de forma assíncrona.

**Componentes Principais:**
1.  **Backend (NestJS):** API central e gerenciamento de dados.
2.  **Frontend (React):** Interface do usuário.
3.  **Collector (Python):** Coleta dados meteorológicos externos.
4.  **Worker (Go):** Processa dados em alta performance.
5.  **RabbitMQ:** Sistema de mensageria que conecta o Collector e o Worker.
6.  **MongoDB:** Banco de dados NoSQL para armazenar informações.

---

## 1. Backend (O Núcleo)

**Tecnologias:**
*   **NestJS (Node.js/TypeScript):** Framework progressivo para construir aplicações server-side eficientes e escaláveis.
*   **Mongoose:** Biblioteca para modelagem de dados do MongoDB.
*   **Passport:** Middleware de autenticação (Login seguro).
*   **Swagger:** Documentação automática da API.

**O que explicar:**
*   "O Backend é construído em **NestJS**, que organiza o código em Módulos, Controladores e Serviços, facilitando a manutenção."
*   **Módulos Principais:**
    *   `AuthModule`: Gerencia login e tokens JWT (segurança).
    *   `UsersModule`: Criação e gestão de usuários.
    *   `WeatherModule`: Gerencia os dados de clima recebidos.
*   "Usamos **MongoDB** como banco de dados, ideal para armazenar logs de clima que chegam em grande volume."

---

## 2. Frontend (A Interface)

**Tecnologias:**
*   **React (TypeScript):** Biblioteca para criar interfaces de usuário.
*   **Vite:** Ferramenta de build extremamente rápida.
*   **TailwindCSS:** Framework de CSS para estilização ágil e responsiva.
*   **Recharts:** Biblioteca para criar os gráficos do Dashboard.
*   **Axios:** Cliente HTTP para conectar com o Backend.

**O que explicar:**
*   "O Frontend é uma Single Page Application (SPA) feita em **React**."
*   "Utilizamos **Vite** para garantir performance no desenvolvimento e carregamento."
*   **Páginas Principais:**
    *   `Dashboard`: Exibe gráficos de temperatura e umidade em tempo real (usando `Recharts`).
    *   `Login`: Tela de autenticação segura.
    *   `Users`: Gestão de usuários do sistema.

---

## 3. Collector (O Coletor de Dados)

**Tecnologias:**
*   **Python:** Linguagem escolhida pela facilidade em lidar com scripts e dados.
*   **Requests:** Biblioteca para fazer chamadas HTTP.
*   **Pika:** Cliente para conectar ao RabbitMQ.
*   **Schedule:** Biblioteca para agendar tarefas (rodar a cada minuto).

**O que explicar:**
*   "O Collector é um serviço autônomo escrito em **Python**."
*   "Ele consulta a API externa **Open-Meteo** para buscar dados reais de clima (Temperatura, Umidade, Vento)."
*   "Ao invés de salvar direto no banco, ele envia esses dados para uma fila no **RabbitMQ**, garantindo que o sistema não trave se houver muitos dados."

---

## 4. Worker (O Processador Rápido)

**Tecnologias:**
*   **Go (Golang):** Linguagem compilada de alta performance.
*   **Amqp091-go:** Driver oficial do RabbitMQ para Go.

**O que explicar:**
*   "O Worker é escrito em **Go** para garantir máxima velocidade e baixo consumo de memória."
*   "Ele fica escutando a fila `weather_data` do RabbitMQ."
*   "Assim que o Collector posta um dado, o Worker pega, processa e envia para o Backend salvar."
*   "Essa separação permite que a coleta e o processamento aconteçam em ritmos diferentes sem derrubar o sistema."

---

## 5. Fluxo de Dados Completo (O "Caminho do Dado")

Para impressionar, explique o caminho que um dado faz:

1.  **Coleta:** O **Collector (Python)** acorda (agendado), busca a temperatura na API Open-Meteo.
2.  **Fila:** O Collector empacota esse dado e joga na fila do **RabbitMQ**.
3.  **Processamento:** O **Worker (Go)**, que estava esperando, pega esse pacote da fila instantaneamente.
4.  **Persistência:** O Worker envia o dado para o **Backend (NestJS)** via API interna.
5.  **Armazenamento:** O Backend valida e salva no **MongoDB**.
6.  **Visualização:** O usuário acessa o **Frontend (React)**, que pede os dados ao Backend e desenha o gráfico na tela.

---

## Dicas para a Apresentação

*   **Destaque a Escalabilidade:** Mencione que, como os serviços são separados (Docker), se precisarmos coletar dados de 1000 cidades, basta criar mais cópias do container do Collector e do Worker, sem mexer no Backend.
*   **Segurança:** Fale que o Frontend e Backend se comunicam via Tokens JWT, garantindo que só usuários logados vejam os dados.
*   **Modernidade:** Enfatize o uso de tecnologias de ponta como React, NestJS e Go.
