const bookletRepository = require("../repositories/bookletRepository");
const path = require("path");

class BookletService {

    async getAllBooklets(){

        const booklets = await bookletRepository.findAll();

        return booklets;

    }

    async insertBooklet({
        currentHost,
        bookletPath,
        protocol
    }){

        // const imagePath = path.join(__dirname,'..','files');

        await bookletRepository.insert(`${protocol}://${currentHost}/images/booklets/${bookletPath}`);

    }

    async deleteBooklet(bookletId){

        await bookletRepository.delete(bookletId);

    }

}

module.exports = new BookletService();