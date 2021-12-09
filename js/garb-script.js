/*
todo:
timed events 
do not dispose char in regexv
data source and target database
keypres events
while structure
*/
{
    //script line parsers
    let scriptFullControll = /\{([^\{\}]+?)\}\s*?\{([^\{\}]+?)\}\s*?\{([^\{\}]+?)\}\s*?\(\s*?([At][tHA])\s*?\)\s*?\[\s*?([^\[\]]+?)\s*?;\s*?\]/gs;
    let scriptThreeParams = /\{([^\{\}]+?)\}\s*?\{([^\{\}]+?)\}\s*?\{([^\{\}]+?)\}\s*?\[\s*?([^\[\]]+?)\s*?;\s*?\]/gs;
    let scriptTwoParams = /\{([^\{\}]+?)\}\s*?\{([^\{\}]+?)\}\s*?\[\s*?([^\[\]]+?)\s*?;\s*?\]/gs;
    let scriptOneParams = /\{([^\{\}]+?)\}\s*?\[\s*?([^\[\]]+?)\s*?;\s*?\]/gs;

    let scriptWorkFrom = /\s*?(\S+?)\s+?from\s+?("??[^"]+?"??\???)\s+?when\s+?(\S+)\s*/sm;
    let scriptWorkSwap = /\s*?swap\s+?([^"]+)\s+?([^"]+)\s+?when\s+?(\S+)\s*/sm;

    //static regsListener

    //for deciding where to attatch listeners
    let windowOnlyEvents = new Set(['resize', 'Fullscreen', 'load']);
    let documentProbablyEvents = new Set(['scroll']);
    //events stored here
    let regularEvents = {};
    //zip operator origin target
    function ziptt(a, b, c) {
        return a.map((k, i) => [k, [b[i]], [c[i]]]);
    }
    function ziptA(a, b, c) {
        return a.map((k, i) => [k, c.map(() => b[i]), c]);
    }
    function zipAH(a, b, c) {
        return a.map((k, i) => [k, b, c]);
    }

    //Bind to correct place
    function BindAny(Event, ele, fun) {
        if (Event in regularEvents) regularEvents[Event](ele, fun);
        else if (windowOnlyEvents.has(Event)) window.addEventListener(Event, fun);
        else ele.addEventListener(Event, fun);
    }

    //determines the location of data and returns 
    //1  function to get it
    //2  function to store in location
    //3  the attributes where the data resides
    function lexLeftAndRight(firstItem, secondItem, ele) {
        let firstVal, firstPlace, secondVal, secondPlace;
        let key = new Set();
        if (/\s*?call\s*?/s.test(firstItem)) {
            firstVal = (T) => { };
            firstPlace = (T, V) => eval(V);
        } else if (/\s*?log\s*?/s.test(firstItem)) {
            firstVal = (T) => { };
            firstPlace = (T, V) => console.log(V);
        } else if (/data-\S+/.test(firstItem)) {
            key.add(firstItem);
            firstVal = (T) => T.dataset[/data-(\S+)/.exec(firstItem)[1]];
            firstPlace = (T, V) => { T.dataset[/data-(\S+)/.exec(firstItem)[1]] = V; };
        } else if (firstItem in ele) {
            key.add(firstItem);
            firstVal = (T) => T[firstItem];
            firstPlace = (T, V) => { T[firstItem] = V; };
        } else if (firstItem in getComputedStyle(ele)) {
            key.add('style');
            firstVal = (T) => getComputedStyle(T)[firstItem];
            firstPlace = (T, V) => { T.style += `;${firstItem}: ${V};`; };
        } else if (/--\S+/.test(firstItem)) {
            key.add('style');
            firstVal = (T) => getComputedStyle(T).getPropertyValue(firstItem);
            firstPlace = (T, V) => { T.style.setProperty(firstItem, V) };
        } else{console.error(firstItem)}

        if (/data-\S+/.test(secondItem)) {
            key.add(secondItem);
            let strin = /data-(\S+)/.exec(secondItem)[1];
            secondVal = (T) => T.dataset[strin];
            secondPlace = (T, V) => { T.dataset[strin] = V; };
        } else if (secondItem in ele) {
            key.add(secondItem);
            secondVal = (T) => T[secondItem];
            secondPlace = (T, V) => { T[secondItem] = V; };
        } else if (secondItem in getComputedStyle(ele)) {
            key.add('style');
            secondVal = (T) => getComputedStyle(T)[secondItem];
            secondPlace = (T, V) => { T.style += `;${secondItem}: ${V};`; };
        } else if (/--\S+/.test(secondItem)) {
            key.add('style');
            secondVal = (T) => getComputedStyle(T).getPropertyValue(secondItem);
            secondPlace = (T, V) => { T.style.setProperty(secondItem, V) };
        } else if (/"[^"]+"\?/.test(secondItem)) {
            firstPlace(ele, /"([^"]+)"\?/.exec(secondItem)[1]);
            secondItem = firstVal(ele);
            secondVal = (T) => secondItem;
            secondPlace = (T, V) => { console.error("unable to store value in imm"); };
        } else if (/"[^"]+"/.test(secondItem)) {
            secondVal = (T) => /"([^"]+)"/.exec(secondItem)[1];
            secondPlace = (T, V) => { console.error("unable to store value in imm"); };
        }else{console.error(secondItem)}
        
        return [firstVal, firstPlace, secondVal, secondPlace, Array.from(key)];
    }
    function getElementsAsThreeArrays(Q) {
        return Array.from([Q.operator, Q.origin, Q.target]).map(E => document.querySelectorAll(E)).map(E => Array.from(E));
    }

    //return function to handle adding chars events stuff
    function lexRegisterChar(char) {
        let putter;
        if (/(\S)/.test(char)) {
            putter = (T) => { T }
        } else if (/\s+?(\S)\s+?to\s+?(\S)\s+?over\s+?(\S+?)s\s+?/.test(char)) {
        } else if (/immortal\s+?(\S)/.test(char)) {
        }
        else if (/immortal\s+?(\S)\s+?to\s+?(\S)\s+?over\s+?(\S+?)s\s+?/.test(char)) {
        }
    }

    //define event tag
    customElements.define('garb-events', class RegEvents extends HTMLElement {
        constructor() {
            super();
            const observer = new MutationObserver(_ => {
                //dumb shit
                let text = this.innerText
                for (let __ of _) if (!(__.addedNodes.length && __.addedNodes[0].nodeType == 3)) observer.disconnect();
                if (!text) return;
                //prevent display
                this.style += ';display: none;';
                this.innerHTML = `<![CDATA[ ${text} ]]>`;

                //now we do stuff
                text.split(/(?<=])\s*?(?=\{)/).map(E => {
                    //test the type and return the object
                    if (/\s*?\{([^\}]*?)\}\s*?\{([^\}]*?)\}\s*?\[\s*?([^\]]*?)\s*?;\s*?\]/gms.test(E)) {
                        let [_, name, expr, work] = /\s*?\{([^\}]*?)\}\s*?\{([^\}]*?)\}\s*?\[\s*?(\S+?[^\]]*?)\s*?;\s*?\]/gms.exec(E);
                        return { name: name, expr: new RegExp(expr), work: work.split(/\s*?\;\s*/m) };
                    }
                }).forEach(E => {
                    //create a set of functions that attatch event listeners/mutation observers
                    let adders = E.work.map(W => {
                        //equality/inequality testers
                        let _, firstItem, secondItem, char, firstVal, firstPlace, secondVal, secondPlace, key, event;
                        let trigger, tester, eventJob;
                        if (/\s*?(\S+?)\s+?becomes\s+?("??[^"]+?"??\???)\s+?as\s+?(\S)\s*?/s.test(W))
                            [_, firstItem, secondItem, char] =
                                /\s*?(\S+?)\s+?becomes\s+?("??[^"]+?"??\???)\s+?as\s+?(\S)\s*?/s.exec(W),
                                [firstVal, firstPlace, secondVal, secondPlace, key] =
                                lexLeftAndRight(firstItem, secondItem, this),
                                trigger = (ele, callBacks) => {
                                    const observeListener = new MutationObserver(() => {
                                        if (firstVal(ele) == secondVal(ele)) eventJob(ele, callBacks);
                                    });
                                    observeListener.observe(ele, { attributes: true, attributeFilter: key });
                                };
                        else if (/\s*?(\S+?)\s+?becomes\s+?not\s+?("??[^"]+?"??\???)\s+?as\s+?(\S)\s*?/s.test(W))
                            [_, firstItem, secondItem, char] =
                                /\s*?(\S+?)\s+?becomes\s+?not\s+?("??[^"]+?"??\???)\s+?as\s+?(\S)\s*?/s.exec(W),
                                [firstVal, firstPlace, secondVal, secondPlace, key] =
                                lexLeftAndRight(firstItem, secondItem, this),
                                trigger = (ele, callBacks) => {
                                    const observeListener = new MutationObserver(() => {
                                        if (firstVal(ele) != secondVal(ele)) eventJob(ele, callBacks);
                                    });
                                    observeListener.observe(ele, { attributes: true, attributeFilter: key });
                                };

                        else if (/\s*?(\S+?)\s+?as\s+?(\S)\s*?/s.test(W))
                            [_, event, char] =
                                /\s*?(\S+?)\s+?as\s+?(\S)\s*?/s.exec(W),
                                trigger = (ele, callBacks) => { BindAny(event, ele, () => { eventJob(ele, callBacks); }); };

                        eventJob = (ele, callBacks) => {
                            ele[`${E.name}-register`] += char;
                            ele[`${E.name}-counterArray`].push(++ele[`${E.name}-counter`]);
                            if (E.expr.test(ele[`${E.name}-register`])) {
                                callBacks.forEach(CB => CB(ele));
                                ele[`${E.name}-register`] = '';
                                ele[`${E.name}-counterArray`] = [];
                            }
                        };
                        return (ele, callBacks) => trigger(ele, callBacks);
                    });
                    //a function to attatch functions or just one more callback
                    regularEvents[E.name] = (ele, callBack) => {
                        if (ele[`${E.name}-register`] == undefined) {
                            ele[`${E.name}-register`] = '';
                            ele[`${E.name}-counter`] = 0;
                            ele[`${E.name}-counterArray`] = [];
                            ele[`${E.name}-callbacks`] = [callBack];
                            adders.forEach(adder => adder(ele, ele[`${E.name}-callbacks`]));
                        }
                        else {
                            ele[`${E.name}-callbacks`].push(callBack);
                        }
                    };
                });
            });
            observer.observe(this, { childList: true });
        }
    });

    customElements.define('garb-script', class GarbScript extends HTMLElement {
        constructor() {
            super();
            const observer = new MutationObserver(_ => {
                //dumb shit
                let text = this.innerText
                for (let __ of _) if (!(__.addedNodes.length && __.addedNodes[0].nodeType == 3)) observer.disconnect();
                if (!text) return;
                //now we do stuff
                text.split(/(?<=])\s*?(?=\{)/).map(E => {
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
                        console.log(E);
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
            });
            observer.observe(this, { childList: true });
        }
    });

    function definePrimative(String, [load, store], Key) { }
    function defineExtention(Test, Generator) {
        //Test(String: arg) -> True/False
        //Generator(String: arg, Ele) -> [Load(T) -> Any , Store(T,V) -> None, Keys]
    }



}
/*
page table register points to ram where page table is
tlb caches page table stuff

page table is in ram and lists all virtual memory addresses


*/