//git add * , git commit -m "name" , potom push i vse//
Vue.component('product',{
    template: `  
  <div class="product">
        <div class="product-image">
            <img :src="image" :alt="altText">
        </div>

        <div class="product-info">
            <h1>{{ title }}</h1>
            <p v-if="inStock">In stock</p>
            <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
             <product-details :details="details"></product-details>
                    <p>Shipping: {{ shipping }}</p>

            <div  class="color-box"
                  v-for="(variant, index) in variants"
                  :key="variant.variantId"
                  :style="{ backgroundColor:variant.variantColor }"
                  @mouseover="updateProduct(index)"
            >
            </div>

            <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add to Cart</button>

            <button @click="removeFromCart">Remove from cart</button>
  

        </div>
    </div>`,

    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "../assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10

                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "../assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            onSale: true,
        }
    },

    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },

    methods:{
        addToCart(){
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
        },
        removeFromCart: function() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        }
    },

    computed:{
        title(){
            return this.brand + ' ' + this.product
        },
        image(){
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock(){
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale(){
            if(this.onSale){
                return this.brand + ' ' + this.product + 'are on sale!'
            }
            return this.brand + ' ' + this.product + 'are not one sale!'
        },
        shipping(){
            if (this.premium) {
                return "Free"
            } else {
                return 2.99
            }
        }
    }
})

Vue.component('product-details',{
    template: ` <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>`,
    props: {
        details:{
            type: Array,
            required:true
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        },
        removeItem(id) {
            for(var i = this.cart.length - 1; i >= 0; i--) {
                if (this.cart[i] === id) {
                    this.cart.splice(i, 1);
                }
            }
        }
    }
})