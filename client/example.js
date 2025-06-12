const soap = require('soap');
const url = 'http://localhost:8000/task-service?wsdl';

// Example client for the SOAP service
async function runExamples() {
  try {
    console.log('Creating SOAP client...');
    const client = await soap.createClientAsync(url);
    
    console.log('\n--- Authentication Examples ---');
    
    // Login example
    console.log('\nLogin with admin user:');
    const loginResult = await client.LoginAsync({
      username: 'admin',
      password: 'admin123'
    });
    console.log('Login response:', loginResult[0]);
    
    const token = loginResult[0].token;
    console.log('Token:', token);
    
    // User operations examples
    console.log('\n--- User Operations Examples ---');
    
    // Create user example
    console.log('\nCreating a new user:');
    const createUserResult = await client.CreateUserAsync({
      user: {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com'
      }
    });
    console.log('Create user response:', createUserResult[0]);
    
    // Get users example
    console.log('\nGetting all users:');
    const getUsersResult = await client.GetUsersAsync({
      token: token
    });
    console.log('Get users response:', getUsersResult[0]);
    
    // Get specific user example
    const userId = createUserResult[0].user.id;
    console.log('\nGetting user with ID:', userId);
    const getUserResult = await client.GetUserAsync({
      userId: userId,
      token: token
    });
    console.log('Get user response:', getUserResult[0]);
    
    // Update user example
    console.log('\nUpdating user:');
    const updateUserResult = await client.UpdateUserAsync({
      userId: userId,
      user: {
        username: 'updateduser',
        email: 'updated@example.com',
        password: 'newpassword123'
      },
      token: token
    });
    console.log('Update user response:', updateUserResult[0]);
    
    // Task operations examples
    console.log('\n--- Task Operations Examples ---');
    
    // Create task example
    console.log('\nCreating a new task:');
    const createTaskResult = await client.CreateTaskAsync({
      task: {
        title: 'Test Task',
        description: 'This is a test task'
      },
      token: token
    });
    console.log('Create task response:', createTaskResult[0]);
    
    const taskId = createTaskResult[0].task.taskId;
    
    // Get tasks example
    console.log('\nGetting all tasks:');
    const getTasksResult = await client.GetTasksAsync({
      token: token
    });
    console.log('Get tasks response:', getTasksResult[0]);
    
    // Update task example
    console.log('\nUpdating task:');
    const updateTaskResult = await client.UpdateTaskAsync({
      taskId: taskId,
      task: {
        title: 'Updated Task',
        description: 'This task has been updated',
        completed: true
      },
      token: token
    });
    console.log('Update task response:', updateTaskResult[0]);
    
    // Delete task example
    console.log('\nDeleting task:');
    const deleteTaskResult = await client.DeleteTaskAsync({
      taskId: taskId,
      token: token
    });
    console.log('Delete task response:', deleteTaskResult[0]);
    
    // Delete user example
    console.log('\nDeleting user:');
    const deleteUserResult = await client.DeleteUserAsync({
      userId: userId,
      token: token
    });
    console.log('Delete user response:', deleteUserResult[0]);
    
    // Logout example
    console.log('\nLogging out:');
    const logoutResult = await client.LogoutAsync({
      token: token
    });
    console.log('Logout response:', logoutResult[0]);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the examples
runExamples().catch(console.error);
