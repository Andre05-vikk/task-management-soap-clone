const soap = require('soap');
const assert = require('assert');

const url = 'http://localhost:8000/task-service?wsdl';

// Test suite for the SOAP service
async function runTests() {
  try {
    console.log('Creating SOAP client...');
    const client = await soap.createClientAsync(url);

    // Test variables
    let token;
    let userId;
    let taskId;

    console.log('\n--- Running Tests ---');

    // Test 1: Login
    console.log('\nTest 1: Login');
    try {
      const loginResult = await client.LoginAsync({
        username: 'admin',
        password: 'admin123'
      });
      token = loginResult[0].token;
      assert(token, 'Login should return a token');
      console.log('✅ Login test passed');
    } catch (error) {
      console.error('❌ Login test failed:', error);
      process.exit(1);
    }

    // Test 2: Create User
    console.log('\nTest 2: Create User');
    try {
      const username = `testuser_${Date.now()}`;
      const createUserResult = await client.CreateUserAsync({
        user: {
          username: username,
          password: 'password123',
          email: 'test@example.com'
        }
      });
      userId = createUserResult[0].user.id;
      assert(userId, 'Create user should return a user with ID');
      assert.strictEqual(createUserResult[0].user.username, username, 'Username should match');
      console.log('✅ Create User test passed');
    } catch (error) {
      console.error('❌ Create User test failed:', error);
      process.exit(1);
    }

    // Test 3: Get Users
    console.log('\nTest 3: Get Users');
    try {
      const getUsersResult = await client.GetUsersAsync({
        token: token
      });
      assert(Array.isArray(getUsersResult[0].users.user), 'Get users should return an array');
      assert(getUsersResult[0].users.user.length > 0, 'Users array should not be empty');
      console.log('✅ Get Users test passed');
    } catch (error) {
      console.error('❌ Get Users test failed:', error);
      process.exit(1);
    }

    // Test 4: Get User
    console.log('\nTest 4: Get User');
    try {
      const getUserResult = await client.GetUserAsync({
        userId: userId,
        token: token
      });
      assert.strictEqual(getUserResult[0].user.id, userId, 'User ID should match');
      console.log('✅ Get User test passed');
    } catch (error) {
      console.error('❌ Get User test failed:', error);
      process.exit(1);
    }

    // Test 5: Update User
    console.log('\nTest 5: Update User');
    try {
      const newEmail = 'updated@example.com';
      const updateUserResult = await client.UpdateUserAsync({
        userId: userId,
        user: {
          username: 'updateduser',
          email: newEmail,
          password: 'newpassword123'
        },
        token: token
      });
      assert.strictEqual(updateUserResult[0].user.email, newEmail, 'Email should be updated');
      console.log('✅ Update User test passed');
    } catch (error) {
      console.error('❌ Update User test failed:', error);
      process.exit(1);
    }

    // Test 6: Create Task
    console.log('\nTest 6: Create Task');
    try {
      const createTaskResult = await client.CreateTaskAsync({
        task: {
          title: 'Test Task',
          description: 'This is a test task'
        },
        token: token
      });
      taskId = createTaskResult[0].task.id;
      assert(taskId, 'Create task should return a task with ID');
      assert.strictEqual(createTaskResult[0].task.title, 'Test Task', 'Task title should match');
      console.log('✅ Create Task test passed');
    } catch (error) {
      console.error('❌ Create Task test failed:', error);
      process.exit(1);
    }

    // Test 7: Get Tasks
    console.log('\nTest 7: Get Tasks');
    try {
      const getTasksResult = await client.GetTasksAsync({
        token: token
      });
      assert(Array.isArray(getTasksResult[0].tasks.task), 'Get tasks should return an array');
      assert(getTasksResult[0].tasks.task.length > 0, 'Tasks array should not be empty');
      console.log('✅ Get Tasks test passed');
    } catch (error) {
      console.error('❌ Get Tasks test failed:', error);
      process.exit(1);
    }

    // Test 8: Update Task
    console.log('\nTest 8: Update Task');
    try {
      const updateTaskResult = await client.UpdateTaskAsync({
        taskId: taskId,
        task: {
          title: 'Updated Task',
          description: 'This task has been updated',
          completed: true
        },
        token: token
      });
      assert.strictEqual(updateTaskResult[0].task.title, 'Updated Task', 'Task title should be updated');
      assert.strictEqual(updateTaskResult[0].task.completed, true, 'Task should be marked as completed');
      console.log('✅ Update Task test passed');
    } catch (error) {
      console.error('❌ Update Task test failed:', error);
      process.exit(1);
    }

    // Test 9: Delete Task
    console.log('\nTest 9: Delete Task');
    try {
      const deleteTaskResult = await client.DeleteTaskAsync({
        taskId: taskId,
        token: token
      });
      assert.strictEqual(deleteTaskResult[0].success, true, 'Delete task should return success');
      console.log('✅ Delete Task test passed');
    } catch (error) {
      console.error('❌ Delete Task test failed:', error);
      process.exit(1);
    }

    // Test 10: Delete User
    console.log('\nTest 10: Delete User');
    try {
      const deleteUserResult = await client.DeleteUserAsync({
        userId: userId,
        token: token
      });
      assert.strictEqual(deleteUserResult[0].success, true, 'Delete user should return success');
      console.log('✅ Delete User test passed');
    } catch (error) {
      console.error('❌ Delete User test failed:', error);
      process.exit(1);
    }

    // Test 11: Logout
    console.log('\nTest 11: Logout');
    try {
      const logoutResult = await client.LogoutAsync({
        token: token
      });
      assert.strictEqual(logoutResult[0].success, true, 'Logout should return success');
      console.log('✅ Logout test passed');
    } catch (error) {
      console.error('❌ Logout test failed:', error);
      process.exit(1);
    }

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('Error running tests:', error);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
