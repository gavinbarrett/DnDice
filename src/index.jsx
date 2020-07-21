import { useState, useEffect, useRef } from 'react';
import { DiceManager, DiceD4, DiceD6, DiceD8, DiceD10, DiceD12, DiceD20 } from "./dice";

function DieTab(props) {
	
	let radius = 1;
	let scene, camera, mount, renderer, die = [];

	mount = useRef(null);
	
	let init = () => {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;
		// create and initialize the WebGL renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth/10, window.innerHeight/10);
		
		let world = new CANNON.World();
		DiceManager.setWorld(world);
		let ambient = new THREE.AmbientLight('#ffffff', 0.3);
	    let directionalLight = new THREE.DirectionalLight('#ffffff', 0.5);
    	directionalLight.position.x = -1000;
    	directionalLight.position.y = 1000;
    	directionalLight.position.z = 1000;

    	// add lighting to the scene
		scene.add(ambient);
		scene.add(directionalLight);
	
		die = createDie();
	}

	let animate = () => {
		renderer.render(scene, camera);
		die.getObject().rotation.y += 0.01;
		die.updateBodyFromMesh();
		requestAnimationFrame(animate);
	}

	let createDie = () => {
		let icon_size = 2;
		switch(props.faces) {
			case 4:
				return new DiceD4({size: icon_size, backColor: '#ff0000'});
			case 6:
				return new DiceD6({size: icon_size, backColor: '#00ff00'});
			case 8:
				return new DiceD8({size: icon_size, backColor: '#0000ff'});
			case 10:
				return new DiceD10({size: icon_size, backColor: '#ff00ff'});
			case 12:
				return new DiceD12({size: icon_size, backColor: '#ffff00'});
			default:
				return new DiceD20({size: icon_size, backColor: '#00ffff'});
		}
	}

	let render = () => {
		requestAnimationFrame(animate);
		animate();
	}

	let addElements = async () => {
		scene.add(die.getObject());
		mount.current.appendChild(renderer.domElement);
	}

	useEffect(() => {
		//
		init();
		//
		addElements();
		//
		render();
	}, [mount]);

	return (<div ref={mount} className='dtab' onClick={() => { props.inc(props.num+1) }}>
	</div>);
}

function DieSelector(props) {
	return (<div id='controller'>
	<div id='selector'>
		<DieTab num={props.dcount[0]} inc={props.dcount[1]} faces={4}/>
		<DieTab num={props.dcount[2]} inc={props.dcount[3]} faces={6}/>
		<DieTab num={props.dcount[4]} inc={props.dcount[5]} faces={8}/>
		<DieTab num={props.dcount[6]} inc={props.dcount[7]} faces={10}/>
		<DieTab num={props.dcount[8]} inc={props.dcount[9]} faces={12}/>
		<DieTab num={props.dcount[10]} inc={props.dcount[11]} faces={20}/>
	</div>
	</div>);
}

