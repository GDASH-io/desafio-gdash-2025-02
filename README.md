<nav>
<h1>Weather App - Desafio Full Stack sugerido pela GDASH</h1>

<p><strong>Link do vídeo de apresentação: </strong>https://youtu.be/OR_2kFaTuDY</p>

<h2>Índice</h2>
<ul>
    <li><a href="#1">1 – Apresentação do projeto</a></li>
    <ul>
        <li><a href="#1-1">1.1 – O que faz</a></li>
        <li><a href="#1-2">1.2 – Arquitetura geral</a></li>
    </ul>
    <li><a href="#2">2 – Sobre o Backend</a></li>
    <ul>
        <li><a href="#2-1">2.1 – Visão geral</a></li>
        <li><a href="#2-2">2.2 – Endpoints</a></li>
        <ul>
            <li><a href="#2-2-1">2.2.1 – Módulo de Usuários</a></li>
            <li><a href="#2-2-2">2.2.2 – Módulo de Clima</a></li>
        </ul>
    </ul>
    <li><a href="#3">3 – Sobre o Worker Go</a></li>
    <ul>
        <li><a href="#3-1">3.1 – Visão geral</a></li>
        <li><a href="#3-2">3.2 – Responsabilidades principais</a></li>
        <li><a href="#3-3">3.3 – Destaques da implementação</a></li>
        <li><a href="#3-4">3.4 – Por que usar Go?</a></li>
    </ul>
    <li><a href="#4">4 – Sobre o Coletor Python</a></li>
    <ul>
        <li><a href="#4-1">4.1 – Visão geral</a></li>
        <li><a href="#4-2">4.2 – Etapas do processo</a></li>
    </ul>
    <li><a href="#5">5 – Sobre o Frontend</a></li>
    <ul>
        <li><a href="#5-1">5.1 – Arquitetura e componentes</a></li>
        <li><a href="#5-2">5.2 – Autenticação e rotas</a></li>
        <li><a href="#5-3">5.3 – Estilos e responsividade</a></li>
        <li><a href="#5-4">5.4 – Usuário padrão</a></li>
    </ul>
    <li><a href="#6">6 – Executando com Docker</a></li>
    <ul>
        <li><a href="#6-1">6.1 – Pré-requisitos</a></li>
        <li><a href="#6-2">6.2 – Arquivos .env</a></li>
        <li><a href="#6-3">6.3 – Subir serviços</a></li>
        <li><a href="#6-4">6.4 – Portas expostas</a></li>
        <li><a href="#6-5">6.5 – Logs</a></li>
        <li><a href="#6-6">6.6 – Derrubar a arquitetura</a></li>
        <li><a href="#6-7">6.7 – Problemas comuns</a></li>
    </ul>
</ul>
<h2 id="1">1 – Apresentação do projeto</h2>
<h3 id="1-1">1.1 – O que faz</h3>
<p>
    Este projeto implementa um pipeline completo de coleta, processamento e exibição de dados climáticos, 
    usando <strong>Python</strong>, <strong>RabbitMQ</strong>, um worker em <strong>Go</strong>, 
    API <strong>NestJS</strong> com MongoDB e um <strong>Dashboard em React</strong>. 
    Insights de IA são gerados automaticamente com base nos dados históricos.
</p>
<h3 id="1-2">1.2 – Arquitetura geral</h3>
<p>
    O fluxo do sistema funciona da seguinte forma: o serviço Python coleta os dados no Open-Meteo 
    e envia essas informações para uma fila no <strong>RabbitMQ</strong>. 
    O worker em Go consome essa fila, valida o payload e envia para o backend em NestJS, 
    que armazena e disponibiliza tudo para o Dashboard.
</p>
<h2 id="2">2 – Sobre o Backend</h2>
<h3 id="2-1">2.1 – Visão geral</h3>
<p>
    O backend foi desenvolvido em <strong>NestJS (TypeScript)</strong> e funciona como o núcleo da aplicação, 
    responsável por receber, validar, armazenar e disponibilizar os dados climáticos processados pelo pipeline 
    <strong>Python → RabbitMQ → Go</strong>.
</p>
<p>
    Ele também implementa recursos como autenticação JWT, CRUD de usuários, exportação de dados para XLSX 
    e geração de insights utilizando modelos de IA. Toda a persistência é feita em <strong>MongoDB</strong>, 
    utilizando modelos definidos com Mongoose.
</p>
<h3 id="2-2">2.2 – Endpoints</h3>
<p>
    A API expõe endpoints organizados em dois módulos principais: <strong>Usuários</strong> e <strong>Clima</strong>. 
    Todos seguem o padrão REST, retornam JSON e — quando necessário — exigem autenticação 
    via <strong>Bearer Token (JWT)</strong>.
