import * as THREE from "three";
import * as CANNON from "cannon";
import { useEffect, useRef } from "react";
import { DiceD10, DiceD12, DiceD20, DiceD4, DiceD6, DiceD8, DiceManager } from "./dice";

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
        die = createDieIcon();
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
        renderer.setSize(window.innerWidth/10, window.innerHeight/10);
    }

    let animate = () => {
        renderer.render(scene, camera);
        die.getObject().rotation.y += 0.01;
        die.updateBodyFromMesh();
        requestAnimationFrame(animate);
    }

    let createDieIcon = () => {
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
        // add the die icon to
        scene.add(die.getObject());
        // add the die to the scene
        mount.current.appendChild(renderer.domElement);
    }

    let addDie = () => {
        // add a new die to the DiceCanvas
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

export {
    DieTab
}