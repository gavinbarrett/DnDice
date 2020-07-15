import React, {useState, useEffect, useRef} from 'react';
import ReactDOM from 'react-dom';

const DiceCanvas = () => {

	// create a reference to this object
	const mount = useRef(null);
	const diName = 'di';
	let renderer = null;
	useEffect(() => {
		let width = 600;//mount.current.clientWidth;
		let height = 600;//mount.current.clientHeight;

		let scene = new THREE.Scene();
		let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		// generate a material for the object (object + material = mesh)
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
		// create a renderer
		renderer = new THREE.WebGLRenderer();
		// initialize the size of the renderer
		renderer.setSize(window.innerWidth/2, window.innerHeight/2);
		// insert the renderer into the React page
		renderer.domElement.name = diName;
		mount.current.appendChild(renderer.domElement);
			
		const radius = 2;
		let ico = new THREE.IcosahedronGeometry(radius);
		let mat = new THREE.MeshNormalMaterial();
		let mesh = new THREE.Mesh(ico, mat);
		scene.add(mesh);
		camera.position.z = 5;

		let animate = () => {
			requestAnimationFrame(animate);
			mesh.rotation.x += 0.01;
			mesh.rotation.y += 0.01;
			renderer.render(scene, camera);
		}
		animate();
	});

	let changeDice = () => {
		mount.current.removeChild(renderer.domElement);
	}

	return (<div id="animation" ref={ mount } onClick={ changeDice }/>);
}

function Heading() {
	return(<div id="heading">
	DnDice
	</div>);
}

function Canvas() {
	return(<div id="canv">
	</div>);
}

function App() {
	return(<div id="page">
	<Heading/>
	<DiceCanvas/>
	</div>);
}

ReactDOM.render(<App />, document.getElementById('root'));
