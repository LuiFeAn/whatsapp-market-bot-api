const cartRepository = require("../repositories/cartRepository");

class CartService {

    async createCart(user_id){

        const cart = await this.getCartFromUser(user_id);

        return cartRepository.create(user_id);

    }

    async deleteCart(cart_id){

        return cartRepository.remove(cart_id);

    }
    

    async getCart({ userId,cartId }){

        const [ cart ] = await cartRepository.findOne({
            cartId,
            userId
        });

        return cart;

    }

}

module.exports = new CartService();