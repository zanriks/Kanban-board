Vue.component('note-card', {
    props: ['task', 'showMove', 'columnId'],
    data() {
        return {
            isReturning: false,
            returnReason: '',
            isEditing: false,
            editData: { ...this.task }
        }
    },
    template: `
    <div class="card" :class="{'expired': status === 'Просрочено', 'on-time': status === 'Выполнено в срок'}">
            <div v-if="!isEditing && !isReturning">
                <p><small>Создано: {{ task.createdAt }}</small></p>
                <p v-if="task.lastEdit"><small>Изм: {{ task.lastEdit }}</small></p>

                <h4 :style="columnId === 4 ? 'text-decoration: line-through' : ''">{{ task.title }}</h4>

                <!-- Отображение статуса в 4 столбце -->
                <p v-if="status" class="status-badge">
                    <strong>Статус: {{ status }}</strong>
                </p>

                <p>{{ task.description }}</p>
                <p v-if="task.returnReason" class="reason"><b>Причина возврата:</b> {{ task.returnReason }}</p>
                <p><b>Срок:</b> {{ task.deadline }}</p>

                <div v-if="columnId !== 4">
                    <button @click="isEditing = true">Редактировать</button>
                    <button @click="$emit('remove')">Удалить</button>

                    <template v-if="columnId === 3">
                        <button @click="$emit('move')">Выполнено</button>
                        <button @click="isReturning = true">Вернуть в работу</button>
                    </template>

                    <button v-if="columnId < 3" @click="$emit('move')">
                        {{ columnId === 1 ? 'В работу' : 'В тестирование' }}
                    </button>
                </div>
            </div>

            <div v-else-if="isEditing">
                <input v-model="editData.title">
                <textarea v-model="editData.description"></textarea>
                <input type="date" v-model="editData.deadline">
                <button @click="save">Сохранить</button>
                <button @click="isEditing = false">Отмена</button>
            </div>

            <div v-else-if="isReturning">
                <textarea v-model="returnReason" placeholder="Укажите причину возврата"></textarea>
                <button @click="confirmReturn">Подтвердить возврат</button>
                <button @click="isReturning = false">Отмена</button>
            </div>
        </div>
    `,
    methods: {
        save() {
            this.$emit('edit', { ...this.editData })
            this.isEditing = false
        },
        confirmReturn() {
            if (this.returnReason.trim()) {
                this.$emit('return-task', { id: this.task.id, reason: this.returnReason })
                this.isReturning = false
                this.returnReason = ''
                this.task.columnId = 2
            } else {
                alert("Пожалуйста, укажите причину")
            }
        }
    },
    computed: {
        status() {
            if (this.columnId !== 4) return null

            const now = new Date()
            const deadline = new Date(this.task.deadline)

            deadline.setHours(23, 59, 59)

            return now > deadline ? 'Просрочено' : 'Выполнено в срок'
        }
    }
})

Vue.component('kanban-column', {
    props: ['column', 'tasks'],
    data() {
        return {
            newTitle: '',
            newDesc: '',
            newDeadline: ''
        }
    },
    template: `
        <div class="column">
            <h3>{{ column.title }}</h3>

            <div v-if="column.id === 1" class="add-form">
                <input v-model="newTitle" placeholder="Заголовок">
                <textarea v-model="newDesc" placeholder="Описание"></textarea>
                <input type="date" v-model="newDeadline">
                <button @click="submitTask">Добавить</button>
            </div>

            <note-card
                v-for="task in tasks"
                :key="task.id"
                :task="task"
                :column-id="column.id"
                :show-move="column.id === 1 || column.id === 2"
                @return-task="$emit('return-task', $event)"
                @remove="$emit('remove-task', task.id)"
                @edit="$emit('edit-task', $event)"
                @move="$emit('move-task', task.id)">
            </note-card>
        </div>
    `,
    methods: {
        submitTask() {
            if(this.newTitle) {
                this.$emit('add-task', { title: this.newTitle, description: this.newDesc, deadline: this.newDeadline })
                this.newTitle = ''; this.newDesc = ''; this.newDeadline = ''
            }
        }
    }
})

Vue.component('kanban-board', {
    template: `
        <div class="board">
            <kanban-column
                v-for="col in columns"
                :key="col.id"
                :column="col"
                :tasks="getTasksByColumn(col.id)"
                @add-task="addTask"
                @remove-task="removeTask"
                @edit-task="editTask"
                @move-task="moveTask">
                @return-task="returnTask"
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
        },
        addTask(taskData) {
            const newTask = {
                ...taskData,
                id: Date.now(),
                columnId: 1,
                createdAt: new Date().toLocaleString(),
                lastEdit: null
            }
            this.tasks.push(newTask)
            this.saveToStorage()
        },
        removeTask(id) {
            this.tasks = this.tasks.filter(t => t.id !== id)
        },
        editTask(updatedTask) {
            const index = this.tasks.findIndex(t => t.id === updatedTask.id)
            if (index !== -1) {
                this.tasks.splice(index, 1, {
                    ...this.tasks[index],
                    ...updatedTask,
                    lastEdit: new Date().toLocaleString()
                })
            }
            this.saveToStorage()
        },
        returnTask({ id, reason }) {
            const task = this.tasks.find(t => t.id === id)
            if (task && task.columnId === 3) {
                task.columnId = 2
                task.returnReason = reason
                task.lastEdit = new Date().toLocaleString()
            }
        },
        moveTask(id) {
            const task = this.tasks.find(t => t.id === id)
            if (task && task.columnId < 4) {
                task.columnId++
                task.lastEdit = new Date().toLocaleString()
                if (task.columnId === 4) task.returnReason = null
            }
        },

        loadFromStorage() {
            const saved = localStorage.getItem('kanban_board')
            if (saved) {
                try {
                    this.tasks = JSON.parse(saved)
                } catch (e) {
                    console.error('Ошибка загрузки:', e)
                    this.tasks = []
                }
            }
        },
        saveToStorage() {
            localStorage.setItem('kanban_board', JSON.stringify(this.tasks));
        }
    },
    watch: {
        tasks: {
            handler() {
                this.saveToStorage()
            },
            deep: true
        }
    },
    created() {
        this.loadFromStorage()
    }
})

let app = new Vue({
    el: "#app"
})