</p>
<h4 id="2-2-1">2.2.1 – Módulo de Usuários (/users)</h4>
<p><strong>POST /users</strong>: Cria um novo usuário.</p>
<p><strong>Body:</strong></p>
<pre>{
"name": "Marcos",
"email": "email@example.com",
"password": "123456"
}</pre>
<p><strong>GET /users/latest</strong>: Retorna o último usuário cadastrado.</p>
<p><strong>POST /users/login</strong>: Realiza login e retorna um JWT.</p>
<p><strong>Body:</strong></p>
<pre>{
"email": "email@example.com",
"password": "123456"
}</pre>
<p><strong>GET /users/profile</strong>: Retorna os dados do usuário autenticado.</p>
<p><strong>POST /users/profile/edit</strong>: Edita nome, email ou senha do usuário.</p>
<p><strong>POST /users/profile/edit/password</strong>: Atualiza apenas a senha.</p>
<h4 id="2-2-2">2.2.2 – Módulo de Clima (/weather)</h4>
<p><strong>POST /weather</strong>: Recebe um novo registro de clima (enviado pelo worker Go).</p>
<p><strong>Body:</strong></p>
<pre>{
"cityName": "Muriaé",
"tempture": 27.7,
"rain": 0,
"humidity": 41,
"sun": 1764537442,
"allTemp": "22,20,19,...",
"cloud": 11
}</pre>
<p><strong>GET /weather/latest</strong>: Retorna o registro climático mais recente.</p>
<p><strong>GET /weather/latest/temp</strong>: Retorna a temperatura mais recente.</p>
<p><strong>GET /weather/latest/cityName</strong>: Retorna o nome da cidade mais recente.</p>
<p><strong>GET /weather/latest/allTemp</strong>: Retorna todas as temperaturas do dia.</p>
<p><strong>GET /weather/insights</strong>: Gera insights de IA.</p>
<p><strong>GET /weather/latest/export</strong>: Exporta os dados mais recentes em XLSX.</p>
<h2 id="3">3 – Sobre o Worker Go</h2>
<h3 id="3-1">3.1 – Visão geral</h3>
<p>
    O worker desenvolvido em <strong>Go</strong> é a ponte entre o sistema de coleta de dados 
    (Python + Open-Meteo) e o backend em NestJS. Ele consome mensagens do <strong>RabbitMQ</strong>, 
    valida o payload e envia para o backend.
</p>
<p>
    Por ser desenvolvido em Go — uma linguagem eficiente, rápida e de baixa latência — o worker garante 
    alto desempenho no processamento da fila, estabilidade e baixo consumo de recursos.
</p>
<h3 id="3-2">3.2 – Responsabilidades principais</h3>
<ul>
    <li><strong>Conexão ao RabbitMQ:</strong> Assina a fila e aguarda novas mensagens.</li>
    <li><strong>Processamento do payload:</strong> Desserializa, valida e trata erros.</li>
    <li><strong>Envio ao backend:</strong> Apenas mensagens aceitas pelo NestJS recebem ACK.</li>
</ul>
<h3 id="3-3">3.3 – Destaques da implementação</h3>
<ul>
    <li>Uso de variáveis de ambiente para URLs e nome da fila.</li>
    <li>Confirmação manual de cada mensagem (Ack/Nack).</li>
    <li>Reprocessamento automático em caso de falha.</li>
    <li>Execução leve e eficiente, ideal para containers.</li>
    <li>Arquitetura desacoplada e escalável.</li>
</ul>
<h3 id="3-4">3.4 – Por que usar um worker em Go?</h3>
<ul>
    <li>Alta performance no consumo de filas.</li>
    <li>Baixo uso de memória.</li>
    <li>Simplicidade e robustez.</li>
    <li>Concorrência nativa com goroutines.</li>
</ul>
<h2 id="4">4 – Sobre o Coletor Python</h2>

<h3 id="4-1">4.1 – Visão Geral</h3>
<p>
    O coletor desenvolvido em <strong>Python</strong> é responsável por buscar dados climáticos 
    diretamente da API <strong>Open-Meteo</strong>, processá-los com <strong>Pandas</strong> e 
    enviá-los para a fila do <strong>RabbitMQ</strong>. Esses dados são posteriormente consumidos 
    pelo worker em Go e enviados ao backend NestJS.
</p>
<p>
    O script roda continuamente a cada <strong>20 minutos</strong>, garantindo dados sempre atualizados.
</p>

