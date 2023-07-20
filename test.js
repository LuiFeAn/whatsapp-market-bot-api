

const items = {

    id:'',
    products:[
        {
            name:'Teste',
            quanty:4,
            value:2.5
        },
        {
            name:'Teste',
            quanty:3,
            value:5
        }
    ]

}

const { products } = items;


const test = products.map(function(item){

    const totalPerItem = item.quanty * item.value;

    return {
        ...item,
        total: totalPerItem

    }

});

console.log(test);


const theTotal = test.reduce((acc,item) => acc + item.total ,0);

console.log(theTotal)