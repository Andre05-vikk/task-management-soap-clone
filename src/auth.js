const { User, Session } = require('./models');

// Authentication service
class AuthService {
  static login(username, password) {
    const user = User.findByUsername(username);
    if (!user || user.password !== password) {
      throw new Error('Invalid username or password');
    }
    
    const token = Session.create(user.id);
    return token;
  }

  static logout(token) {
    return Session.delete(token);
  }

  static authenticate(token) {
    const userId = Session.validate(token);
    if (!userId) {
      throw new Error('Invalid or expired token');
    }
    
    const user = User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }
}

module.exports = AuthService;
