const express = require('express');
const soap = require('soap');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const taskService = require('./service');

// Create Express server
const app = express();
const PORT = 8000;

// Middleware
app.use(bodyParser.raw({ type: function() { return true; }, limit: '5mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Service is running');
});

// WSDL file path
const wsdlPath = path.join(__dirname, '..', 'wsdl', 'taskService.wsdl');

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // Create SOAP server
  const xml = fs.readFileSync(wsdlPath, 'utf8');
  soap.listen(server, '/task-service', taskService, xml, () => {
    console.log(`SOAP service is available at http://localhost:${PORT}/task-service?wsdl`);
  });
});

module.exports = server;
