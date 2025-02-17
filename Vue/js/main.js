Vue.component('note-card', {
    props: ['card'],
    template: `
        <div class="card" :style="{ backgroundColor: card.color }">
        <div class="cardHead">
            <input type="text" v-model="card.title" placeholder="Заголовок карточки" :style="{ color: card.titleColor }" />
            <label for="titleColorInput"></label>
            <input type="color" v-model="card.titleColor" @input="updateCard" />
        </div>
            <ul>
                <li v-for="(item, itemIndex) in card.items" :key="itemIndex">
                    <input type="checkbox" v-model="item.completed" @change="updateCard" class="custom-checkbox" />
                    <input type="text" v-model="item.text" placeholder="Пункт списка" :style="{ color: item.textColor }" />
                    <input type="color" v-model="item.textColor" @input="updateCard" />
                </li>
            </ul>
            <div class="nevCard">
                <input type="text" v-model="newItemText" placeholder="Новый пункт списка" />
                <button @click="addItem" :disabled="itemCount >= 5">+</button>
            </div>
            <div class="color-controls">
                <button @click="removeCard(card.id)">Удалить карточку</button>
                <label for="colorInput"></label>
                <input type="color" v-model="card.color" />
            </div>
            <p v-if="card.completedDate">Завершено: {{ card.completedDate }}</p>
        </div>
    `,
    data() {
        return {
            newItemText: '', // Переменная для хранения текста нового пункта
        };
    },
    computed: {
        itemCount() {
            return this.card.items.length; // Количество пунктов в карточке
        }
    },
    methods: {
        removeCard(cardId) {
            this.$emit('remove-card', cardId);
        },
        updateCard() {
            this.$emit('update-card', this.card);
        },
        addItem() {
            if (this.newItemText.trim() !== '' && this.itemCount < 5) {
                this.card.items.push({ text: this.newItemText, completed: false, textColor: '#000000' }); // Добавляем новый пункт с цветом текста по умолчанию
                this.newItemText = ''; // Очищаем поле ввода
                this.updateCard(); // Обновляем карточку
            }
        }
    }
});

Vue.component('note-column', {
    props: ['column'],
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <note-card
                v-for="(card, cardIndex) in column.cards"
                :key="card.id"
                :card="card"
                @remove-card="$emit('remove-card', $event)"
                @update-card="$emit('update-card', $event)"
            ></note-card>
            <button v-if="canAddCard(column)" @click="$emit('add-card', column)">Добавить карточку</button>
        </div>
    `,
    methods: {
        canAddCard(column) {
            if (column.title === 'Столбец 1' && column.cards.length >= 3) return false;
            if (column.title === 'Столбец 2' && column.cards.length >= 5) return false;
            return true;
        }
    }
});

Vue.component('note-app', {
    data() {
        return {
            columns: [
                { title: 'Столбец 1', cards: [] },
                { title: 'Столбец 2', cards: [] },
                { title: 'Столбец 3', cards: [] }
            ],
            nextCardId: 1
        };
    },
    created() {
        this.loadCards();
    },
    methods: {
        loadCards() {
            const savedData = JSON.parse(localStorage.getItem('cards'));
            if (savedData) {
                this.columns = savedData.columns;
                this.nextCardId = savedData.nextCardId;
            }
        },
        saveCards() {
            localStorage.setItem('cards', JSON.stringify({ columns: this.columns, nextCardId: this.nextCardId }));
        },
        addCard(column) {
            const newCard = {
                id: this.nextCardId++, // Увеличиваем ID для новой карточки
                title: `Карточка ${this.nextCardId}`, // Заголовок карточки
                titleColor: '#000000', // Цвет заголовка по умолчанию
                color: '#f9f9f9', // Цвет ф она по умолчанию
                items: [
                    { text: 'Пункт 1', completed: false, textColor: '#000000' },
                    { text: 'Пункт 2', completed: false, textColor: '#000000' },
                    { text: 'Пункт 3', completed: false, textColor: '#000000' }
                ],
                completedDate: null // Дата завершения по умолчанию
            };
            column.cards.push(newCard); // Добавляем новую карточку в колонку
            this.saveCards(); // Сохраняем изменения в localStorage
        },
        removeCard(cardId) {
            for (let column of this.columns) {
                const index = column.cards.findIndex(card => card.id === cardId); // Находим индекс карточки
                if (index !== -1) {
                    column.cards.splice(index, 1); // Удаляем карточку из колонки
                    this.saveCards(); // Сохраняем изменения в localStorage
                    break; // Выходим из цикла после удаления
                }
            }
        },
        updateCard(card) {
            const completedItems = card.items.filter(item => item.completed).length; // Считаем завершенные пункты
            const totalItems = card.items.length; // Общее количество пунктов

            if (totalItems > 0) {
                const completionRate = completedItems / totalItems; // Рассчитываем процент завершения

                if (completionRate > 0.5 && this.columns[0].cards.includes(card)) {
                    this.moveCard(card, 1); // Перемещение во второй столбец
                } else if (completionRate === 1 && this.columns[1].cards.includes(card)) {
                    this.moveCard(card, 2); // Перемещение в третий столбец
                    card.completedDate = new Date().toLocaleString(); // Установка даты завершения
                }
            }
            this.saveCards(); // Сохраняем изменения в localStorage
        },
        moveCard(card, targetColumnIndex) {
            for (let column of this.columns) {
                const index = column.cards.findIndex(c => c.id === card.id); // Находим индекс карточки
                if (index !== -1) {
                    column.cards.splice(index, 1); // Удаление из текущего столбца
                    this.columns[targetColumnIndex].cards.push(card); // Добавление в целевой столбец
                    break; // Выходим из цикла после перемещения
                }
            }
        }
    },
    template: `
        <div>
            <div class="columns">
                <note-column
                    v-for="(column, index) in columns"
                    :key="index"
                    :column="column"
                    @remove-card="removeCard"
                    @update-card="updateCard"
                    @add-card="addCard"
                ></note-column>
            </div>
        </div>
    `
});

// Создание экземпляра Vue приложения
new Vue({
    el: '#app' // Привязываем приложение к элементу с id "app"
});