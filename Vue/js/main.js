Vue.component('task-card',{
    props: ['card', 'editable'],
    template: `
        <div class="card" : class="{ 'overdue' : card.isOverdue, 'completed': !card.isOverdue && card.column === 4}">
            <div class="card-header">
                <h3>{{ card.title }}</h3>
                <button v-if="editable" @click="#emit('edit', 'card')" class="btn-secondary">✏️</button>
                <button v-if="editable && card.column === 1" @click="$emit('delete')" class="btn-danger">🗑️</button>
            </div>
            <p>{{ card.description }}</p>
            <div class="timestamp">
                <div>Создано: {{ card.createdAt }}</div>
                <div v-if="card.updateAt">Изменено: {{ card.updateAt }}</div>
                <div>Дедлайн {{ card.deadline }}</div>
                <div v-if="card.returnReason" class="return-reason">
                        Причина возврата: {{ card.returnReason }}
                </div>
            </div>
            <div class="card-actions">
                <slot name="actions"></slot>
            </div>
        </div>
    
    `
});

Vue.component('kanban-column', {
    props:['title','cards','canCreate'],
    template: `
        <div class="column">
            <h2>{{ title }}</h2>
            <button v-if="canCreate" @click="$emit('create')"
            class="btn-primary">
                + Новая задача </button>
            <div v-dor="card in cards" :key="card.id">
                <task-card :card="card"
                :editable="true"
                @edit="$emit('edit', card)"
                @delete="$emit('delete', card)">
            
                <template v-slot:action>
                    <button v-for="action in getActions(card)"
                        @click="handleAction(action, card)"
                        :class="action.class">
                        {{ action.label }}
                    </button>
                </template>
            </task-card>
        </div>
    </div>
`,
    methods:{
        getAction(card){
            const actions = []
            switch(card.column){
                case 1:
                    actions.push(
                        {label: 'В работу', type: 'move', target: 2, class: 'btn-primary'}
                    )
                    break

                case 2:
                    actions.push(
                        {label: 'В тестирование', type: 'move', target:32, class: 'btn-primary'}
                    )
                    break

                case 3:
                    actions.push(
                        {label: 'Вернуть', type: 'return', class: 'btn-primary'},
                        {label: 'Завершить', type: 'move', target: 4, class: 'btn-primary'}
                    )
                    break
            }
            return actions
        },
        handleAction(action, card){
            if(action.type === 'move'){
                this.$emit('move', card, action.target)
            } else if(action.type === 'return'){
                this.$emit('return',card)
            } else if(action.type === 'edit'){
                this.$emit('edit',card)
            } else if(action.type === 'delete'){
                this.$emit('delete',card)
            }
        }
    }
});

Vue.component('modal-edit', {
    props: ['card'],
    template: `
        <div class="modal-mask">
            <div class ="modal-content">
                <h3>{{ card ? 'Редактирование' : 'Новая задача' }}</h3>
                <div class="form-group">
                    <label>Описание:</label>
                    <textarea v-model="form.description" required></textarea>
                </div>
                <div class="form-group">
                    <label>Дедлайн:</label>
                    <input type="date" v-model="form-deadline" :min="minDate" required>
                </div>
                <button class="btn-primary" @click="save">Сохранить</button>
                <button class="btn-secondary" @click="$emit('close')">Отмена</button>
            </div>
        </div>
    `,
    data() {
        return {
            form: this.card ? {...this.card} : {
                title: '',
                description: '',
                deadline: ''
            },
            minDate: new Date().toISOString().split('T')[0]
        }
    },
    methods: {
        save(){
            if (!this.validateForm()) return
            this.$emit('save', this.form)
            this.$emit('close')
        },
        validateForm(){
            if(!this.form.title.trim()){
                alert('Введите название задачи')
                return false
            }
            if(!this.form.deadline){
                alert('Выберите дедлайн')
                return false
            }
            return true
        }
    }
});

Vue.component('modal-return', {
    template: `
         <div class="modal-mask">
            <div class ="modal-content">
                <h3>Причина возврата</h3>
                <div class="form-group">
                    <label>Описание:</label>
                    <input v-model="reason" placeholder="Укажите причину возврата" required>
                </div>
                <button class="btn-primary" @click="sconfirm">Подтвердить</button>
                <button class="btn-secondary" @click="$emit('close')">Отмена</button>
            </div>
        </div>
    `,
    data(){
        return{
            reason: ''
        }
    },
    methods: {
        confirm(){
            if(!this.reason.trim()){
                alert('Укажите причину возврата')
                return
            }
            this.$emit('confirm', this.reason)
            this.$emit('close')
        }
    }
});

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