/*
todo:
timed events 
do not dispose char in regexv
data source and target database
keypress events
while structure
*/


class garbage {
    //for deciding where to attatch listeners
    static windowOnlyEvents = new Set(['resize', 'Fullscreen', 'load']);
    static documentProbablyEvents = new Set(['scroll']);
    //events stored here
    static regularEvents = {};
    //zip operator origin target
    static ziptt(a, b, c) {
        return a.map((k, i) => [k, [b[i]], [c[i]]]);
    }
    static ziptA(a, b, c) {
        return a.map((k, i) => [k, c.map(() => b[i]), c]);
    }
    static zipAH(a, b, c) {
        return a.map((k, i) => [k, b, c]);
    }

    //Bind to correct place
    static BindAny(Event, ele, fun) {
        if (Event in garbage.regularEvents)
            garbage.regularEvents[Event](ele, fun)
        else if (garbage.windowOnlyEvents.has(Event))
            window.addEventListener(Event, fun)
        else
            ele.addEventListener(Event, fun)
    }

    //determines the location of data and returns 
    //1  function to get it
    //2  function to store in location
    //3  the attributes where the data resides
    static lexLeftAndRight(firstItem, secondItem, ele) {
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
        }
        if (/data-\S+/.test(secondItem)) {
            key.add(secondItem);
            secondVal = (T) => T.dataset[/data-(\S+)/.exec(secondItem)[1]];
            secondPlace = (T, V) => { T.dataset[/data-(\S+)/.exec(secondItem)[1]] = V; };
        } else if (secondItem in ele) {
            key.add(secondItem);
            secondVal = (T) => T[secondItem];
            secondPlace = (T, V) => { T[secondItem] = V; };
        } else if (secondItem in getComputedStyle(ele)) {
            key.add('style');
            secondVal = (T) => getComputedStyle(T)[secondItem];
            secondPlace = (T, V) => { T.style += `;${secondItem}: ${V};`; };
        } else if (/"[^"]+"\?/.test(secondItem)) {
            firstPlace(ele, /"([^"]+)"\?/.exec(secondItem)[1]);
            secondItem = firstVal(ele);
            secondVal = (T) => secondItem;
            secondPlace = (T, V) => { console.error("unable to store value in imm"); };
        } else if (/"[^"]+"/.test(secondItem)) {
            secondVal = (T) => /"([^"]+)"/.exec(secondItem)[1];
            secondPlace = (T, V) => { console.error("unable to store value in imm"); };
        }
        return [firstVal, firstPlace, secondVal, secondPlace, Array.from(key)];
    }

    //return function to handle adding chars events stuff
    static lexRegisterChar(char) {
        let putter;
        if (/(\S)/.test(char)) {
            putter = (T) => { T }
        } else if (/\s+?(\S)\s+?to\s+?(\S)\s+?over\s+?(\S+?)s\s+?/.test(char)) {
        } else if (/immortal\s+?(\S)/.test(char)) {
        }
        else if (/immortal\s+?(\S)\s+?to\s+?(\S)\s+?over\s+?(\S+?)s\s+?/.test(char)) {
        }
    }


}




