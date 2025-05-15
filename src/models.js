const { v4: uuidv4 } = require('uuid');

// In-memory storage
const users = [];
const tasks = [];
const sessions = {};

// User model
class User {
  constructor(username, password, email) {
    this.id = uuidv4();
    this.username = username;
    this.password = password;
    this.email = email || '';
  }

  static create(userData) {
    const { username, password, email } = userData;
    const user = new User(username, password, email);
    users.push(user);
    return user;
  }

  static findAll() {
    return users;
  }

  static findById(id) {
    return users.find(user => user.id === id);
  }

  static findByUsername(username) {
    return users.find(user => user.username === username);
  }

  static update(id, userData) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;

    const user = users[index];
    const updatedUser = { ...user, ...userData };
    users[index] = updatedUser;
    return updatedUser;
  }

  static delete(id) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    return true;
  }
}

// Task model
class Task {
  constructor(title, description, userId) {
    this.id = uuidv4();
    this.title = title;
    this.description = description || '';
    this.completed = false;
    this.userId = userId;
  }

  static create(taskData) {
    const { title, description, userId } = taskData;
    const task = new Task(title, description, userId);
    tasks.push(task);
    return task;
  }

  static findAll() {
    return tasks;
  }

  static findById(id) {
    return tasks.find(task => task.id === id);
  }

  static update(id, taskData) {
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) return null;

    const task = tasks[index];
    const updatedTask = { ...task, ...taskData };
    tasks[index] = updatedTask;
    return updatedTask;
  }

  static delete(id) {
    const index = tasks.findIndex(task => task.id === id);
    if (index === -1) return false;

    tasks.splice(index, 1);
    return true;
  }
}

// Session management
class Session {
  static create(userId) {
    const token = uuidv4();
    sessions[token] = userId;
    return token;
  }

  static validate(token) {
    return sessions[token];
  }

  static delete(token) {
    if (sessions[token]) {
      delete sessions[token];
      return true;
    }
    return false;
  }
}

// Add a default admin user
User.create({
  username: 'admin',
  password: 'admin123',
  email: 'admin@example.com'
});

module.exports = {
  User,
  Task,
  Session
};
