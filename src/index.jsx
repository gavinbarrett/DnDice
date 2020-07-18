import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';
import {DiceManager, DiceD4, DiceD6, DiceD8, DiceD10, DiceD12, DiceD20} from "./dice";

function DiceCanvas() {
	
	const radius = 2;
	// declare function variables
	let world, scene, camera, mount, renderer, dice = [];
	
	// create a reference to this object
	mount = useRef(null);
	
	let init = () => {
		// set up a new cannon world
		world = new CANNON.World();
		
		// set up the threejs-dice dice manager
		DiceManager.setWorld(world);
			
		// create a scene and camera object
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		
		// create and initialize the WebGL renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth/1.5, window.innerHeight/1.5);
	}

	let animate = () => {
		world.step(1.0 / 60.0);
		for (var i in dice)
			dice[i].updateMeshFromBody();
		renderer.render(scene, camera);
		requestAnimationFrame(animate);
	}

	let run = (val) => {
		
		let ambient = new THREE.AmbientLight('#ffffff', 0.3);
		scene.add(ambient);
	
	    let directionalLight = new THREE.DirectionalLight('#ffffff', 0.5);
    	directionalLight.position.x = -1000;
    	directionalLight.position.y = 1000;
    	directionalLight.position.z = 1000;
    	scene.add(directionalLight);

		let diceValues = [];
		let d = 0;
		
		if (val == 4) {
			d = new DiceD4({size: 1, backColor: '#ff0000'});
		} else if (val == 6) {
			d = new DiceD6({size: 1, backColor: '#ffff00'});
		} else if (val == 8) {
			d = new DiceD8({size: 1, backColor: '#ff00ff'});
		} else if (val == 10) {
			d = new DiceD10({size: 1, backColor: '#0000ff'});
		} else if (val == 12) {
			d = new DiceD12({size: 1, backColor: '#00ff00'});
		} else {
			d = new DiceD20({size: 1, backColor: '#ff00f0'});
		}

		diceValues.push({dice: d, value: val});

		// set the values
		DiceManager.prepareValues(diceValues);
		
		// add the object to the scene
		scene.add(d.getObject());
		dice.push(d);
		
		// add the scene to the react page
		mount.current.appendChild(renderer.domElement);
		
		d.updateBodyFromMesh()
		camera.position.z = 5;
		
		requestAnimationFrame(animate);
		
		animate();
	}

	useEffect(() => {
		// initialize necessary variables
		init();
		requestAnimationFrame(animate);
		// create the objects and animate them 
		run();	
	});

	let randomDiceThrow = () => {
        let diceValues = [];

        for (let i = 0; i < dice.length; i++) {
            let yRand = Math.random() * 20
            dice[i].getObject().position.x = -10 - (i % 3) * 1.2;
            dice[i].getObject().position.y = 2 + Math.floor(i / 3) * 1.2;
            dice[i].getObject().position.z = -2 + (i % 3) * 1.1;
            dice[i].getObject().quaternion.x = (Math.random()*90-45) * Math.PI / 180;
            dice[i].getObject().quaternion.z = (Math.random()*90-45) * Math.PI / 180;
            dice[i].updateBodyFromMesh();
            let rand = Math.random() * 5;
            dice[i].getObject().body.velocity.set(25 + rand, 40 + yRand, 15 + rand);
            dice[i].getObject().body.angularVelocity.set(20 * Math.random() -10, 20 * Math.random() -10, 20 * Math.random() -10);

            diceValues.push({dice: dice[i], value: i + 1});
        }

        DiceManager.prepareValues(diceValues);
    }

	let createTetrahedron = () => {
		//let d4 = new DiceD4({size:1, backColor: '#ff00ff'});
		run(4);
	}

	let createCube = () => {
		//let d6 = new DiceD6({size:1, backColor: '#0000ff'});
		run(6);
	}

	let createOctahedron = () => {
		//let d8 = new DiceD8({size:1, backColor: '#ff0000'});
		run(8);
	}

	let createDecahedron = () => {
		//let d10 = new DiceD10({size:1, backColor: '#ffff00'});
		run(10);
	}
	
	let createDodecahedron = () => {
		//let d12 = new DiceD12({size: 1, backColor: '#ff00ff'});
		run(12);
	}

	let createIcosahedron = () => {
		//let d20 = new DiceD20({size: 1, backColor: '#00ffff'});
		run(20);
	}

	let addPolygon = (mesh) => {
		// add object to the scene
		scene.add(mesh);
		// add renderer to the React page
		mount.current.appendChild(renderer.domElement);
	}

	let animatePolygon = (polygon) => {
		// create the mesh object
		let mat = new THREE.MeshNormalMaterial();
		let mesh = new THREE.Mesh(polygon, mat);
		camera.position.z = 5;
		// add object to scene and renderer to page
		addPolygon(mesh);
		let animate = () => {
			requestAnimationFrame(animate);
			mesh.rotation.y += 0.01;
			renderer.render(scene, camera);
		}
		// run the die's animation
		animate();
	}

	let removePolygon = async () => {
		console.log("removing polygon");
		// remove renderer from the React page
		mount.current.removeChild(renderer.domElement);
		// remove the polygon from the scene
		for (let i in scene.children) {
			await scene.remove(scene.children[i]);
		}
		//scene.remove(scene.children[0])
		// clear the dice array
		dice = [];
	}

	let changeDie = (value) => {
		if ((value > 1) && (value < 21)) {
			if (value == 4) {
				removePolygon();
				createTetrahedron();
			} else if (value == 6) {
				removePolygon();
				createCube();
			} else if (value == 8) {
				removePolygon();
				createOctahedron();
			} else if (value == 10) {
				removePolygon();
				createDecahedron();
			} else if (value == 12) {
				removePolygon();
				createDodecahedron();
			} else if (value == 20) {
				removePolygon();
				createIcosahedron();
			}
		}
	}
	
	return(<div id="dice-controller">
	<div id="controller">
	<input id="number" type="number" defaultValue="20" min="2" max="20" onChange={e => changeDie(e.target.value)}/>
	</div>
	<div id="animation" ref={ mount } onClick={ () => randomDiceThrow() }/>
	</div>);
}

function DnDice(props) {
	return(<div id="page">
	<div id="heading">
		{props.heading}
	</div>
	<DiceCanvas/>
	</div>);
}

ReactDOM.render(<DnDice heading={"D&Dice"} />, document.getElementById('root'));
