import * as THREE from "three";
import * as CANNON from "cannon";
import { useEffect, useRef, useState } from "react";
import { DiceManager } from "./dice";

function DiceCanvas(props) {

    // declare function variables
    let world, camera, mount, renderer = [];

    const [sum, changeSum] = useState(null);
    // create a reference to this object
    mount = useRef(null);

    let init = () => {
        // set up a CANNON world with gravity and initialize the DiceManager
        setupWorld(true);
        // create a perspective camera
        setupCamera();
        // create a WebGL renderer
        setupRenderer();
        // add the scene to the React page
        addScene();
        // run the die's animation
        animate();
    }

    let addScene = () => {
        // insert the scene into the React functional component
        mount.current.appendChild(renderer.domElement);
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

    let setupCamera = () => {
        // create a camera for the scene
        camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.x = 5;
        camera.position.z = 30;
        camera.position.y = 7;
        camera.zoom = 100;
    }

    let setupRenderer = () => {
        // initialize the WebGL renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth/1.5, window.innerHeight/1.5);
    }

    let updatePhysics = () => {
        // increment the CANNON world step
        world.step(1.0 / 60.0);
        // update dice physics
        props.d.forEach(die => die.updateMeshFromBody());
    }

    let animate = () => {
        // update CANNON physics
        updatePhysics();
        // render the scene
        renderer.render(props.sc, camera);
        // call the animation function
        requestAnimationFrame(animate);
    }

    let randomDiceThrow = () => {
        let diceValues = [];
        // roll each die
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
        // set the new dice values
        props.udv(_ => diceValues);
        // update the DiceManager with the new values
        DiceManager.prepareValues(diceValues);
        // sum up all of the die values
        sumUpDice();
    }

    let sumUpDice = () => {
        let faceSum = 0;
        // sum the dice faces facing up
        for (let i = 0; i < props.dv.length; i++)
            faceSum += props.dv[i]['dice'].getUpsideValue();
        // add any non-zero sum to the canvas
        (faceSum === 0) ? changeSum(_ => null) : changeSum(_ => faceSum);
    }

    useEffect(() => {
        // initialize necessary variables
        init();
    }, [mount]); // passing a second argument forces useEffect to run only once

    return(<div id="dice-controller">
        <div id="animation" ref={ mount } onClick={ async () => {
            // throw the dice when the canvas is clicked
            await randomDiceThrow();
        }}/>
        <div id="sum">
            {sum}{/*the sum of the dice will be entered here*/}
        </div>
    </div>);
}

export {
    DiceCanvas
}
