import ReactDOM from 'react-dom';
import * as THREE from 'three';
import { useState } from 'react';
import { DieSelector } from "./DieSelector";
import { DiceCanvas } from './DiceCanvas';

function DnDice(props) {

	// initialize states and increment functions for the die counters
	const [D4, incD4] = useState(0);
	const [D6, incD6] = useState(0);
	const [D8, incD8] = useState(0);
	const [D10, incD10] = useState(0);
	const [D12, incD12] = useState(0);
	const [D20, incD20] = useState(0);
	// we will pass the die counters into child components as a single object
	const obj = [ D4, incD4, D6, incD6, D8, incD8, D10, incD10, D12, incD12, D20, incD20 ];

	// initialize states for the main DiceCanvas
	const [dice, updateDice] = useState([]);
	const [diceValues, updateDiceValues] = useState([]);
	const [scene, changeScene] = useState(new THREE.Scene());

	return(<div id="page">
	<div id="heading">
		{props.heading}
	</div>
		{/* create the DieSelector which contains six DieTabs for selecting which dice to throw */}
	<DieSelector dcount={obj} updice={updateDice} udv={updateDiceValues} dv={diceValues} sc={scene} chsc={changeScene}/>
		{/* create the DiceCanvas which will display the WebGL animation of dice throws */}
	<DiceCanvas dcount={obj} d={dice} dv={diceValues} udv={updateDiceValues} sc={scene} chsc={changeScene}/>
	</div>);
}

// render the D&Dice application
ReactDOM.render(<DnDice heading={"D&Dice"} />, document.getElementById('root'));