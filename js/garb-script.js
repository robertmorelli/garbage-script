/*
todo:
timed events 
do not dispose char in regexv
data source and target database
keypres events
while structure
*/


let destroyTieVars;
let tieVarsOfString;
let tieVarsInterface;
let TieVarsRecord = {};




window.addEventListener('load',()=>loadGarb());

let mega = new Set();

{
    function setMega() {
        let addElementsToMega = (ele) => {
            for (let i in ele)
                mega.add(i);
            if (ele.children)
                Array.from(ele.children).forEach(addElementsToMega)
        }
        addElementsToMega(document.querySelector('body'));
    }

    function loadGarb(script=true, events=true, tie=true) {
        setMega();
        if(script) defineGarb();
        if(events) defineGarbEvents();
        if(tie)defineTieVars();
    }

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
        setMega();
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
        } else if (firstItem in getComputedStyle(ele)) {
            key.add('style');
            firstVal = (T) => getComputedStyle(T)[firstItem];
            firstPlace = (T, V) => { T.style += `;${firstItem}: ${V};`; };
        } else if (/--\S+/.test(firstItem)) {
            key.add('style');
            firstVal = (T) => getComputedStyle(T).getPropertyValue(firstItem);
            firstPlace = (T, V) => { T.style.setProperty(firstItem, V) };
        } else if (mega.has(firstItem)) {
            key.add(firstItem);
            firstVal = (T) => T[firstItem];
            firstPlace = (T, V) => { T[firstItem] = V; };
        } else { console.error(firstItem); console.error(ele) }

        if (/data-\S+/.test(secondItem)) {
            key.add(secondItem);
            let strin = /data-(\S+)/.exec(secondItem)[1];
            secondVal = (T) => T.dataset[strin];
            secondPlace = (T, V) => { T.dataset[strin] = V; };
        } else if (secondItem in getComputedStyle(ele)) {
            key.add('style');
            secondVal = (T) => getComputedStyle(T)[secondItem];
            secondPlace = (T, V) => { T.style += `;${secondItem}: ${V};`; };
        } else if (/--\S+/.test(secondItem)) {
            key.add('style');
            secondVal = (T) => getComputedStyle(T).getPropertyValue(secondItem);
            secondPlace = (T, V) => { T.style.setProperty(secondItem, V) };
        } else if (mega.has(secondItem)) {
            key.add(secondItem);
            secondVal = (T) => T[secondItem];
            secondPlace = (T, V) => { T[secondItem] = V; };
        } else if (/"[^"]+"\?/.test(secondItem)) {
            firstPlace(ele, /"([^"]+)"\?/.exec(secondItem)[1]);
            secondItem = firstVal(ele);
            secondVal = (T) => secondItem;
            secondPlace = (T, V) => { console.error("unable to store value in imm"); };
        } else if (/"[^"]+"/.test(secondItem)) {
            secondVal = (T) => /"([^"]+)"/.exec(secondItem)[1];
            secondPlace = (T, V) => { console.error("unable to store value in imm"); };
        } else { console.error(secondItem); console.error(ele) }
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
    function defineGarbEvents() {
        customElements.define('garb-events', class RegEvents extends HTMLElement {
            constructor() {
                super();
                this.innerText.split(/(?<=])\s*?(?=\{)/).map(E => {
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
            }
        });
    }

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

            }
        });
    }


    function defineTieVars() {
        tieVarsInterface = (selector, primativeJobs) => {
            if (selector in TieVarsRecord) {
                console.warn('die');
            }
            else {
                TieVarsRecord[selector] = [];
            }
            let jobs = {};
            primativeJobs.map(([elementAttribute, stylePropertyVar]) => {
                if (/data-(\S+)/.test(elementAttribute)) {
                    let DataAttribute = /data-(\S+)/.exec(elementAttribute)[1];
                    jobs[elementAttribute] = (e) => { e.style.setProperty(stylePropertyVar, e.dataset[DataAttribute]); };
                }
                else
                    jobs[elementAttribute] = (e) => e.style.setProperty(stylePropertyVar, e[elementAttribute]);
            });
            let elements = document.querySelectorAll(selector);
            elements.forEach(E => {
                const observeAttribute = new MutationObserver(muts => {
                    muts.forEach(mut => { if (mut.attributeName in jobs) jobs[mut.attributeName](E); });
                });
                TieVarsRecord[selector].push([E.id, E, observeAttribute]);
                observeAttribute.observe(E, { attributes: true, childList: true });
            }
            );

        };
        tieVarsOfString = (text) => {
            //split between a closing ] and an opening {
            text.split(/(?<=])\s*?(?=\{)/).map(E => {
                let _; //for garbage
                let work, selector;
                {
                    let workString;
                    //get {...this...}[...and this...;]
                    [_, selector, workString] = /\s*?{([^\{\}]+?)}\s*?\[\s*?([^\[\]]+?)\s*?;\s*?\]/gms.exec(E);
                    //every line as an array
                    work = workString.split(/[\s\n]*?;[\s\n]*?/gms);
                }


                let jobs = {};
                work.map(W => {
                    let stylePropertyVar, elementAttribute;
                    [_, _, stylePropertyVar, _, elementAttribute] = W.split(' ');
                    console.log(stylePropertyVar, _, elementAttribute)
                    if (/data-(\S+)/.test(elementAttribute)) {
                        let DataAttribute = /data-(\S+)/.exec(elementAttribute)[1];
                        jobs[elementAttribute] = (e) => e.style.setProperty(stylePropertyVar, e.dataset[DataAttribute]);
                    }
                    else
                        jobs[elementAttribute] = (e) => e.style.setProperty(stylePropertyVar, e[elementAttribute]);
                });
                //get elements by selector
                let ellList = document.querySelectorAll(selector);


                if (selector in TieVarsRecord) {
                    console.warn(`selector '${selector}' appears at least twice in code. bindings will be stored in the format ${selector}(%)`);
                }
                TieVarsRecord[selector] = [];
                ellList.forEach((E, i) => {
                    const observeAttribute = new MutationObserver(muts => {
                        muts.forEach(mut => { if (mut.attributeName in jobs) jobs[mut.attributeName](E); });
                    });
                    TieVarsRecord[selector].push([E.id, E, observeAttribute]);
                    observeAttribute.observe(E, { attributes: true, childList: true });
                });
            })
        };

        customElements.define('tie-vars', class tieVars extends HTMLElement {
            constructor() {
                //if its required then why do i have to type it
                super();
                //catch all tie vars element inner strings and apply language
                const observer = new MutationObserver(M => {
                    //dumb shit
                    let _;
                    let text = this.innerText
                    for (let m of M) if (!(m.addedNodes.length && m.addedNodes[0].nodeType == 3)) observer.disconnect();
                    if (!text) return;
                    //now we do stuff
                    tieVarsOfString(text);
                });
                observer.observe(this, { childList: true });
            }
        });
        destroyTieVars = (selector) => {
            TieVarsRecord[selector].map(([_, __, obs]) => { obs.disconnect(); });
            TieVarsRecord[selector].map(E => delete E);
            delete TieVarsRecord[selector];
        };
    }

}
