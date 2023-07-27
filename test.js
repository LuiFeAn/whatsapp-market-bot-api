function promiseTest() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Promessa resolvida após 30 segundos!");
      }, 30000);
    });
}


const testRepository = {

    async findOne(){

        return promiseTest();

    }

}

const testService = {

    async getOne(){

        return testRepository.findOne();

    }

}


async function execute(){

    const result = await testService.getOne();

    console.log(result);

    console.log('resolveu')

}

execute();
  
