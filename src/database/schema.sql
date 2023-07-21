CREATE DATABASE econobot;

USE econobot;

CREATE TABLE niveis_acesso(

    id int(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    nivel_acesso VARCHAR(100) NOT NULL

);


INSERT INTO niveis_acesso VALUES(NULL,'CLIENTE');

CREATE TABLE usuarios(

    id VARCHAR(30) NOT NULL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    current_step VARCHAR(250),
    nivel_acesso_id INT(10) NOT NULL,
    FOREIGN KEY (nivel_acesso_id) REFERENCES niveis_acesso(id) ON DELETE CASCADE ON UPDATE CASCADE

);

CREATE TABLE usuario_informacoes(

    id int(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(30) NOT NULL,
    numero_telefone VARCHAR(25) NOT NULL,
    endereco VARCHAR(500) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE

);

CREATE TABLE produtos(

    id INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    codigo_barra VARCHAR(250),
    produto VARCHAR(250) NOT NULL,
    descricao VARCHAR(500) NOT NULL,
    estoque INT(10) NOT NULL,
    preco DECIMAL(10,2) NOT NULL

);

CREATE TABLE usuario_carrinho(

    id int(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(30) NOT NULL,
    produto_id INT(10) NOT NULL,
    quantidade INT(10) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)

);

