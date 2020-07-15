
class Dice {
	constructor(faces=6) {
		this.faces = faces;
	}

	roll = () => {
		return Math.ceil((Math.random() * (250 - 50) + 50)) % this.faces;
	}

	printFaces() {
		console.log("There are " + this.faces + " faces");
	}
}

d = new Dice(7);
console.log(d.roll());
console.log(d.roll());
console.log(d.roll());
