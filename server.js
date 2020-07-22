const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/dist'));

app.get('/', (req, res) => {
	// return index.html
	res.render('index');
});

app.listen(PORT, () => {
	console.log('Listening on port ', PORT, '...');
});
