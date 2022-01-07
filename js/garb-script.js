defineGarbFlag = true;
//define event tag
function defineGarb() {
    customElements.define('garb-script', class GarbScript extends HTMLElement {
        constructor() {
            super();
            this.innerText.split(/(?<=])\s*?(?=\{)/).map(E => {
                let _, operator, origin, target, type, work;
                //test type and infer data path as required
                if (E.match(scriptFullControll))
                    [_, operator, origin, target, type, work] = scriptFullControll.exec(E);
                else if (E.match(scriptThreeParams))
                    [_, operator, origin, target, work] = scriptThreeParams.exec(E), type = 'AH';
                else if (E.match(scriptTwoParams))
                    [_, origin, target, work] = scriptTwoParams.exec(E), type = 'tA';
                else if (E.match(scriptOneParams))
                    [_, origin, work] = scriptOneParams.exec(E), type = 'tt';
                else {
                    console.error(E);
                    console.error(`you fucked up the selector ${E}`); return;
                }
                operator = operator || origin;
                target = target || origin;
                return {
                    type: type,
                    operator: operator,
                    origin: origin,
                    target: target,
                    work: work.split(/\s*?\;\s*/m)
                };
            }).forEach(Q => {
                //retreive elements
                let [operatorElements, originElements, targetElements] = getElementsAsThreeArrays(Q);
                let CallList, length;
                //organize call list
                switch (Q.type) {
                    case 'tt':
                        length = Math.min(
                            operatorElements.length,
                            originElements.length,
                            targetElements.length
                        );
                        CallList = ziptt(
                            operatorElements.slice(0, length),
                            originElements.slice(0, length),
                            targetElements.slice(0, length)
                        );
                        break;
                    case 'tA':
                        length = Math.min(
                            operatorElements.length,
                            originElements.length
                        );
                        CallList = ziptA(
                            operatorElements.slice(0, length),
                            originElements.slice(0, length),
                            targetElements
                        );
                        break;
                    case 'AH':
                        length = Math.min(
                            originElements.length,
                            targetElements.length
                        );
                        CallList = zipAH(
                            operatorElements,
                            originElements.slice(0, length),
                            targetElements.slice(0, length)
                        );
                        break;
                    default:
                        console.error(`${Q.type} not a valid type. type must be one of these: tt, tA, AH`);
                        return;
                }
                if (CallList.length == 0) { console.error(`An element selector failed to find any matches`); return; }

                //handle every instruction and attatch event listener
                Q.work.forEach(W => {

                    //declare parts of grammar
                    let _, firstItem, secondItem, ConditionEvent, workType;

                    //test all statement types
                    if (W.match(scriptWorkFrom))
                        [_, firstItem, secondItem, ConditionEvent] = scriptWorkFrom.exec(W), workType = 'from';
                    else if (W.match(scriptWorkSwap))
                        [_, firstItem, secondItem, ConditionEvent] = scriptWorkSwap.exec(W), workType = 'swap';
                    else { console.error(`you fucked up the line ${W}`); return; }


                    //get functions associated with left and right hand parameters
                    let [firstVal, firstPlace, secondVal, secondPlace, key] =
                        lexLeftAndRight(firstItem, secondItem, this); //for getting correct movement functions from parameters

                    //attatch events based on the construction type
                    if (workType == 'from')
                        CallList.forEach(([oper, origs, targs]) => {           //for every call structure
                            BindAny(ConditionEvent, oper, () => {      //we bind an event to the operator 
                                origs.forEach((_, i) => {                      //and for each origin
                                    firstPlace(targs[i], secondVal(origs[i])); //we store a value from it in the target
                                });
                            });
                        });
                    else {
                        if (Q.type == 'tA') {
                            CallList.forEach(([oper, origs, targs]) => {           //for every call structure
                                BindAny(ConditionEvent, oper, () => {      //we bind an event to the operator
                                    targs.forEach(targ => {                      //and for each target
                                        let temp = firstVal(targ)             //we swap between the target and 
                                        firstPlace(targ, secondVal(targ)); //itself because tA is asymetrical
                                        secondPlace(targ, temp);               //
                                    });
                                });
                            });
                        } else {
                            CallList.forEach(([oper, origs, targs]) => {           //for each call structure
                                BindAny(ConditionEvent, oper, () => {      //we bind an event to the operator
                                    origs.forEach((_, i) => {                      //and for each origin
                                        let temp = firstVal(targs[i]);             //we swap between
                                        firstPlace(targs[i], secondVal(origs[i])); //the target and
                                        secondPlace(origs[i], temp);               //the origin
                                    });
                                });
                            });
                        }
                    }
                });
            });
            this.outerHTML = '';
        }
    });
}