const cartRepository = require("../repositories/cartRepository");

class CartService {

    async createCart(userId){

        const cart = await this.getCart({
            userId
        });

        return cartRepository.create(userId);

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