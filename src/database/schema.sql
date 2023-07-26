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
    Codigo_Barra VARCHAR(250),
    Descricao VARCHAR(250) NOT NULL,
    Unidade_Compra VARCHAR(5) NOT NULL,
    Estoque INT(10) NOT NULL,
    precoUnitario DECIMAL(10,2) NOT NULL,
    Disponibilidade BOOLEAN NOT NULL

);


CREATE TABLE carrinhos(

    id INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(30) NOT NULL,
    status VARCHAR(10) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE

);

CREATE TABLE carrinho_items(

    id INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    carrinho_id INT(10) NOT NULL,
    nome_produto VARCHAR(500) NOT NULL,
    valor_produto DECIMAL(10,2) NOT NULL,
    quantidade INT(10) NOT NULL,
    FOREIGN KEY (carrinho_id) REFERENCES carrinhos(id) ON UPDATE CASCADE ON DELETE CASCADE

);



