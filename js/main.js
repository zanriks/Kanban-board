Vue.component('note-card', {
    data() {
        return {
        }
    },
    template: `
    `,
    methods: {
    }
})

Vue.component('kanban-column', {
    props: ['column'],
    data() {
        return {
        }
    },
    template: `
        <div class="column">
            <h3>{{ column.title }}</h3>
        </div>
    `,
    methods: {
    }
})

Vue.component('kanban-board', {
    template: `
        <div class="board">
            <kanban-column
                v-for="col in columns"
                :key="col.id"
                :column="col">
            </kanban-column>
        </div>
    `,
    data() {
        return {
            tasks: [],
            columns: [
                {id: 1, title: 'Запланированные задачи'},
                {id: 2, title: 'Задачи в работе'},
                {id: 3, title: 'Тестирование'},
                {id: 4, title: 'Выполненные задачи'}
            ]
        }
    },
    methods: {
        getTasksByColumn(id) {
            return this.tasks.filter(t => t.columnId === id)
        }
    },
})

let app = new Vue({
    el: "#app"
})
