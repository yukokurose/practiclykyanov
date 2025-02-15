Vue.component('task-card',{
    props: ['card', 'editable'],
    template: `
                 <div class="card" :class="{ 
            'overdue': card.isOverdue, 
            'completed': !card.isOverdue && card.column === 4,
            'important': card.isImportant 
        }">
            <div class="card-header">
                <h3>
                    {{ card.title }}
                    <span v-if="card.isImportant" class="important-badge">★ Важная</span>
                </h3>
                <div>
                    <button v-if="editable && card.column !== 4" @click="$emit('edit')" class="btn-secondary">✏️</button>
                    <button v-if="editable && card.column === 1" @click="$emit('delete')" class="btn-danger">❌</button>
                </div>
            </div>
                    <p>{{ card.description }}</p>
                    <div class="timestamp">
                        <div>Создано: {{ card.createdAt }}</div>
                        <div v-if="card.updatedAt">Изменено: {{ card.updatedAt }}</div>
                        <div>Дедлайн: {{ card.deadline }}</div>
                        <div v-if="card.returnReasons && card.returnReasons.length" class="return-reasons">
                            <strong>Причины возврата:</strong>
                                <ul>
                                    <li v-for="(item, index) in card.returnReasons" :key="index">
                                    {{ item.date }} - {{ item.reason }}
                                    </li>
                                </ul>
                        </div>
                    </div>
                    <div class="card-actions">
                        <slot name="actions"></slot>
                    </div>
                </div>
            `
});
Vue.component('kanban-column', {
    props: ['title', 'cards', 'canCreate'],
    template: `
        <div class="column">
            <h2>{{ title }}</h2>
            <button 
                v-if="canCreate" 
                @click="$emit('create')" 
                class="btn-primary"
            >
                + Новая задача
            </button>
            <div v-for="card in sortedCards" :key="card.id">
                <task-card 
                    :card="card" 
                    :editable="true"
                    @edit="$emit('edit', card)"
                    @delete="$emit('delete', card)"
                >
                    <template v-slot:actions>
                        <button 
                            v-for="action in getActions(card)" 
                            @click="handleAction(action, card)"
                            :class="action.class"
                        >
                            {{ action.label }}
                        </button>
                    </template>
                </task-card>
            </div>
        </div>
    `,
    methods: {
        getActions(card) {
            const actions = [];
            switch(card.column) {
                case 1:
                    actions.push(

                        { label: 'В работу', type: 'move', target: 2, class: 'btn-primary' }
                    );
                    break;
                case 2:
                    actions.push(
                        { label: 'В тестирование', type: 'move', target: 3, class: 'btn-primary' }
                    );
                    break;
                case 3:
                    actions.push(
                        { label: 'Вернуть', type: 'return', class: 'btn-danger' },
                        { label: 'Завершить', type: 'move', target: 4, class: 'btn-primary' }
                    );
                    break;
            }
            return actions;
        },
        handleAction(action, card) {
            if (action.type === 'move') {
                this.$emit('move', card, action.target);
            } else if (action.type === 'return') {
                this.$emit('return', card);
            } else if (action.type === 'edit') {
                this.$emit('edit', card);
            } else if (action.type === 'delete') {
                this.$emit('delete', card);
            }
        }
    },
    computed: {
        sortedCards() {
            return [...this.cards].sort((a, b) => {
                if (a.isImportant && !b.isImportant) return -1;
                if (!a.isImportant && b.isImportant) return 1;
                return 0;
            });
        }
    }
});

Vue.component('modal-edit', {
    props: ['card'],
    template: `
        <div class="modal-mask">
            <div class ="modal-content">
                <h3>{{ card ? 'Редактирование' : 'Новая задача' }}</h3>
                <div class="form-group checkbox-group">
    <input type="checkbox" v-model="form.isImportant">
    <label>Важная задача</label>
</div>
                 <div class="form-group">
                    <label>Заголовок:</label>
                    <input v-model="form.title" required>
                </div>
                 <div class="form-group">
                    <label>Описание:</label>
                    <textarea v-model="form.description" required></textarea>
                </div>
                <div class="form-group">
                    <label>Дедлайн:</label>
                    <input type="date" v-model="form.deadline" :min="minDate" srequired>
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
                deadline: '',
                isImportant: false
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
        <div class="modal-content">
            <h3>Причина возврата</h3>
            <div class="form-group">
                <input v-model="reason" placeholder="Укажите причину возврата" required>
            </div>
            <button class="btn-primary" @click="confirm">Подтвердить</button>
            <button class="btn-secondary" @click="$emit('close')">Отмена</button>
        </div>
    </div>
`,
    data() {
        return {
            reason: ''
        }
    },
    methods: {
        confirm() {
            if (!this.reason.trim()) {
                alert('Пожалуйста, укажите причину возврата');
                return;
            }
            this.$emit('confirm', this.reason);
            this.$emit('close');
        }
    }
});


new Vue({
    el: '#app',
    data() {
        return {
            cards: [],
            selectedCard: null,
            showEditModal: false,
            showReturnModal: false,
            currentCard: null
        }
    },
    created() {
        this.loadCards();
    },
    computed: {
        plannedTasks() {
            return this.cards.filter(c => c.column === 1);
        },
        inProgressTasks() {
            return this.cards.filter(c => c.column === 2);
        },
        testingTasks() {
            return this.cards.filter(c => c.column === 3);
        },
        completedTasks() {
            return this.cards.filter(c => c.column === 4);
        }
    },
    methods: {
        openCreateModal() {
            this.selectedCard = null;
            this.showEditModal = true;
        },
        openEditModal(card) {
            this.selectedCard = card;
            this.showEditModal = true;
        },
        openReturnModal(card) {
            this.currentCard = card;
            this.showReturnModal = true;
        },
        closeModal() {
            this.showEditModal = false;
            this.showReturnModal = false;
            this.currentCard = null;
        },
        deleteCard(card) {
            if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
                const index = this.cards.findIndex(c => c.id === card.id);
                this.cards.splice(index, 1);
                this.saveCards();
            }
        },

        saveCard(updatedCard) {
            if (updatedCard.id) {
                const index = this.cards.findIndex(c => c.id === updatedCard.id);
                this.cards.splice(index, 1, {
                    ...updatedCard,
                    updatedAt: new Date().toLocaleString()
                });
            } else {
                this.cards.push({
                    ...updatedCard,
                    id: Date.now(),
                    column: 1,
                    createdAt: new Date().toLocaleString(),
                    isOverdue: false
                });
            }
            this.saveCards();
        },
        moveCard(card, targetColumn) {
            const newCard = { ...card };
            if (targetColumn === 4) {
                newCard.isOverdue = new Date(card.deadline) < new Date();
            }
            newCard.column = targetColumn;
            this.updateCard(newCard);
        },
        returnToWork(reason) {
            const newCard = { ...this.currentCard };

            if (!newCard.returnReasons) {
                newCard.returnReasons = [];
            }

            newCard.returnReasons.push({
                reason: reason,
                date: new Date().toLocaleString()
            });

            newCard.column = 2;
            this.updateCard(newCard);
        },
        updateCard(newCard) {
            const index = this.cards.findIndex(c => c.id === newCard.id);
            this.cards.splice(index, 1, {
                ...newCard,
                updatedAt: new Date().toLocaleString()
            });
            this.saveCards();
        },
        saveCards() {
            localStorage.setItem('kanban-cards', JSON.stringify(this.cards));
        },
        loadCards() {
            const savedCards = localStorage.getItem('kanban-cards');
            this.cards = savedCards ? JSON.parse(savedCards) : [];
        }
    }
});