function DiceCanvas(props) {
	
	// declare function variables
	let world, scene, camera, mount, renderer, dice = [];
	
	// create a reference to this object
	mount = useRef(null);
	
	let init = () => {
		// set up a new cannon world with gravity
		world = new CANNON.World();
		world.gravity.set(0, -9.82 * 20, 0);
		
		// configure the world of the threejs-dice dice manager
		DiceManager.setWorld(world);

		let floorBody = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: DiceManager.floorBodyMaterial});
		floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
		world.add(floorBody);

		// create a scene and camera object
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.x = 5;
		camera.position.z = 30;
		camera.position.y = 7;
		camera.zoom = 100;
		//camera.position.y += 2;
		// create and initialize the WebGL renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth/1.5, window.innerHeight/1.5);
	
		addLighting();
	}

	let updatePhysics = () => {
		//
		world.step(1.0 / 60.0);
		//
		dice.forEach(d => d.updateMeshFromBody());
	}

	let addLighting = () => {
		let ambient = new THREE.AmbientLight('#ffffff', 0.3);
	    let directionalLight = new THREE.DirectionalLight('#ffffff', 0.5);
    	directionalLight.position.x = -1000;
    	directionalLight.position.y = 1000;
    	directionalLight.position.z = 1000;

    	// add lighting to the scene
		scene.add(ambient);
		scene.add(directionalLight);
	}

	let dieConstructor = (val) => {
		let die_size = 2;
		switch(parseInt(val)) {
			case 4:
				return new DiceD4({size: die_size, backColor: '#ff0000'}); // return a D4 - Tetrahedron
			case 6:
				return new DiceD6({size: die_size, backColor: '#ffff00'}); // return a D6 - Cube
			case 8:
				return new DiceD8({size: die_size, backColor: '#ff00ff'}); // return a D8 - Octohedron
			case 10:
				return new DiceD10({size: die_size, backColor: '#0000ff'}); // return a D10 - Decahedron
			case 12:
				return new DiceD12({size: die_size, backColor: '#00ff00'}); // return a D12 - Dodecahedron
			default:
				return new DiceD20({size: die_size, backColor: '#ff00f0'}); // return a D20 - Icosahedron
		}
	}

	let createDie = async (val) => {

		val = parseInt(val);

		let diceValues = [];
		let die = dieConstructor(val);

		diceValues.push({dice: die, value: val});

		// set the values
		//DiceManager.prepareValues(diceValues);
		
		// add the object to the scene
		scene.add(die.getObject());
		dice.push(die);
		console.log(dice);
		// add the scene to the react page
		mount.current.appendChild(renderer.domElement);

		// create a floor for the scene
		let floorMaterial = new THREE.MeshPhongMaterial( { color: '#222222', side: THREE.DoubleSide } );
		let floorGeometry = new THREE.PlaneGeometry(50, 50, 10, 10);
		let floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.receiveShadow  = true;
		floor.rotation.x = Math.PI / 2;
		scene.add(floor);

		die.updateBodyFromMesh()
		console.log(die.getUpsideValue());
		
		requestAnimationFrame(animate);

		// run the die's animation
		animate();
	}
	
	let animate = () => {
		updatePhysics();
		//dice[0].updateBodyFromMesh();
		renderer.render(scene, camera);
		// dice.forEach(d => d.getObject().rotation.y += 0.01);
		// dice[0].updateBodyFromMesh();
		//console.log(dice[0].getUpsideValue());
		requestAnimationFrame(animate);
	}

	useEffect(() => {
		// initialize necessary variables
		init();
		// create the initial D20 object and animate it
		createDie(4);
		createDie(6);
		createDie(8);
		createDie(10);
		createDie(12);
		createDie(20);
	});

	/*
	* 	TODO:
	*   	-> Add the ability to add more than one die to the scene.
	* 		-> Add additional lighting to the scene to better illunimate the die.
	* 		-> Move the camera to a skewed angle to visualize the most amount of faces possible.
	* 		-> Add the ability to determine the upturned face of the die
	*				- this can be accomplished by using the isFinished() and getUpturnedSide() functions
	*				  defined on the DiceObject class, which is the base class of DiceD4/6/8/10/12/20
	*
	* */


	let randomDiceThrow = () => {
		console.log("Throwing...");
		console.log(dice);
        let diceValues = [];

        for (let i = 0; i < dice.length; i++) {
            let yRand = Math.random() * 20;
            console.log(dice[i].getObject().position.x);
            dice[i].getObject().position.x = -15 - (i % 3) * 1.5;
            dice[i].getObject().position.y = 2 + Math.floor(i / 3) * 1.5;
            dice[i].getObject().position.z = -15 + (i % 3) * 1.5;
            dice[i].getObject().quaternion.x = (Math.random()*90-45) * Math.PI / 180;
            dice[i].getObject().quaternion.z = (Math.random()*90-45) * Math.PI / 180;
            dice[i].updateBodyFromMesh();
            let rand = Math.random() * 5;
            dice[i].getObject().body.velocity.set(25 + rand, 40 + yRand, 15 + rand);
            dice[i].getObject().body.angularVelocity.set(10 * Math.random() -10, 10 * Math.random() -10, 10 * Math.random() -10);
            diceValues.push({dice: dice[i], value: i + 1});
        }

        DiceManager.prepareValues(diceValues);
		sumUpside();
	}

	let createTetrahedron = () => { createDie(4); }

	let createCube = () => { createDie(6); }

	let createOctahedron = () => { createDie(8); }

	let createDecahedron = () => { createDie(10); }
	
	let createDodecahedron = () => { createDie(12); }

	let createIcosahedron = () => { createDie(20); }

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
		// remove renderer from the React page
		mount.current.removeChild(renderer.domElement);
		// remove polygons from the scene
		for (let i in scene.children)
			await scene.remove(scene.children[i]);
	}

	let changeDie = (value) => {
		// FIXME: on click, call changeDie to create more die
		value = parseInt(value);
		if ((value > 1) && (value < 21)) {
			if (value === 4) {
				removePolygon();
				createTetrahedron();
			} else if (value === 6) {
				removePolygon();
				createCube();
			} else if (value === 8) {
				removePolygon();
				createOctahedron();
			} else if (value === 10) {
				removePolygon();
				createDecahedron();
			} else if (value === 12) {
				removePolygon();
				createDodecahedron();
			} else if (value === 20) {
				removePolygon();
				createIcosahedron();
			}
		}
	}

	let sumUpside = () => { 
		let sum = 0;
		for (let i = 0; i < dice.length; i++) {
			sum += dice[i].getUpsideValue()
		}
		console.log("Sum of rolls: " + sum);
	}

	return(<div id="dice-controller">
	<div id="animation" ref={ mount } onClick={ async () => { 
		randomDiceThrow();
	}}/>
	</div>);
}

export {
	DiceCanvas,
	DieSelector,
}