<h3 id="4-2">4.2 – Etapas do Processo</h3>
<ul>
    <li><strong>Requisição à Open-Meteo:</strong> uso do cliente com cache e retry para maior estabilidade.</li>
    <li><strong>Processamento com Pandas:</strong> criação de DataFrames contendo dados horários e diários.</li>
    <li><strong>Seleção da medição mais recente:</strong> escolha automática do horário mais próximo ao atual.</li>
    <li><strong>Formatação do payload:</strong> montagem dos dados necessários em formato JSON.</li>
    <li><strong>Envio ao RabbitMQ:</strong> publicação de mensagens persistentes na fila.</li>
    <li><strong>Loop contínuo:</strong> execução repetida a cada 1200 segundos.</li>
</ul>
<h2 id="5">5 – Sobre o Frontend</h2>

<p>
    O frontend foi desenvolvido utilizando <strong>React (TypeScript)</strong> e estilizado com <strong>Tailwind CSS</strong>, proporcionando uma interface responsiva, moderna e dinâmica para visualização dos dados climáticos. O foco principal é a usabilidade e a exibição clara das informações, além de funcionalidades administrativas (login, cadastro e perfil).
</p>

<hr>

<h3 id="5-1">5.1 – Arquitetura e Componentes Principais</h3>

<p>
    A aplicação é dividida em componentes reutilizáveis, seguindo o padrão modular do React:
</p>

<ul>
    <li>
        <strong><code>Home.tsx</code></strong>: A tela principal da aplicação. Responsável por organizar o layout, importar os cards de informação (<code>TemperatureCard</code>, <code>TempDiagram</code>) e gerenciar o botão de <strong>exportação para XLSX</strong>, que é liberado apenas para usuários logados.
    </li>
    <li>
        <strong><code>Navbar.tsx</code></strong>: Componente de navegação superior, adaptável para telas grandes (Desktop) e pequenas (Mobile, usando o componente <code>Sheet</code> para o menu lateral). Gerencia o estado de autenticação (<code>logged</code>) para exibir links de <strong>Login/Cadastro</strong> ou <strong>Sair/Perfil</strong>.
    </li>
    <li>
        <strong><code>TemperatureCard.tsx</code></strong>: Exibe as informações climáticas mais recentes de forma resumida (temperatura, probabilidade de chuva, umidade, pôr do sol). É responsável por gerenciar a abertura e fechamento do <strong>Modal de Insights</strong> (<code>openModal</code>).
    </li>
    <li>
        <strong><code>TempDiagram.tsx</code></strong>: Exibe a variação de temperatura ao longo do dia em um <strong>gráfico de linha interativo</strong> (utilizando <code>recharts</code>). Faz uma chamada específica para o endpoint <code>allTemp</code> do backend para popular o diagrama.
    </li>
    <li>
        <strong><code>Insights.tsx</code></strong>: É o componente modal que exibe a análise gerada pela IA, buscando o conteúdo via API no backend. Possui um estado de <strong><code>loading</code></strong> e o botão de <strong><code>Fechar</code></strong> (recebido via <code>props</code>) que garante o controle de fechamento pelo componente pai (<code>TemperatureCard</code>).
    </li>
</ul>

<hr>

<h3 id="5-2">5.2 – Autenticação e Rotas</h3>

<p>
    A autenticação é gerenciada pelo <strong><code>localStorage</code></strong>, onde o <strong>JWT</strong> é armazenado após o login. As rotas principais incluem:
</p>

<ul>
    <li><strong><code>/</code> (Home)</strong>: Exibe o dashboard de clima.</li>
    <li><strong><code>/login</code> (<code>Login.tsx</code>)</strong>: Formulário para autenticação. Em caso de sucesso, armazena o token e navega para a Home.</li>
    <li><strong><code>/users</code> (<code>Users.tsx</code>)</strong>: Formulário de cadastro de novos usuários.</li>
    <li><strong><code>/user</code> (<code>UserPage.tsx</code>)</strong>: Acesso restrito (requer JWT). Permite ao usuário logado visualizar e editar suas <strong>Informações de Perfil</strong> (nome, email) e <strong>Alterar a Senha</strong> através de um modal dedicado (<code>openPasswordModal</code>).</li>
</ul>

<hr>

<h3 id="5-3">5.3 – Estilos e Responsividade</h3>

<p>
    O uso de <strong>Tailwind CSS</strong> permitiu a criação de classes utilitárias para garantir a <strong>responsividade</strong> e a identidade visual do app.
</p>

