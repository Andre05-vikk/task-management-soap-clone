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

// 404 handler - return JSON instead of HTML
app.use((req, res, next) => {
  if (req.path !== '/task-service' && !req.path.includes('wsdl')) {
    return res.status(404).json({
      code: 404,
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`
    });
  }
  next();
});

// Error handler - return JSON instead of HTML
app.use((err, req, res, next) => {
  console.error('SOAP API Error:', err);
  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
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
