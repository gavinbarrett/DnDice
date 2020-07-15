import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

function DiceCanvas() {

	const radius = 2;

	// create a reference to this object
	const mount = useRef(null);

	// create a scene and camera object
	let scene = new THREE.Scene();
	let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	// create and initialize the WebGL renderer
	let renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth/2, window.innerHeight/2);
	
	useEffect(() => {
		// initialize the renderer with the icosahedron
		createIcosahedron();
	});
	
	let create = () => {
		const mat = new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide,
		});
		const hue = Math.random();
		const sat = 1;
		const lum = 0.5;
		mat.color.setHSL(hue, sat, lum);
		return mat;
	}
	
	let createTetrahedron = () => {
		let tetra = new THREE.TetrahedronGeometry(radius);
		animatePolygon(tetra);
	}

	let createCube = () => {
		let cube = new THREE.BoxGeometry(radius, radius, radius);
		animatePolygon(cube);
	}

	let createOctahedron = () => {
		let octa = new THREE.OctahedronGeometry(radius);
		animatePolygon(octa);
	}

	let createIcosahedron = () => {
		let icosa = new THREE.IcosahedronGeometry(radius);
		animatePolygon(icosa);
	}

	let createDodecahedron = () => {
		let dodeca = new THREE.DodecahedronGeometry(radius);
		animatePolygon(dodeca);
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

	let removePolygon = () => {
		// remove renderer from the React page
		mount.current.removeChild(renderer.domElement);
		// remove the polygon from the scene
		scene.remove(scene.children[0])
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
	<div id="animation" ref={ mount } onClick={ () => console.log('The canvas was clicked!') }/>
	</div>);
}

function Heading() {
	return(<div id="heading">
	DnDice
	</div>);
}

function App() {
	return(<div id="page">
	<Heading/>
	<DiceCanvas/>
	</div>);
}

ReactDOM.render(<App />, document.getElementById('root'));
