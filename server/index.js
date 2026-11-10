const express = require('express');
const cors = require('cors');
const recipeRoutes = require('./routes/recipe');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/recipes', recipeRoutes);

app.listen(PORT, () => {
  console.log(`Cooked API đang chạy tại http://localhost:${PORT}`);
});
