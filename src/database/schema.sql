CREATE DATABASE econobot;

USE econobot;

CREATE TABLE usuarios(

    id VARCHAR(30) NOT NULL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL

);

CREATE TABLE usuario_informacoes(

    id int(10) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    usuario_id VARCHAR(30) NOT NULL,
    numero_telefone VARCHAR(25),
    endereco VARCHAR(100),
    bairro VARCHAR(65),
    numero_casa VARCHAR(10000),
    complemento VARCHAR(100),
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

CREATE TABLE pedidos(

     id INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
     carrinho_id INT(10) NOT NULL,
     metodo_entrega VARCHAR(20) NOT NULL,
     metodo_pagamento VARCHAR(20) NOT NULL,
     observacao VARCHAR(500),
     horario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     total DECIMAL(10,2) NOT NULL,
     troco DECIMAL(10,2),
     status VARCHAR(30) DEFAULT 'RECEBIDO',
     FOREIGN KEY (carrinho_id) REFERENCES carrinhos(id) ON UPDATE CASCADE ON DELETE CASCADE

);


CREATE TABLE taxa_entrega(

    id INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(30) NOT NULL,
    taxa  DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE

);


DELIMITER //
CREATE TRIGGER tr_adicionar_frete
AFTER INSERT ON usuarios
FOR EACH ROW
BEGIN
    INSERT INTO taxa_entrega VALUES (NULL, NEW.id, 5);
END;
//
DELIMITER ;

CREATE TABLE aceita_promocoes(

   id INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
   usuario_id VARCHAR(30) NOT NULL,
   CONSTRAINT fk_usuario_promocoes FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE

);

CREATE TABLE encartes(

    id INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    encarte VARCHAR(500) NOT NUll

);

CREATE TABLE comprovantes(

    id INT(10) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    comprovante VARCHAR(500) NOT NULL,
    pedido_id INT(10) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE ON UPDATE CASCADE

);


