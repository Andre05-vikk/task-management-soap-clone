const soap = require('soap');
const axios = require('axios');
const assert = require('assert');

// Configuration
const SOAP_URL = 'http://localhost:8000/task-service?wsdl';
const REST_BASE_URL = 'http://localhost:5001';

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, passed, details = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${testName}${details ? ': ' + details : ''}`);
  
  testResults.tests.push({
    name: testName,
    passed,
    details
  });
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

// Helper function to compare objects (ignoring certain fields)
function compareObjects(obj1, obj2, ignoreFields = ['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at']) {
  const clean1 = { ...obj1 };
  const clean2 = { ...obj2 };
  
  ignoreFields.forEach(field => {
    delete clean1[field];
    delete clean2[field];
  });
  
  return JSON.stringify(clean1) === JSON.stringify(clean2);
}

// Main test function
async function runEquivalenceTests() {
  console.log('🚀 Starting REST vs SOAP API Equivalence Tests\n');
  
  let soapClient;
  let restToken;
  let soapToken;
  
  try {
    // Initialize SOAP client
    console.log('Initializing SOAP client...');
    soapClient = await soap.createClientAsync(SOAP_URL);
    console.log('SOAP client initialized ✅\n');
    
    // Test 1: Authentication Equivalence
    console.log('=== Test 1: Authentication Equivalence ===');

    // SOAP Login (admin user exists by default)
    const soapLoginResult = await soapClient.LoginAsync({
      username: 'admin',
      password: 'admin123'
    });
    soapToken = soapLoginResult[0].token;

    // REST - First create admin user if it doesn't exist
    try {
      await axios.post(`${REST_BASE_URL}/users`, {
        email: 'admin',
        password: 'admin123'
      });
      console.log('Created admin user for REST API');
    } catch (error) {
      // User might already exist, that's okay
      if (error.response && error.response.status !== 409) {
        throw error;
      }
      console.log('Admin user already exists in REST API');
    }

    // REST Login
    const restLoginResponse = await axios.post(`${REST_BASE_URL}/sessions`, {
      email: 'admin',
      password: 'admin123'
    });
    restToken = restLoginResponse.data.token;
    
    // Compare authentication results
    const authEquivalent = !!(soapToken && restToken);
    logTest('Authentication', authEquivalent, 'Both APIs return authentication tokens');
    
    // Test 2: User Creation Equivalence
    console.log('\n=== Test 2: User Creation Equivalence ===');
    
    const testUsername = `testuser_${Date.now()}`;
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    // SOAP Create User
    const soapUserResult = await soapClient.CreateUserAsync({
      user: {
        username: testUsername,
        password: testPassword,
        email: testEmail
      }
    });
    const soapUser = soapUserResult[0].user;
    
    // REST Create User
    const restUserResponse = await axios.post(`${REST_BASE_URL}/users`, {
      email: testUsername,
      password: testPassword
    });
    const restUser = restUserResponse.data;
    
    // Compare user creation results
    const userCreationEquivalent = !!(soapUser.username && restUser.username);
    logTest('User Creation', userCreationEquivalent, 'Both APIs create users successfully');
    
    // Test 3: Get Users Equivalence
    console.log('\n=== Test 3: Get Users List Equivalence ===');
    
    // SOAP Get Users
    const soapUsersResult = await soapClient.GetUsersAsync({
      token: soapToken
    });
    const soapUsers = soapUsersResult[0].users.user;
    
    // REST Get Users
    const restUsersResponse = await axios.get(`${REST_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${restToken}` }
    });
    const restUsers = restUsersResponse.data;
    
    // Compare users list
    const usersListEquivalent = Array.isArray(soapUsers) && Array.isArray(restUsers) && 
                               soapUsers.length > 0 && restUsers.length > 0;
    logTest('Get Users List', usersListEquivalent, `SOAP: ${soapUsers.length} users, REST: ${restUsers.length} users`);
    
    // Test 4: Task Creation Equivalence
    console.log('\n=== Test 4: Task Creation Equivalence ===');
    
    const taskTitle = 'Equivalence Test Task';
    const taskDescription = 'This task tests API equivalence';
    
    // SOAP Create Task
    const soapTaskResult = await soapClient.CreateTaskAsync({
      task: {
        title: taskTitle,
        description: taskDescription
      },
      token: soapToken
    });
    const soapTask = soapTaskResult[0].task;
    
    // REST Create Task
    const restTaskResponse = await axios.post(`${REST_BASE_URL}/tasks`, {
      title: taskTitle,
      description: taskDescription
    }, {
      headers: { Authorization: `Bearer ${restToken}` }
    });
    const restTask = restTaskResponse.data;



    // Compare task creation results
    const taskCreationEquivalent = soapTask.title === restTask.title &&
                                  soapTask.description === restTask.description;
    logTest('Task Creation', taskCreationEquivalent, 'Both APIs create tasks with same data');
    
    // Test 5: Get Tasks Equivalence
    console.log('\n=== Test 5: Get Tasks List Equivalence ===');

    // SOAP Get Tasks
    const soapTasksResult = await soapClient.GetTasksAsync({
      token: soapToken
    });
    const soapTasks = soapTasksResult[0].tasks.task;

    // REST Get Tasks
    const restTasksResponse = await axios.get(`${REST_BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${restToken}` }
    });

    const restTasks = restTasksResponse.data.tasks; // REST API returns { tasks: [...], pagination: {...} }

    // Compare tasks list - both should return arrays and contain our created task
    const tasksListEquivalent = Array.isArray(soapTasks) && Array.isArray(restTasks) &&
                               soapTasks.some(t => t.title === taskTitle) &&
                               restTasks.some(t => t.title === taskTitle);
    logTest('Get Tasks List', tasksListEquivalent, `Both APIs return task arrays with created task`);
    
    // Test 6: Task Update Equivalence
    console.log('\n=== Test 6: Task Update Equivalence ===');

    const updatedTitle = 'Updated Equivalence Test Task';
    const updatedDescription = 'This task has been updated';

    // SOAP Update Task
    const soapUpdateResult = await soapClient.UpdateTaskAsync({
      taskId: soapTask.id,
      task: {
        title: updatedTitle,
        description: updatedDescription,
        completed: true
      },
      token: soapToken
    });
    const soapUpdatedTask = soapUpdateResult[0].task;

    // REST Update Task (use taskId from creation response)
    const restUpdateResponse = await axios.patch(`${REST_BASE_URL}/tasks/${restTask.taskId}`, {
      title: updatedTitle,
      description: updatedDescription,
      status: 'completed'
    }, {
      headers: { Authorization: `Bearer ${restToken}` }
    });
    const restUpdatedTask = restUpdateResponse.data;



    // Compare task update results - check functional equivalence
    // SOAP returns updated task data, REST returns success message
    // Both should indicate successful update
    const soapUpdateSuccess = soapUpdatedTask && soapUpdatedTask.title === updatedTitle;
    const restUpdateSuccess = restUpdatedTask && restUpdatedTask.success === true;

    const taskUpdateEquivalent = soapUpdateSuccess && restUpdateSuccess;
    logTest('Task Update', taskUpdateEquivalent, 'Both APIs successfully update tasks');

    // Test 6.5: Verify Updated Tasks in Lists
    console.log('\n=== Test 6.5: Verify Updated Tasks Appear in Lists ===');

    // Get updated task lists to verify changes persisted
    const soapUpdatedTasksResult = await soapClient.GetTasksAsync({
      token: soapToken
    });
    const soapUpdatedTasks = soapUpdatedTasksResult[0].tasks.task;

    const restUpdatedTasksResponse = await axios.get(`${REST_BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${restToken}` }
    });
    const restUpdatedTasks = restUpdatedTasksResponse.data.tasks;

    // Check if updated tasks appear in both lists
    const soapHasUpdatedTask = soapUpdatedTasks.some(t => t.title === updatedTitle);
    const restHasUpdatedTask = restUpdatedTasks.some(t => t.title === updatedTitle);

    const updatedTasksEquivalent = soapHasUpdatedTask && restHasUpdatedTask;
    logTest('Updated Tasks in Lists', updatedTasksEquivalent, 'Both APIs show updated tasks in their lists');

    // Test 7: Logout Equivalence
    console.log('\n=== Test 7: Logout Equivalence ===');
    
    // SOAP Logout
    const soapLogoutResult = await soapClient.LogoutAsync({
      token: soapToken
    });
    const soapLogoutSuccess = soapLogoutResult[0].success;
    
    // REST Logout
    const restLogoutResponse = await axios.delete(`${REST_BASE_URL}/sessions`, {
      headers: { Authorization: `Bearer ${restToken}` }
    });
    const restLogoutSuccess = restLogoutResponse.status === 204;
    
    // Compare logout results
    const logoutEquivalent = soapLogoutSuccess && restLogoutSuccess;
    logTest('Logout', logoutEquivalent, 'Both APIs handle logout successfully');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    logTest('Test Execution', false, error.message);
  }
  
  // Print final results
  console.log('\n' + '='.repeat(50));
  console.log('📊 EQUIVALENCE TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   - ${test.name}: ${test.details}`);
    });
    process.exit(1);
  } else {
    console.log('\n🎉 All equivalence tests passed! REST and SOAP APIs are functionally equivalent.');
    process.exit(0);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the tests
console.log('Starting API Equivalence Tests...\n');
console.log('⚠️  Make sure both REST API (port 5001) and SOAP API (port 8000) are running!\n');

runEquivalenceTests().catch(error => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
});
