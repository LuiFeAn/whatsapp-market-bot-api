const cartItemsRepository = require("../repositories/cartItemsRepository");
const BotDefaultErrors = require("../errors/defaultError");

class CartItemsService {

    async addItem({cart_id,product_name,product_value,quanty}){

        cartItemsRepository.add({
            cart_id,
            product_name,
            product_value,
            quanty
        });

    }

    async findItem(cart_id,product_name){

        const [ item ] = await cartItemsRepository.find(cart_id,product_name);

        return item;

    }

    async findItems(cart_id){

        const items = await cartItemsRepository.findAll(cart_id);

        return items;
        
    }

    async calcItems(cart_id){

        const cartItems = await this.findItems(cart_id);

        if( cartItems.length > 0 ){

            const productsWithCalcPerItem = cartItems.map( item => ({
                ...item,
                produto: item.nome_produto.toUpperCase(),
                total: ( item.quantidade * item.valor_produto )
            }));
    
            const totalShoppingCart = productsWithCalcPerItem.reduce((acc,item) => (
                acc + item.total
            ),0);

            return {
                productsWithCalcPerItem,
                totalShoppingCart
            }
    
        }

        return cartItems

    }

    async removeItem(cart_id,id){
        
        cartItemsRepository.remove(cart_id,id);
        
    }

    async updateItem(cart_id,product_name){

    }

}

module.exports = new CartItemsService();