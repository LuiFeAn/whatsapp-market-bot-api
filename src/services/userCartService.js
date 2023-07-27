const cartRepository = require("../repositories/cartRepository");

class CartService {

    async createCart(user_id){

        const cart = await this.getCart(user_id);

        if( cart ) return;

        cartRepository.create(user_id);

    }

    deleteCart(user_id){
        
    }

    async getCart(user_id){

        const [ cart ] = await cartRepository.get(user_id);

        return cart;

    }

}

module.exports = new CartService();