import * as THREE from "three";
import * as CANNON from "cannon";
import { useEffect, useRef, useState } from "react";
import { DiceD10, DiceD12, DiceD20, DiceD4, DiceD6, DiceD8, DiceManager } from "./dice";

const realScene = new THREE.Scene();
const realDice = [];

function DieTab(props) {

    let scene, camera, mount, renderer, die = [];

    mount = useRef(null);

    let init = () => {
        // set up a CANNON world without gravity and initialize the DiceManager
        setupWorld();
        // create a perspective camera
        setupCamera();
        // create a WebGL renderer
        setupRenderer();
        // create the corresponding die icon
        die = createDie();
        // add the die to the DieTab
        addElements();
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

    let setupWorld = () => {
        scene = new THREE.Scene();
        let world = new CANNON.World();
        DiceManager.setWorld(world);
        addLighting();
    }

    let setupCamera = () => {
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
    }

    let setupRenderer = () => {
        // create and initialize the WebGL renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth/11, window.innerHeight/11);
    }

    let animate = () => {
        renderer.render(scene, camera);
        die.getObject().rotation.y += 0.01;
        die.getObject().rotation.z += 0.01;
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
                return new DiceD20({size: icon_size, backColor: '#ffa500'});
        }
    }

    let render = () => {
        requestAnimationFrame(animate);
    }

    let addElements = async () => {
        // add the die icon to
        scene.add(die.getObject());
        // add the die to the scene
        mount.current.appendChild(renderer.domElement);
    }

    let addDie = () => {
        // add a new die to the DiceCanvas
        let new_die = createDie();
        // add a new die to the array
        realDice.push(new_die);
        // add the die to the scene
        realScene.add(new_die.getObject());
        // increment count for the die type
        props.inc(props.num + 1);
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
        <div ref={ mount } className='dtab2' onClick={ () => addDie() }>
            <div className='dcount'>
                x{props.num}
            </div>
        </div>
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
    let world, camera, renderer, mount = [];
    // create a sum variable
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
        // mount the renderer in the canvas
        mnt();
        // run the die's animation
        requestAnimationFrame(animate);
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
        realScene.add(ambient);
        realScene.add(directionalLight);
    }

    let addFloor = () => {
        // create a floor for the scene
        let floorMaterial = new THREE.MeshPhongMaterial( { color: '#222222', side: THREE.DoubleSide } );
        let floorGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);
        let floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.receiveShadow  = true;
        floor.rotation.x = Math.PI / 2;
        // add a floor to the  scene
        realScene.add(floor);
        floor.position.set(0,-5,0);
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
        camera.position.z = 20;
        camera.position.y = 10;
        camera.zoom = 300;
    }

    let setupRenderer = () => {
        // initialize the WebGL renderer
        //props.upr(_ => props.r.setSize(window.innerWidth/1.5, window.innerHeight/1.5));
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth/1.4, window.innerHeight/1.4);
        //props.r.current.setSize(window.innerWidth/1.5, window.innerHeight/1.5);
    }

    let updatePhysics = () => {
        // increment the CANNON world step
        world.step(1.0 / 60.0);
        // update dice physics
        realDice.forEach(die => die.updateMeshFromBody());
    }

    let animate = () => {
        // update CANNON physics
        updatePhysics();
        // render the scene
        //props.upr(_ => props.r.render(realScene, camera));
        renderer.render(realScene, camera);
        // call the animation function
        requestAnimationFrame(animate);
    }

    let randomDiceThrow = async () => {
        let diceValues = [];
        // roll each die
        for (let i = 0; i < realDice.length; i++) {
            console.log(realDice[i]);
            let yRand = Math.random() * 20;
            realDice[i].getObject().position.x = -15 - (i % 3) * 1.5;
            realDice[i].getObject().position.y = 2 + Math.floor(i / 3) * 1.5;
            realDice[i].getObject().position.z = -15 + (i % 3) * 1.5;
            realDice[i].getObject().quaternion.x = (Math.random() * 90 - 45) * Math.PI / 180;
            realDice[i].getObject().quaternion.z = (Math.random() * 90 - 45) * Math.PI / 180;
            realDice[i].updateBodyFromMesh();
            let rand = Math.random() * 5;
            realDice[i].getObject().body.velocity.set(25 + rand, 40 + yRand, 15 + rand);
            realDice[i].getObject().body.angularVelocity.set(10 * Math.random() - 10, 10 * Math.random() - 10, 10 * Math.random() - 10);
            //console.log(realDice[i].faces.values);
            //diceValues.push({dice: realDice[i], value: realDice[i].faces.values});
        }

        // update the DiceManager with the new values
        //DiceManager.prepareValues(diceValues);
        // sum up all of the die values
        //sumUpDice();
    }

    let sumUpDice = () => {
        let faceSum = 0;
        let side = 0;
        // sum the dice faces facing up
        for (let i = 0; i < realDice.length; i++)
            side = realDice[i].getUpsideValue();
            console.log(side);
            faceSum += side;
        // add any non-zero sum to the canvas
        (faceSum === 0) ? changeSum(_ => null) : changeSum(_ => faceSum);
    }

    let mnt = () => { mount.current.appendChild(renderer.domElement) }

    useEffect(() => {
        // initialize necessary variables
        init();
    }, []); // passing a second argument forces useEffect to run only once

    return(<div id="dice-controller">
        <div id="animation" ref={ mount } onClick={ async () => {
            // throw the dice when the canvas is clicked
            await randomDiceThrow();
            let s = 0;
            let dv = []
            let side = 0;
            for (let i = 0; i < realDice.length; i++) {
                side = realDice[i].getUpsideValue();
                s += side;
                dv.push({dice: realDice[i], value: side});
            }
            DiceManager.prepareValues(dv);
			console.log(s);
			(s === 0) ? changeSum(null) : changeSum(s);
        }}/>
        <div id="sum">
            {sum}{/*the sum of the dice will be entered here*/}
        </div>
    </div>);
}

export {
    DieSelector,
    DiceCanvas
}
