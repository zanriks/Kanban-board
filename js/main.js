Vue.component('note-card', {
    template: `
        <div>
            <h3 >{{ card.title }}</h3>
            
            <div class="items-count"> 
                <span>
                    от 3-5 пунктов
                </span>
                <span>
                </span>
            </div>
            
            <div>
                <input>
                <span>
                    {{ item.text }}
                </span>
            </div>
            <div style="margin-top: 8px;">
                <input 
                    type="text"
                    placeholder="Add list item..." 
                />
                <button>+</button>
            </div>
            
            <div>
                Завершено:
            </div>
        </div>
    `,
    data() {
        return {

        }
    },
    computed: {
    },
    methods: {

    },
})

Vue.component('kanban-board',{
    template: `
        <div>{{ name }}</div>
    `,
    data() {
        return {
            name: "dawawdawd"
        }
    },
    methods: {
        addTask() {
            const newTask = {
                id: Date.now(),
                title: "Новая задача",
                column: 1
            }
        },
        loadFromStorage() {
            const saved = localStorage.getItem('notesAppData')
            if (saved) {
                try {
                    const data = JSON.parse(saved)
                    this.cards = data.cards
                } catch (e) {
                    console.error('Ошибка загрузки данных:', e)
                    this.cards = []
                }
            }
        },
        saveToStorage() {
            const data = {
                cards: this.cards
            }
            localStorage.setItem('notesAppData', JSON.stringify(data))
        }
    },
    watch: {
        cards: {
            handler() {
                this.saveToStorage()
            },
            deep: true
        }
    }
})

let app = new Vue({
    el: "#app"
})