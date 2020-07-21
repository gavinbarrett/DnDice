import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {DiceCanvas, DieSelector} from './index.jsx';

function DnDice(props) {
	
	const [D4, incD4] = useState(0);
	const [D6, incD6] = useState(0);
	const [D8, incD8] = useState(0);
	const [D10, incD10] = useState(0);
	const [D12, incD12] = useState(0);
	const [D20, incD20] = useState(0);

	const obj = [ D4, incD4, D6, incD6, D8, incD8, D10, incD10, D12, incD12, D20, incD20 ];

	return(<div id="page">
	<div id="heading">
		{props.heading}
	</div>
	<DieSelector dcount={obj}/>
	<DiceCanvas dcount={obj}/>
	</div>);
}

ReactDOM.render(<DnDice heading={"D&Dice"} />, document.getElementById('root'));
