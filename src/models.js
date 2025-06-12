const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

// JWT secret - in production this should come from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory storage
const users = [];
const tasks = [];
const sessions = {};

// Counters for integer IDs to match REST API
let userIdCounter = 1;
let taskIdCounter = 1;

// User model
class User {
  constructor(username, password, email) {
    this.id = userIdCounter++;
    this.username = username;
    this.password = password;
    this.email = email || '';
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
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
    const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
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
    this.id = taskIdCounter++;
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
  static create(userId, username) {
    // Create JWT token similar to REST API
    const token = jwt.sign(
      { id: userId, email: username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Store token in blacklist check (for logout functionality)
    sessions[token] = { userId, username, createdAt: new Date() };
    return token;
  }

  static validate(token) {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Check if token is not blacklisted (logged out)
      if (!sessions[token]) {
        return null;
      }
      
      return decoded.id;
    } catch (error) {
      return null;
    }
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
