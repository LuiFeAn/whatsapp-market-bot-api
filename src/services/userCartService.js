const cartRepository = require("../repositories/cartRepository");

class CartService {

    async createCart(user_id){

        const cart = await this.getCartFromUser(user_id);

        if( cart ) return;

        cartRepository.create(user_id);

    }

    async deleteCart(cart_id){

        return cartRepository.remove(cart_id);

    }
    

    async getCartFromUser(user_id){

        const [ cart ] = await cartRepository.get(user_id);

        return cart;

    }

}

module.exports = new CartService();