


class ShoppingInMemoryRepository {

    shopping

    constructor(){

        this.shopping = [];

    }

    createUserShoppingCart(id){

        this.shopping.push({
            id,
            products:[]
        });

    }

    getItemFromShoppingCart(id){

        return this.shopping.find( item => item.id === id );

    }

    updateShoppingCart({ id, productInfos }){

        const existent = this.getItemFromShoppingCart(id);

        existent.products.push(productInfos);

    }


}

module.exports = new ShoppingInMemoryRepository();