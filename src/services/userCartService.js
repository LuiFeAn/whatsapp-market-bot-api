const cartRepository = require("../repositories/cartRepository");

class CartService {

    async getCarts(userId){

        const carts = await cartRepository.findAll(userId);

        return carts;

    }

    async createCart(userId){

        return cartRepository.create(userId);

    }

    async deleteCart(cart_id){

        return cartRepository.remove(cart_id);

    }


    async partialUpdate(cartId,{ cartStatus }){

        if( cartStatus ){

            await cartRepository.updateStatus(cartId,cartStatus);

        }

    }
    

    async getLastCart(userId){

        const lastCart = await this.getCarts(userId);

        return lastCart[ lastCart.length - 1 ];

    }

}

module.exports = new CartService();