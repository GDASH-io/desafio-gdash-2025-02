# Worker

O componente **Worker** consome os dados da fila recebidos via **RabbitMQ** e os separa em 3 estruturas: **DadosAtuais**, **DadosHorarios** e **DadosDiarios**. Em seguida, realiza 3 requisições POST para o **Backend** com esses dados.
