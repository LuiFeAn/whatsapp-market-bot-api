const cartItemsRepository = require("../repositories/cartItemsRepository");
const { toBRL } = require("../utils/toBRL");
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

    async getStatus(cart_id){

        const userShoppingCart = await this.calcItems(cart_id);

        if( userShoppingCart.length === 0 ){

            return;

        }

        const {  productsWithCalcPerItem, totalShoppingCart } = userShoppingCart;

        let shoppingList = ''

        productsWithCalcPerItem.push({nome_produto:'',quantidade:''});

        productsWithCalcPerItem.forEach((product,id) => {

            const index = id += 1;

            if( product.nome_produto ){

                shoppingList += `\n*Item: ${index} - ${product.nome_produto} - ${product.quantidade} UND X ${toBRL(product.valor_produto)} - ${toBRL(product.total)}* `

            }

            if( id == productsWithCalcPerItem.length - 1){
                
                shoppingList += `\n\n*Valor total ${toBRL(totalShoppingCart)}*`

            }

         });

         return shoppingList;

    }

    async removeItem(cart_id,id){
        
        cartItemsRepository.remove(cart_id,id);
        
    }

    async removeAllItems(cart_id){

        cartItemsRepository.removeAll(cart_id);

    }

    async updateItem({ cart_id, item_id, quanty }){

        cartItemsRepository.updateItem({
            cart_id,
            item_id,
            quanty
        });

    }

}

module.exports = new CartItemsService();