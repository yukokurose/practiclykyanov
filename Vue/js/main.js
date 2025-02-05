//git add * , git commit -m "name" , potom push i vse//
let eventBus = new Vue()
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
            
                <info-tabs :shipping="shipping" :details="details"></info-tabs>

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
        
       <product-tabs :reviews="reviews"></product-tabs>
        
</div>
    
`,

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
            reviews: [],
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
        },
        addReview(productReview) {
            this.reviews.push(productReview)
        },
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
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },
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

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

    <p>
      <label for="name">Name:</label>
      <input class="name" v-model="name">
    </p>
    
    <p>
      <label for="review">Review:</label>      
      <textarea class="review" v-model="review"></textarea>
    </p>
    
    <p>
      <label for="rating">Rating:</label>
      <select class="rating" v-model.number="rating">
        <option>5</option>
        <option>4</option>
        <option>3</option>
        <option>2</option>
        <option>1</option>
      </select>
    </p>
         <p>Would you recommend this product?</p>
        <label>
          Yes
          <input type="radio" value="Yes" v-model="recommend"/>
        </label>
        <label>
          No
          <input type="radio" value="No" v-model="recommend"/>
        </label>
            
        <p>
          <input type="submit" value="Submit">  
        </p>    
      
    <p>
      <input type="submit" value="Submit">  
    </p>    
  
   </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            this.errors = []
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            }
            else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Recommendation required.")
            }
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },
    template: `
      <div>
      
        <div>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                :key="index"
                @click="selectedTab = tab"
          >{{ tab }}</span>
        </div>

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
                <li v-for="review in reviews">
                  <p>{{ review.name }}</p>
                  <p>Rating:{{ review.rating }}</p>
                  <p>{{ review.review }}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>
        </div>
    
      </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})
Vue.component('info-tabs', {
    props: {
        shipping: {
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
      <div>
      
        <ul>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>

        <div v-show="selectedTab === 'Details'">
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
        </div>
    
      </div>
    `,
    data() {
        return {
            tabs: ['Shipping', 'Details'],
            selectedTab: 'Shipping'
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