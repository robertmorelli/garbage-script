
let destroyTieVars;
let tieVarsOfString;
let tieVarsInterface;
{
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
                        [_,_,stylePropertyVar,_,elementAttribute] = W.split(' ');
                        if(/data-(\S+)/.test(elementAttribute)){
                            let DataAttribute = /data-(\S+)/.exec(elementAttribute)[1];
                            jobs[elementAttribute] = (e) => e.style.setProperty(stylePropertyVar, e.dataset[DataAttribute]);
                        }
                        else
                            jobs[elementAttribute] = (e,m) => e.style.setProperty(stylePropertyVar, e[elementAttribute]);
                    });
                    //get elements by selector
                    document.querySelectorAll(selector).forEach(E => {
                        const observeAttribute = new MutationObserver(muts => {
                            muts.forEach(mut =>{ if(mut.attributeName in jobs) jobs[mut.attributeName](E); });
                        });
                        observeAttribute.observe(E, {attributes: true});
                    });
                })
            });
            observer.observe(this, { childList: true });
        }
    });
}