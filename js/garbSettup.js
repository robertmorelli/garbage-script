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

let DictionaryOfWords = [
    class call {
        constructor() { }
        key = [];
        static test(isThisMe) { return /\s*?call\s*/.test(isThisMe); }
        val(ele) { console.error('value of call doesnt make sense\n' + ele); }
        place(ele, val) { eval(val); }
    },
    class log {
        constructor() { }
        key = [];
        static test(isThisMe) { return /\s*?log\s*/.test(isThisMe); }
        val(ele) { console.error('value of log doesnt make sense\n' + ele); }
        place(ele, val) { console.log(val); }
    },
    class error {
        constructor() { }
        key = [];
        static test(isThisMe) { return /\s*?error\s*/.test(isThisMe); }
        val(ele) { console.error('value of error doesnt make sense\n' + ele); }
        place(ele, val) { console.error(val); }
    },
    class warn {
        constructor() { }
        key = [];
        static test(isThisMe) { return /\s*?warn\s*/.test(isThisMe); }
        val(ele) { console.error('value of warn doesnt make sense\n' + ele); }
        place(ele, val) { console.warn(val); }
    },
    class classlist {
        constructor() { }
        key = ['classList'];
        static test(isThisMe) { return /\s*?classListAdd\s*/.test(isThisMe) }
        val(ele) { console.error('value of classList doesnt make sense\n' + ele) }
        place(ele, val) { ele.classList.add(val) }
    },
    class dataItem {
        constructor() { }
        key = ['dataset'];
        data = '';
        static test(isThisMe) {
            if (/data-\S+/.test(isThisMe)) {
                this.key = [isThisMe];
                this.data = /data-(\S+)/.exec(isThisMe)[1];
                return true;
            }
            else return false;

        }
        val(ele) { ele.dataset['sd'] }
        place(ele, val) { ele.classList.add(val) }

        //firstPlace = (T, V) => { T.dataset[/data-(\S+)/.exec(firstItem)[1]] = V; };
    }

];






window.addEventListener('load', loadGarb);

let mega = new Set();

function setMega() {
    let addElementsToMega = (ele) => {
        for (let i in ele)
            mega.add(i);
        if (ele.children)
            Array.from(ele.children).forEach(addElementsToMega)
    }
    addElementsToMega(document.querySelector('body'));
}


function loadGarb() {
    console.log(new (DictionaryOfWords.filter(word => word.test("   classListAdd   ")))[0]);

    setMega();
    if (defineGarbFlag || false) defineGarb();
    if (defineGarbEventsFlag || false) defineGarbEvents();
    if (defineTieVarsFlag || false) defineTieVars();
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

