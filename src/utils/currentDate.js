

module.exports = function currentDate(){

    const dataHoraAtual = new Date();
      
    const dia = String(dataHoraAtual.getDate()).padStart(2, '0');

    const mes = String(dataHoraAtual.getMonth() + 1).padStart(2, '0');

    const ano = dataHoraAtual.getFullYear();

    const hora = String(dataHoraAtual.getHours()).padStart(2, '0');

    const minutos = String(dataHoraAtual.getMinutes()).padStart(2, '0');

    const segundos = String(dataHoraAtual.getSeconds()).padStart(2, '0');
  
    const dataHoraFormatada = `${dia}/${mes}/${ano} ${hora}:${minutos}:${segundos}`;
    
    return dataHoraFormatada;
      

}