//define event tag
customElements.define('garb-events', class RegEvents extends HTMLElement {
    constructor() {
        super();
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length && mutation.addedNodes[0].nodeType == 3) {
                    //prevent text from being displayed
                    this.style += ';display: none;';
                    this.innerHTML = `<![CDATA[ ${mutation.addedNodes[0].nodeValue} ]]>`;
                    //find all constructors
                    mutation.addedNodes[0].nodeValue.split(/(?<=])\s*?(?=\{)/).map(E => {
                        //test the type and return the object
                        if (/\s*?\{([^\}]*?)\}\s*?\{([^\}]*?)\}\s*?\[\s*?([^\]]*?)\s*?;\s*?\]/gms.test(E)) {
                            let [_, name, expr, work] = /\s*?\{([^\}]*?)\}\s*?\{([^\}]*?)\}\s*?\[\s*?(\S+?[^\]]*?)\s*?;\s*?\]/gms.exec(E);
                            return { name: name, expr: new RegExp(expr), work: work.split(/\s*?\;\s*/m) };
                        }
                    }).forEach(E => {
                        //create a set of functions that attatch event listeners/mutation observers
                        let adders = E.work.map(W => {
                            //equality/inequality testers
                            let _, firstItem, secondItem, char, firstVal, firstPlace, secondVal, secondPlace, key, event, trigger;
                            if (/\s*?(\S+?)\s+?becomes\s+?("??[^"]+?"??\???)\s+?as\s+?(\S)\s*?/s.test(W)) {
                                [_, firstItem, secondItem, char] = /\s*?(\S+?)\s+?becomes\s+?("??[^"]+?"??\???)\s+?as\s+?(\S)\s*?/s.exec(W);
                                [firstVal, firstPlace, secondVal, secondPlace, key] = garbage.lexLeftAndRight(firstItem, secondItem, this);
                                trigger = (ele, callBacks) => {
                                    const observeListener = new MutationObserver(mutations => { if (firstVal(ele) == secondVal(ele)) fun(ele, callBacks); });
                                    observeListener.observe(ele, { attributes: true, attributeFilter: key });
                                };
                            } else if (/\s*?(\S+?)\s+?becomes\s+?not\s+?("??[^"]+?"??\???)\s+?as\s+?(\S)\s*?/s.test(W)) {
                                [_, firstItem, secondItem, char] = /\s*?(\S+?)\s+?becomes\s+?not\s+?("??[^"]+?"??\???)\s+?as\s+?(\S)\s*?/s.exec(W);
                                [firstVal, firstPlace, secondVal, secondPlace, key] = garbage.lexLeftAndRight(firstItem, secondItem, this);
                                trigger = (ele, callBacks, fun) => {
                                    const observeListener = new MutationObserver(mutations => { if (firstVal(ele) != secondVal(ele)) fun(ele, callBacks); });
                                    observeListener.observe(ele, { attributes: true, attributeFilter: key });
                                };
                            }
                            else if (/\s*?(\S+?)\s+?as\s+?(\S)\s*?/s.test(W)) {
                                [_, event, char] = /\s*?(\S+?)\s+?as\s+?(\S)\s*?/s.exec(W);
                                trigger = (ele, callBacks, fun) => { garbage.BindAny(event, ele, () => { fun(ele, callBacks); }); };
                            }
                            let fun = (ele, callBacks) => {
                                ele[`${E.name}-register`] += char;
                                ele[`${E.name}-counterArray`].push(++ele[`${E.name}-counter`]);
                                if (E.expr.test(ele[`${E.name}-register`])) {
                                    callBacks.forEach(CB => CB(ele));
                                    ele[`${E.name}-register`] = '';
                                    ele[`${E.name}-counterArray`] = [];
                                }
                            };
                            return (ele, callBacks) => trigger(ele, callBacks, fun);
                        });
                        //a function to attatch functions or just one more callback
                        garbage.regularEvents[E.name] = (ele, callBack) => {
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
        });
        observer.observe(this, { childList: true });
    }
});

