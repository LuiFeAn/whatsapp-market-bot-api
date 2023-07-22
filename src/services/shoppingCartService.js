
const shoppingCartRepository = require("../repositories/shoppingCartRepository");

class ShoppingCartService {

    async calcUserTotalShoppingCart(usuario_id){

        const userShoppingCart = await shoppingCartRepository.getShoppingCart(usuario_id);

        if( userShoppingCart.length > 0 ){

            const productsWithCalcPerItem = userShoppingCart.map( item => ({
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

        return userShoppingCart;

    }


}

module.exports = new ShoppingCartService();