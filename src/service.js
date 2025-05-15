const { User, Task } = require('./models');
const AuthService = require('./auth');

// SOAP Service implementation
const taskService = {
  TaskService: {
    TaskServicePort: {
      // Authentication operations
      Login: function(args) {
        try {
          const { username, password } = args;
          const token = AuthService.login(username, password);
          return { token };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Sender',
                Subcode: { value: 'AuthenticationError' }
              },
              Reason: { Text: error.message },
              statusCode: 401
            }
          };
        }
      },
      
      Logout: function(args) {
        try {
          const { token } = args;
          const success = AuthService.logout(token);
          return { success };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Sender',
                Subcode: { value: 'AuthenticationError' }
              },
              Reason: { Text: error.message },
              statusCode: 401
            }
          };
        }
      },
      
      // User operations
      CreateUser: function(args) {
        try {
          const { user } = args;
          
          // Check if username already exists
          const existingUser = User.findByUsername(user.username);
          if (existingUser) {
            throw new Error('Username already exists');
          }
          
          const newUser = User.create({
            username: user.username,
            password: user.password,
            email: user.email
          });
          
          // Don't return password in response
          const userResponse = { ...newUser };
          delete userResponse.password;
          
          return { user: userResponse };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Sender',
                Subcode: { value: 'ValidationError' }
              },
              Reason: { Text: error.message },
              statusCode: 400
            }
          };
        }
      },
      
      GetUsers: function(args) {
        try {
          const { token } = args;
          
          // Authenticate user
          AuthService.authenticate(token);
          
          const allUsers = User.findAll();
          
          // Don't return passwords in response
          const users = allUsers.map(user => {
            const userWithoutPassword = { ...user };
            delete userWithoutPassword.password;
            return userWithoutPassword;
          });
          
          return { users: { user: users } };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Sender',
                Subcode: { value: 'AuthenticationError' }
              },
              Reason: { Text: error.message },
              statusCode: 401
            }
          };
        }
      },
      
      GetUser: function(args) {
        try {
          const { userId, token } = args;
          
          // Authenticate user
          AuthService.authenticate(token);
          
          const user = User.findById(userId);
          if (!user) {
            throw new Error('User not found');
          }
          
          // Don't return password in response
          const userResponse = { ...user };
          delete userResponse.password;
          
          return { user: userResponse };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Sender',
                Subcode: { value: error.message === 'User not found' ? 'NotFoundError' : 'AuthenticationError' }
              },
              Reason: { Text: error.message },
              statusCode: error.message === 'User not found' ? 404 : 401
            }
          };
        }
      },
      
      UpdateUser: function(args) {
        try {
          const { userId, user, token } = args;
          
          // Authenticate user
          const authenticatedUser = AuthService.authenticate(token);
          
          // Only allow users to update their own profile or admin
          if (authenticatedUser.id !== userId && authenticatedUser.username !== 'admin') {
            throw new Error('Unauthorized to update this user');
          }
          
          const updatedUser = User.update(userId, {
            username: user.username,
            email: user.email,
            password: user.password
          });
          
          if (!updatedUser) {
            throw new Error('User not found');
          }
          
          // Don't return password in response
          const userResponse = { ...updatedUser };
          delete userResponse.password;
          
          return { user: userResponse };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Sender',
                Subcode: { value: error.message === 'User not found' ? 'NotFoundError' : 'AuthenticationError' }
              },
              Reason: { Text: error.message },
              statusCode: error.message === 'User not found' ? 404 : 401
            }
          };
        }
      },
      
      DeleteUser: function(args) {
        try {
          const { userId, token } = args;
          
          // Authenticate user
          const authenticatedUser = AuthService.authenticate(token);
          
          // Only allow users to delete their own profile or admin
          if (authenticatedUser.id !== userId && authenticatedUser.username !== 'admin') {
            throw new Error('Unauthorized to delete this user');
          }
          
          const success = User.delete(userId);
          if (!success) {
            throw new Error('User not found');
          }
          
          return { success };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Sender',
                Subcode: { value: error.message === 'User not found' ? 'NotFoundError' : 'AuthenticationError' }
              },
              Reason: { Text: error.message },
              statusCode: error.message === 'User not found' ? 404 : 401
            }
          };
        }
      },
      
      // Task operations
      CreateTask: function(args) {
        try {
          const { task, token } = args;
          
          // Authenticate user
          const user = AuthService.authenticate(token);
          
          const newTask = Task.create({
            title: task.title,
            description: task.description,
            userId: user.id
          });
          
          return { task: newTask };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Sender',
                Subcode: { value: 'AuthenticationError' }
              },
              Reason: { Text: error.message },
              statusCode: 401
            }
          };
        }
      },
      
      GetTasks: function(args) {
        try {
          const { token } = args;
          
          // Authenticate user
          const user = AuthService.authenticate(token);
          
          // Admin can see all tasks, regular users only see their own
          let allTasks;
          if (user.username === 'admin') {
            allTasks = Task.findAll();
          } else {
            allTasks = Task.findAll().filter(task => task.userId === user.id);
          }
          
          return { tasks: { task: allTasks } };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Sender',
                Subcode: { value: 'AuthenticationError' }
              },
              Reason: { Text: error.message },
              statusCode: 401
            }
          };
        }
      },
      
      UpdateTask: function(args) {
        try {
          const { taskId, task, token } = args;
          
          // Authenticate user
          const user = AuthService.authenticate(token);
          
          // Find the task
          const existingTask = Task.findById(taskId);
          if (!existingTask) {
            throw new Error('Task not found');
          }
          
          // Only allow users to update their own tasks or admin
          if (existingTask.userId !== user.id && user.username !== 'admin') {
            throw new Error('Unauthorized to update this task');
          }
          
          const updatedTask = Task.update(taskId, {
            title: task.title,
            description: task.description,
            completed: task.completed
          });
          
          return { task: updatedTask };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Sender',
                Subcode: { value: error.message === 'Task not found' ? 'NotFoundError' : 'AuthenticationError' }
              },
              Reason: { Text: error.message },
              statusCode: error.message === 'Task not found' ? 404 : 401
            }
          };
        }
      },
      
      DeleteTask: function(args) {
        try {
          const { taskId, token } = args;
          
          // Authenticate user
          const user = AuthService.authenticate(token);
          
          // Find the task
          const existingTask = Task.findById(taskId);
          if (!existingTask) {
            throw new Error('Task not found');
          }
          
          // Only allow users to delete their own tasks or admin
          if (existingTask.userId !== user.id && user.username !== 'admin') {
            throw new Error('Unauthorized to delete this task');
          }
          
          const success = Task.delete(taskId);
          
          return { success };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Sender',
                Subcode: { value: error.message === 'Task not found' ? 'NotFoundError' : 'AuthenticationError' }
              },
              Reason: { Text: error.message },
              statusCode: error.message === 'Task not found' ? 404 : 401
            }
          };
        }
      }
    }
  }
};

module.exports = taskService;
