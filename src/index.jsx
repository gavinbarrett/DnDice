import { useState, useEffect, useRef } from 'react';
import { DiceManager, DiceD4, DiceD6, DiceD8, DiceD10, DiceD12, DiceD20 } from "./dice";

function DieTab(props) {
	
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

	let addDie = () => {
		let new_dice;
		let icon_size = 2;
		switch(props.faces) {
			case 4:
				new_dice = new DiceD4({size: icon_size, backColor: '#ff0000'});
				break;
			case 6:
				new_dice = new DiceD6({size: icon_size, backColor: '#00ff00'});
				break;
			case 8:
				new_dice = new DiceD8({size: icon_size, backColor: '#0000ff'});
				break;
			case 10:
				new_dice = new DiceD10({size: icon_size, backColor: '#ff00ff'});
				break;
			case 12:
				new_dice = new DiceD12({size: icon_size, backColor: '#ffff00'});
				break;
			default:
				new_dice = new DiceD20({size: icon_size, backColor: '#00ffff'});
		}
		new_dice.updateBodyFromMesh();
		// add a new die to the dice array
		props.ud(arr => [...arr, new_dice]);
		// add values to the diceValues array
		props.udv(arr2 => [...arr2, {dice: new_dice, value: props.faces}]);
		// add the die to the scene
		props.chsc(sc => sc.add(new_dice.getObject()));
		// increment count for the die type
		props.inc(props.num + 1);
		// update the DiceManager values
		DiceManager.prepareValues(props.dv);
	}

	useEffect(() => {
		// initialize the scene
		init();
		// add the die icon to the tab
		addElements();
		// run the die animation
		render();
	}, [mount]);

	return (<div className='dtab'>
		<div ref={mount} className='dtab' onClick={() => { addDie() }}>
		</div>
	<div className='dcount'>
		x{props.num}
	</div>
	</div>);
}

function DieSelector(props) {
	return (<div id='controller'>
	<div id='selector'>
		<DieTab sc={props.sc} chsc={props.chsc} udv={props.udv} dv={props.dv} ud={props.updice} num={props.dcount[0]} inc={props.dcount[1]} faces={4}/>
		<DieTab sc={props.sc} chsc={props.chsc} udv={props.udv} dv={props.dv} ud={props.updice} num={props.dcount[2]} inc={props.dcount[3]} faces={6}/>
		<DieTab sc={props.sc} chsc={props.chsc} udv={props.udv} dv={props.dv} ud={props.updice} num={props.dcount[4]} inc={props.dcount[5]} faces={8}/>
		<DieTab sc={props.sc} chsc={props.chsc} udv={props.udv} dv={props.dv} ud={props.updice} num={props.dcount[6]} inc={props.dcount[7]} faces={10}/>
		<DieTab sc={props.sc} chsc={props.chsc} udv={props.udv} dv={props.dv} ud={props.updice} num={props.dcount[8]} inc={props.dcount[9]} faces={12}/>
		<DieTab sc={props.sc} chsc={props.chsc} udv={props.udv} dv={props.dv} ud={props.updice} num={props.dcount[10]} inc={props.dcount[11]} faces={20}/>
	</div>
	</div>);
}

