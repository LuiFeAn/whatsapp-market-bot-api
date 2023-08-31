const cartItemsService = require('../services/cartItemsService');

class CartItemsController {

    async show(req,res){

        const { id } = req.params;

        const cartItems = await cartItemsService.findItems(id);

        res.json(cartItems);

    }

}

module.exports = new CartItemsController();