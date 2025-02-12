//git add * , git commit -m "name" , potom push i vse//
new Vue({
    el: '#app',
    data(){
        return {
            cards: [],
            selectedCard: null,
            showEditModal: false,
            showReturnModal: false,
            currentCard: null,
        }
    },
    created() {
        this.loadCards()
    },
    computed: {
        plannedTasks(){
            return this.cards.filter( c => c.column === 1)
        },
        inProgressTasks(){
            return this.cards.filter(c => c.column === 2)
        },
        testingTask(){
            return this.cards.filter(c => c.column === 3)
        },
        completedTask(){
            return this.cards.filter(c => c.column === 4)
        }
    },
    methods: {
        openCreateModal(){
            this.selectedCard = null
            this.showEditModal = true
        },
        openEditModal(){
            this.selectedCard = card
            this.showEditModal = true
        },
        openReturnModal(){
            this.currentCard = card
            this.showEditModal = true
        },
        closeModal(){
            this.showEditModal = false
            this.showReturnModal = false
            this.showCurrentCard = null
        },
        deleteCard(card){
            if(confirm('You want delete this task?')) {
                const index = this.cards.findIndex(c => c.id === card.id)
                this.cards.splice(index, 1)
                this.saveCards()
            }
        },
        saveCard(updateCard){
            if(updateCard.id){
                const index = this.cards.findIndex(c => c.id === updateCard.id)
                this.cards.splice(index, 1, {
                    ...updateCard,
                    updateAt: new Date().toLocaleString()
                });
            }  else {
                this.cards.push({
                    ...updateCard,
                    id : Date.now(),
                    column: 1,
                    createdAt: new Date().toLocaleString(),
                    isOverdue: false
                });
            }
            this.saveCards()
        },
        moveCard(card, targetColumn){
            const newCard ={...card}
            if(targetColumn === 4) {
                newCard,isOverdue = new Date(card.deadline) < new Date()
            }
            newCard.column = targetColumn
            this.updateCard(newCard)
        },
        returnToWork(reason){
            const newCard = {...this.currentCard}
            newCard.column = 2
            newCard.returnReason = reason
            this.updateCard(newCard)
        },
        updateCard(newCard){
            const index = this.cards.findIndex(c => c.id === newCard.id)
            this.cards.splice(index, 1, {
                ...newCard,
                updateAt: newDate().toLocaleString()
            });
            this.saveCards()
        },
        saveCards(){
            localStorage.setItem('kanban-cards', JSON.stringify(this.cards))
        },
        loadCards(){
            const savedCards = localStorage.getItem('kanban-cards')
            this.cards = savedCards ? JSON.parse(savedCards) : []
        }
    }
})