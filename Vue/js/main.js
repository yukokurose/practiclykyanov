let product = "Socks";
//git add * , git commit -m "name" , potom push i vse//
app = new Vue({
    el: '#app',
    data: {
        product: "Socks",
        image: "../assets/vmSocks-blue-onWhite.jpg",
        altText: "A pair of socks",
        inStock: true,
        inventory: 100,
        details: ['80% cotton', '20% polyester', 'Gender-neutral'],

        variants: [
            {
                variantId: 2234,
                variantColor: 'green'
            },
            {
                variantId: 2235,
                variantColor: 'blue'
            }
        ],

    }
})
