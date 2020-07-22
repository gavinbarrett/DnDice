import { DieTab } from "./DieTab";

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

export {
    DieSelector
}