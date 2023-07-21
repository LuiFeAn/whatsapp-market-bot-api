CREATE DATABASE econobot;

USE econobot;

CREATE TABLE clientes(

    id VARCHAR(30) NOT NULL PRIMARY KEY,
    nome_completo VARCHAR(250) NOT NULL,
    numero_telefone VARCHAR(25) NOT NULL,
    endereco VARCHAR(500) NOT NULL,
    current_step VARCHAR(250) DEFAULT 'CHOOSE_MENU_OPTION'

);


CREATE TABLE opcoes_bot(

    enviar_descricao_produto BOOLEAN NOT NULL

);

CREATE TABLE produtos(

    id INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    codigo_barra VARCHAR(250),
    produto VARCHAR(250) NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    estoque INT(10) NOT NULL,
    preco DECIMAL(10,2) NOT NULL

);

