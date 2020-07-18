const express = require('express');
const app = express();

app.use(express.static(__dirname + '/dist'));

app.get('/', (req, res) => {
	res.render('index');
});

app.listen(5000, () => {
	console.log('Listening on port 5000...');
});