customElements.define('garb-script', class GarbScript extends HTMLElement {
    constructor() {
        super();
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.addedNodes.length && mutation.addedNodes[0].nodeType == 3) {
                    //prevent display
                    this.style += ';display: none;';
                    this.innerHTML = `<![CDATA[ ${mutation.addedNodes[0].nodeValue} ]]>`;
                    mutation.addedNodes[0].nodeValue.split(/(?<=])\s*?(?=\{)/).map(E => {
                        //test type and infer data path as required
                        if (/\{[^\{\}]+?\}\s*?\{[^\{\}]+?\}\s*?\{[^\{\}]+?\}\s*?\(\s*?[At][tHA]\s*?\)\s*?\[\s*?[^\[\]]+?\s*?;\s*?\]/gs.test(E)) {
                            const [_, operator, origin, target, type, work] = /\{([^\{\}]+?)\}\s*?\{([^\{\}]+?)\}\s*?\{([^\{\}]+?)\}\s*?\(\s*?([At][tHA])\s*?\)\s*?\[\s*?([^\[\]]+?)\s*?;\s*?\]/gs.exec(E);
                            return { type: type, operator: operator, origin: origin, target: target, work: work.split(/\s*?\;\s*/m) };
                        } else if (/\{[^\{\}]+?\}\s*?\{[^\{\}]+?\}\s*?\{[^\{\}]+?\}\s*?\[\s*?[^\[\]]+?\s*?;\s*?\]/gs.test(E)) {
                            const [_, operator, origin, target, work] = /\{([^\{\}]+?)\}\s*?\{([^\{\}]+?)\}\s*?\{([^\{\}]+?)\}\s*?\[\s*?([^\[\]]+?)\s*?;\s*?\]/gs.exec(E);
                            return { type: 'AH', operator: operator, origin: origin, target: target, work: work.split(/\s*?\;\s*/m) };
                        } else if (/\{[^\{\}]+?\}\s*?\{[^\{\}]+?\}\s*?\[\s*?[^\[\]]+?\s*?;\s*?\]/gs.test(E)) {
                            const [_, origin, target, work] = /\{([^\{\}]+?)\}\s*?\{([^\{\}]+?)\}\s*?\[\s*?([^\[\]]+?)\s*?;\s*?\]/gs.exec(E);
                            return { type: 'tA', operator: origin, origin: origin, target: target, work: work.split(/\s*?\;\s*/m) };
                        } else if (/\{[^\{\}]+?\}\s*?\[\s*?[^\[\]]+?\s*?;\s*?\]/gs.test(E)) {
                            const [_, origin, work] = /\{([^\{\}]+?)\}\s*?\[\s*?([^\[\]]+?)\s*?;\s*?\]/gs.exec(E);
                            return { type: 'tt', operator: origin, origin: origin, target: origin, work: work.split(/\s*?\;\s*/m) };
                        } else { console.error(`you fucked up the selector ${E}`); }
                    }).forEach(Q => {
                        //retreive elements
                        let [operatorElements, originElements, targetElements] = Array.from([Q.operator, Q.origin, Q.target]).map((E) => document.querySelectorAll(E)).map((E) => Array.from(E));
                        let CallList, length;
                        //organize call list
                        switch (Q.type) {
                            case 'tt':
                                length = Math.min(operatorElements.length, originElements.length, targetElements.length);
                                CallList = garbage.ziptt(operatorElements.slice(0, length), originElements.slice(0, length), targetElements.slice(0, length));
                                break;
                            case 'tA':
                                length = Math.min(operatorElements.length, originElements.length);
                                CallList = garbage.ziptA(operatorElements.slice(0, length), originElements.slice(0, length), targetElements);
                                break;
                            case 'AH':
                                length = Math.min(originElements.length, targetElements.length);
                                CallList = garbage.zipAH(operatorElements, originElements.slice(0, length), targetElements.slice(0, length));
                                break;
                            default:
                                console.error(`${Q.type} not a valid type. type must be one of these: tt, tA, AH`);
                                return;
                        }
                        if (CallList.length == 0) { console.error(`An element selector failed to find any matches`); return; }

                        //handle every instruction and attatch event listener
                        Q.work.forEach(W => {
                            let _, firstItem, secondItem, ConditionEvent, workType;
                            if (/\s*?(\S+?)\s+?from\s+?("??[^"]+?"??\???)\s+?when\s+?(\S+)\s*/sm.test(W)) {
                                [_, firstItem, secondItem, ConditionEvent] = /\s*?(\S+?)\s+?from\s+?("??[^"]+?"??\???)\s+?when\s+?(\S+)\s*/sm.exec(W);
                                workType = 'from';
                            } else if (/\s*?swap\s+?([^"]+)\s+?([^"]+)\s+?when\s+?(\S+)\s*/sm.test(W)) {
                                [_, firstItem, secondItem, ConditionEvent] = /\s*?swap\s+?([^"]+)\s+?([^"]+)\s+?when\s+?(\S+)\s*/sm.exec(W);
                                workType = 'swap';
                            } else { console.error(`you fucked up the line ${W}`); return; }
                            let [firstVal, firstPlace, secondVal, secondPlace, key] = garbage.lexLeftAndRight(firstItem, secondItem, this);
                            if (workType == 'from')
                                CallList.forEach(([oper, origs, targs]) => {
                                    garbage.BindAny(ConditionEvent, oper, () => {
                                        origs.forEach((_, i) => {
                                            firstPlace(targs[i], secondVal(origs[i]));
                                        });
                                    });
                                });
                            else {
                                if (Q.type == 'tA') {
                                    CallList.forEach(([oper, origs, targs]) => {
                                        garbage.BindAny(ConditionEvent, oper, () => {
                                            origs.forEach((_, i) => {
                                                let temp = firstVal(targs[i]);
                                                firstPlace(targs[i], secondVal(targs[i]));
                                                secondPlace(targs[i], temp);
                                            });
                                        });
                                    });
                                } else {
                                    CallList.forEach(([oper, origs, targs]) => {
                                        garbage.BindAny(ConditionEvent, oper, () => {
                                            origs.forEach((_, i) => {
                                                let temp = firstVal(targs[i]);
                                                firstPlace(targs[i], secondVal(origs[i]));
                                                secondPlace(origs[i], temp);
                                            });
                                        });
                                    });
                                }
                            }
                        });
                    });
                }
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