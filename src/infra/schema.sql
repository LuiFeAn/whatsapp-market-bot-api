CREATE DATABASE econobot;

USE econobot;

CREATE TABLE clientes(

    id VARCHAR(30) NOT NULL PRIMARY KEY,
    nome_completo VARCHAR(250) NOT NULL,
    numero_telefone VARCHAR(25) NOT NULL,
    endereco VARCHAR(500) NOT NULL

);

