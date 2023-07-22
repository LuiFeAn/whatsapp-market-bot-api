

class UserInfosForm {

    id
    nome_completo
    endereco
    numero_telefone
    current_step

    constructor(id,currentUserStep){

        this.id = id;

        this.current_step = currentUserStep;

    }

    setName(name){

        this.nome_completo = name;

    }

    setAdress(adress){

        this.endereco = adress;

    }

    setNumber(number){

        this.numero_telefone = number

    }

    setCurrentStep(step){

        this.current_step = step;

    }

}

module.exports = UserInfosForm;