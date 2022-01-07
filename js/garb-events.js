

defineGarbEventsFlag = true;
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
            this.outerHTML = '';
        }
    });
}
