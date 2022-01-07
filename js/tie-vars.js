defineTieVarsFlag = true;
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
            tieVarsOfString(this.innerText);
            this.outerHTML = '';
        }
    });
    destroyTieVars = (selector) => {
        TieVarsRecord[selector].map(([_, __, obs]) => { obs.disconnect(); });
        TieVarsRecord[selector].map(E => delete E);
        delete TieVarsRecord[selector];
    };
}