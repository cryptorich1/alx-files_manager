const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Load routes from routes/index.js
const routes = require('./routes');
app.use(routes);

app.listen(PORT, () => {
  console.log('Server is running on port ${PORT}`);
});
