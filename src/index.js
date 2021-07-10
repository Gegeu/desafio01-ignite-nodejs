const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    return response.status(404).json({ error: "User not found"});
  }

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  }
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { todos } = users.find(user => user.username === username);

  return response.json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { title, deadline } =  request.body;

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  const index = users.findIndex(u => u.username === username);
  users[index].todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const { todos } = users.find(user => user.username === username);
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if(todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!"} );
  }

  todos[todoIndex].title = title;
  todos[todoIndex].deadline = deadline;

  return response.json(todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } =  request.headers;

  const { todos } = users.find(user => user.username === username);
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if(todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!"} );
  }

  todos[todoIndex].done = true;
  
  return response.json(todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const { todos } = users.find(user => user.username === username);
  const userIndex = users.findIndex(user => user.username === username);
  const todoIndex = todos.findIndex(todo => todo.id === id);
  
  if(todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!"} );
  }

  users[userIndex].todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;