<ul>
    <li>O layout principal usa <strong>classes Flexbox</strong> (<code>flex</code>, <code>justify-between</code>, <code>items-center</code>) para centralizar o conteúdo.</li>
    <li>O fundo da Home utiliza um <strong>gradiente personalizado</strong> (<code>bg-linear-to-t from-[#5aeebd]</code>).</li>
    <li>A <strong>Navbar</strong> utiliza classes de visibilidade (<code>hidden md:flex</code>) para alternar entre o menu sanduíche (mobile) e a navegação por links (desktop).</li>
</ul>
<h3 id="5-4">5.4 – Usuário padrão</h3>
<p>
    Foi gerado um usuário padrão cujo login e senha são <strong>admin</strong>, como também seu nome.
</p>
<h2 id="6">6 – Executando com Docker</h2>

<h3 id="6-1">6.1 – Pré-requisitos</h3>
<p>
    Para rodar toda a arquitetura utilizando Docker, é necessário ter instalado:
</p>
<ul>
    <li><strong>Docker</strong></li>
    <li><strong>Docker Compose</strong> (incluso nas versões recentes do Docker Desktop)</li>
</ul>

<hr>

<h3 id="6-2">6.2 – Arquivos de Ambiente (env)</h3>
<p>
    Antes de iniciar, é fundamental garantir que todos os serviços possuam os arquivos
    <code>.env</code> necessários. Abaixo estão os exemplos mínimos para cada módulo:
</p>

<h4 id="6-2-1">6.2.1 – Backend (<code>.env</code>)</h4>
<pre>
JWT_SECRET = "WGJ60d6)5l3{"
GENAI_API_KEY = "AIzaSyC3l83TQlJapYXN924-n13NSiITMVHbGQc"
</pre>


<p>Se o repositório contém arquivos <code>env.txt</code>, basta renomeá-los para <code>.env</code>, caso houver a ausencia de um arquivo <code>.env</code>.</p>

<hr>

<h3 id="6-3">6.3 – Subindo todos os serviços</h3>
<p>
    Após configurar os arquivos de ambiente, basta executar o comando abaixo para construir e iniciar
    toda a arquitetura:
</p>

<pre>
docker-compose up --build
</pre>

<p>
    Este comando inicia automaticamente:
</p>
<ul>
    <li><strong>MongoDB</strong></li>
    <li><strong>RabbitMQ</strong> (incluindo o painel administrativo)</li>
    <li><strong>Backend NestJS</strong></li>
    <li><strong>Frontend React</strong></li>
    <li><strong>Worker Go</strong></li>
    <li><strong>Coletor Python</strong></li>
</ul>

<hr>

<h3 id="6-4">6.4 – Portas Expostas</h3>
<p>A tabela abaixo lista as portas utilizadas por cada serviço:</p>

<table>
    <tr>
        <th>Serviço</th>
        <th>Porta</th>
        <th>Descrição</th>
    </tr>
    <tr>
        <td>Frontend (React)</td>
        <td><strong>5173</strong></td>
        <td>Dashboard web</td>
    </tr>
    <tr>
        <td>Backend (NestJS)</td>
        <td><strong>3000</strong></td>
        <td>API REST principal</td>
    </tr>
    <tr>
        <td>MongoDB</td>
        <td><strong>27017</strong></td>
        <td>Banco de dados</td>
    </tr>
    <tr>
        <td>RabbitMQ</td>
        <td><strong>5672</strong></td>
        <td>Conexão AMQP</td>
    </tr>
    <tr>
        <td>RabbitMQ Management</td>
        <td><strong>15672</strong></td>
        <td>Painel administrativo</td>
    </tr>
</table>

<hr>

<h3 id="6-5">6.5 – Visualizando Logs</h3>
<p>Para acessar os logs de um serviço específico:</p>

<pre>
docker-compose logs -f backend
docker-compose logs -f python
docker-compose logs -f worker
</pre>

<hr>

<h3 id="6-6">6.6 – Derrubando a Arquitetura</h3>
<p>Para parar todos os containers:</p>

<pre>
docker-compose down
</pre>

<p>Para remover também os volumes (MongoDB e RabbitMQ):</p>

<pre>
docker-compose down -v
</pre>

<hr>

<h3 id="6-7">6.7 – Problemas Comuns</h3>

<ul>
    <li><strong>Porta já em uso:</strong> Verifique se React, NestJS ou Mongo estão rodando localmente fora do Docker.</li>
    <li><strong>Variáveis de ambiente ausentes:</strong> O backend ou o worker podem falhar ao iniciar. Confira os arquivos <code>.env</code>.</li>
    <li><strong>API não recebe dados:</strong> Verifique se o worker Go está conectado corretamente ao RabbitMQ usando:
        <pre>docker-compose logs worker</pre>
    </li>
    <li><strong>Demora ao iniciar: </strong>o programa demora entre 1 e 3 minutos para iniciar e irá aparecer no log do go worker uma mensagem confirmando que o programa foi iniciado corretamente.</li>
</ul>