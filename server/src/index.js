require('dotenv').config();
const app = require('./app');

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => {
  console.log(`Snake server listening on http://localhost:${port}`);
});