function DiceCanvas(props) {
	
	// declare function variables
	let world, camera, mount, renderer, dice = [];
	
	// create a reference to this object
	mount = useRef(null);
	const [sum, updateSum] = useState(0);

	let init = () => {
		// set up a CANNON world with gravity and initialize the DiceManager
		setupWorld(true);
		// create a perspective camera
		setupCamera();
		// create a WebGL renderer
		setupRenderer();
		// add the scene to the React page
		addScene();

		requestAnimationFrame(animate);

		// run the die's animation
		animate();
	}

	let addScene = () => {
		// insert the scene into the React functional component
		mount.current.appendChild(renderer.domElement);
	}

	let updatePhysics = () => {
		// increment the CANNON world step
		world.step(1.0 / 60.0);
		// update dice physics
		props.d.forEach(die => die.updateMeshFromBody());
	}

	let setupWorld = (gravity=false) => {
		// set up a new cannon world with gravity
		world = new CANNON.World();
		if (gravity)
			world.gravity.set(0, -9.82 * 20, 0);
		// configure the world of the threejs-dice dice manager
		DiceManager.setWorld(world);
		// add a floor to both the scene and the world
		addFloor();
		// add lighting to the world
		addLighting();
	}

	let setupRenderer = () => {
		// initialize the WebGL renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth/1.5, window.innerHeight/1.5);
	}

	let setupCamera = () => {
		camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.x = 5;
		camera.position.z = 30;
		camera.position.y = 7;
		camera.zoom = 100;
	}

	let addLighting = () => {
		// create lighting
		let ambient = new THREE.AmbientLight('#ffffff', 0.3);
	    let directionalLight = new THREE.DirectionalLight('#ffffff', 0.5);
    	directionalLight.position.x = -1000;
    	directionalLight.position.y = 1000;
    	directionalLight.position.z = 1000;
    	// add lighting to the scene
		props.chsc(sc => sc.add(ambient));
		props.chsc(sc => sc.add(directionalLight));
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

	let addFloor = () => {
		// create a floor for the scene
		let floorMaterial = new THREE.MeshPhongMaterial( { color: '#222222', side: THREE.DoubleSide } );
		let floorGeometry = new THREE.PlaneGeometry(60, 60, 10, 10);
		let floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.receiveShadow  = true;
		floor.rotation.x = Math.PI / 2;
		// add a floor to the  scene
		props.chsc(sc => sc.add(floor));

		// create a CANNON floor
		let floorBody = new CANNON.Body({mass: 0, shape: new CANNON.Plane(), material: DiceManager.floorBodyMaterial});
		floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
		// add the floor to the world
		world.add(floorBody);
	}

	let createDie = async (val) => {

		val = parseInt(val);

		//let diceValues = [];
		let die = dieConstructor(val);

		//diceValues.push({dice: die, value: val});

		// set the values
		//DiceManager.prepareValues(diceValues);
		// add the object to the scene
		//scene.add(die.getObject());
		//for (let i in props.d) {
		//	scene.add(props.d[i].getObject());
		//}
		props.chsc(sc => sc.add(die.getObject()));
		//dice.push(die);
		//console.log(dice);
		// add the scene to the react page
		//mount.current.appendChild(renderer.domElement);


		//die.updateBodyFromMesh()
		//console.log(die.getUpsideValue());
		
		requestAnimationFrame(animate);

		// run the die's animation
		animate();
	}

	let setDice = () => {

		// add the scene to the react page
		mount.current.appendChild(renderer.domElement);

		// create a floor for the scene
		let floorMaterial = new THREE.MeshPhongMaterial( { color: '#222222', side: THREE.DoubleSide } );
		let floorGeometry = new THREE.PlaneGeometry(60, 60, 10, 10);
		let floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.receiveShadow  = true;
		floor.rotation.x = Math.PI / 2;

		props.chsc(sc => sc.add(floor));
		
		requestAnimationFrame(animate);

		// run the die's animation
		animate();
	}

	let animate = () => {
		// update CANNON physics
		updatePhysics();
		// render the scene
		renderer.render(props.sc, camera);
		// call the animation function
		requestAnimationFrame(animate);
	}

	useEffect(() => {
		// initialize necessary variables
		init();
	}, [mount]); // passing a second argument forces useEffect to run only once

	let randomDiceThrow = () => {
        let diceValues = [];

        for (let i = 0; i < props.d.length; i++) {
            let yRand = Math.random() * 20;
            props.d[i].getObject().position.x = -15 - (i % 3) * 1.5;
            props.d[i].getObject().position.y = 2 + Math.floor(i / 3) * 1.5;
            props.d[i].getObject().position.z = -15 + (i % 3) * 1.5;
            props.d[i].getObject().quaternion.x = (Math.random()*90-45) * Math.PI / 180;
            props.d[i].getObject().quaternion.z = (Math.random()*90-45) * Math.PI / 180;
            props.d[i].updateBodyFromMesh();
            let rand = Math.random() * 5;
            props.d[i].getObject().body.velocity.set(25 + rand, 40 + yRand, 15 + rand);
            props.d[i].getObject().body.angularVelocity.set(10 * Math.random() -10, 10 * Math.random() -10, 10 * Math.random() -10);

            diceValues.push({dice: props.d[i], value: i + 1});
		}
		props.udv(_ => diceValues);
        DiceManager.prepareValues(diceValues);
		sumUpside();
	}

	let sumUpside = () => {
		let faceSum = 0;
		// sum the dice faces facing up
		for (let i = 0; i < props.dv.length; i++)
			faceSum += props.dv[i]['dice'].getUpsideValue();
		// add the sum to the canvas
		document.getElementById('sum').textContent = faceSum;
	}

	return(<div id="dice-controller">
	<div id="animation" ref={ mount } onClick={ async () => { 
		// throw the dice when the canvas is clicked
		console.log(props.d);
		await randomDiceThrow();
	}}/>
	<div id="sum">
		{/*the sum of all dice will be entered here*/}
	</div>
	</div>);
}

// export D&Dice's functional components
export {
	DiceCanvas,
	DieSelector,
}
