const express = require('express');
const cors = require('cors');
const path = require('node:path');
const recipeRoutes = require('./routes/recipe');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/api/recipes', recipeRoutes);

app.listen(PORT, () => {
  console.log(`Cooked API đang chạy tại http://localhost:${PORT}`);
});
