document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskForm = document.getElementById('add-task-form');
    const taskList = document.getElementById('task-list');
    const completedList = document.getElementById('completed-list');
    const completedTitle = document.getElementById('completed-title');
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        completedList.innerHTML = '';

        const uncompletedTasks = tasks.filter(task => !task.completed);
        const completedTasks = tasks.filter(task => task.completed);

        uncompletedTasks.sort((a, b) => a.id - b.id).forEach(task => {
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);
        });

        if (completedTasks.length > 0) {
            completedTitle.classList.remove('hidden');
            completedTasks.sort((a, b) => b.completedTimestamp - a.completedTimestamp).forEach(task => {
                const taskItem = createTaskElement(task);
                completedList.appendChild(taskItem);
            });
        } else {
            completedTitle.classList.add('hidden');
        }
    };

    const createTaskElement = (task) => {
        const li = document.createElement('li');
        li.dataset.id = task.id;
        li.className = task.completed ? 'completed' : '';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

        const text = document.createElement('span');
        text.textContent = task.text;
        text.addEventListener('click', () => editTask(li, text, task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(text);
        li.appendChild(deleteBtn);

        return li;
    };

    const parseTaskInput = (text) => {
        let taskText = text;
        let dueDate = null;

        const tomorrowRegex = /mañana/i;
        const todayRegex = /hoy/i;

        if (tomorrowRegex.test(taskText)) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dueDate = tomorrow.toISOString().split('T')[0];
            taskText = taskText.replace(tomorrowRegex, '').trim();
        }
        else if (todayRegex.test(taskText)) {
            dueDate = new Date().toISOString().split('T')[0];
            taskText = taskText.replace(todayRegex, '').trim();
        }

        // Simple tag parsing
        const tagRegex = /#(\w+)/;
        const match = taskText.match(tagRegex);
        if (match) {
            // In a real app, you'd use this tag. For now, we just remove it.
            taskText = taskText.replace(tagRegex, '').trim();
        }

        return { text: taskText, dueDate };
    }

    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rawText = taskInput.value.trim();
        if (rawText === '') return;

        const { text, dueDate } = parseTaskInput(rawText);

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            dueDate: dueDate,
            list: 'inbox' // Default list
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
    });

    const toggleTaskCompletion = (id) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            if (task.completed) {
                task.completedTimestamp = Date.now();
            } else {
                delete task.completedTimestamp;
            }
            saveTasks();
            // Animate before re-rendering
            const taskElement = document.querySelector(`li[data-id='${id}']`);
            taskElement.classList.add('fading-out');
            setTimeout(() => {
                renderTasks();
            }, 300);
        }
    };

    const deleteTask = (id) => {
        const taskElement = document.querySelector(`li[data-id='${id}']`);
        taskElement.classList.add('fading-out');
        setTimeout(() => {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }, 300);
    };

    const editTask = (li, textElement, id) => {
        const currentText = textElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';

        li.replaceChild(input, textElement);
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText) {
                const task = tasks.find(t => t.id === id);
                task.text = newText;
                saveTasks();
                textElement.textContent = newText;
            }
            li.replaceChild(textElement, input);
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        });
    };

    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        mainContent.classList.toggle('sidebar-open');
    });

    mainContent.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            mainContent.classList.remove('sidebar-open');
        }
    });

    renderTasks();
});