/*jslint es6:true*/
/*jslint maxerr: 10, es6, node, single, for, bitwise, for, multivar, this*/



/*
UCF Hierarchy
*************
1st Level: Factors (The Great Eight)
2nd Level: Dimentions
3rd Level: Components
4th Level: Behaviors
*/


this.window.ucf = (function (doc) {
    "use strict";
    
    var UCF_model = {
        
        ucf_framework: function () {
            
            var factors = {};
            
            this.utils.store = {
                domBits: {
                    //selector s
                    selector: doc.getElementById("SelectorGraphic"),
                    content: doc.getElementById("Content"),
                    factor_gs: doc.getElementById("Selector").querySelectorAll(".factor_group"),
                    s_factors: doc.getElementById("Selector").querySelectorAll(".factor_selector"),
                    c_factors: doc.getElementById("Content").querySelectorAll(".factor_content"),
                    c_slider: doc.getElementById("Content").querySelector(".slider")
                },
                vars: {
                    factorBaseClass: "factor_selector",
                    compBaseClass: "dim_selector",
                    c_baseClass: "factor_content",
                    selectionMade: false,
                    factorSelectionName: {
                        current: null,
                        last: null
                    },
                    compSelectionName: {
                        current: null,
                        last: null
                    }
                }
            };
            
            // First function call. 'this' == UCF_model
            // passing the currently empty container object
            // 'factors' to selectorLoop method.
            factors = this.utils.selectorLoop(factors);
            
            return factors;
        },
             
        utils: {
            
            iterArray: function (a, method, param) {
                var i;
                for (i = 0; i < a.length; i = i + 1) {
                    a[i][method](param);
                }
            },
            
            selectorLoop: function (sSet, parentObj) {
                var selectors,
                    content,
                    selectorName,
                    // * hCode convention 'xNum' variable name signafies 'number of' in set x    // where as xNo signafiyes numerical or idenifiying value x
                    selectorNum,
                    initArray = [],
                    i;
                
                // First the Factors dom elements are assigned to the 'selector' and 'content' container vars
                // then when the Factor object has been created the Compatency dom elements will be used to
                // create the Compatancy objects - which will be later added to the parent Factor object.
                if (this.compsTime) {
                    selectors = this.store.domBits.s_comps;
                    content = this.store.domBits.c_comps;
                } else {
                    selectors = this.store.domBits.s_factors;
                    content = this.store.domBits.c_factors;
                }

                // Each selector on the diagram shuold must have related content to show in the display area.
                // parityCheck compates 'selectors' and 'content' if they dont match it returns 0 – so the
                // following loop won't run and nothing happens. When Factors are being processed parityCheck
                // will return 8 ("The Great Eight"). The Compatancys varey between 2 and 3 in number.
                selectorNum = selectors.length;
                
                for (i = 0; i < selectorNum; i = i + 1) {
                    
                    // The svg selector (selectors[i]) and the related content (content[i]) passed to 'makeSelector' function.
                    // This contains the Constructor function and returns Factor or dimention object that is stored in 'sSet'
                    // (currently empty container object 'factors') as object with the name given by the "data-member-name"
                    // attribute of the svg selector group
                    selectorName = selectors[i].getAttribute("data-member-name");
                    sSet[selectorName] = this.makeSelector(selectorName, selectors[i], content[i], i);
                    
                   
                    // Properties that are specific to dimention selector added to selector object
                    if (this.compsTime) {
                        //sSet[selectorName].factorSelectorGroup = this.store.domBits.s_factors[i].parentNode;
                        sSet[selectorName].factorSelectorGroup = parentObj;

                    } else {
                        sSet[selectorName].compSelectorGroup = this.store.domBits.s_factors[i].parentNode.querySelector(".dim_selectors");
                        // Ask somone about this sSet is added to in each itteration but all the sSet objects
                        // contain the full set of factors in their .factors property.
                        sSet[selectorName].factors = sSet;
                    }
                    initArray.push(sSet[selectorName]);
                }
                if (this.compsTime) {
                    this.compsTime = false;
                }
                
                // iterates over array of objects and calls method of object
                // calls the iniation function and passes it the utilitys
                this.iterArray(initArray, "init", this);
                return sSet;
            },
            
            compsTime: false,
            
            setListeners: function (ele, evnt, callback) {
                var i;
                
                for (i = 0; i < evnt.length; i = i + 1) {
                    ele.addEventListener(evnt[i], callback, false);
                }
            },
            
            // this function declaration is passed to the Selector...
            // so, within the function 'this' points to the Selector object not the 'utils'
            setStatus: function (s, selector) {
                
                var states,
                    lastSelectionName,
                    currentSelectionName = selector.name;
                
                function initialise(selected) {
                    var boolAray = [["", "selectionMade"], ["slider in", "slider out"], [false, true]];
                    selector.utils.store.domBits.selector.setAttribute("class", boolAray[0][selected]);
                    selector.utils.store.domBits.c_slider.setAttribute("class", boolAray[1][selected]);
                    selector.utils.store.vars.selectionMade = boolAray[2][selected];
                    if (boolAray[2][selected]) {
                        selector.utils.store.vars.factorSelectionName.current = selector.name;
                    }
                }
                
                function compDeselect(target) {
                    var targetComps,
                        selectedComps = selector.utils.store.vars.compSelectionName.current;
                    
                    if (target === undefined) {
                        target = selector;
                    }
                        
                    if (target.type === "factor") {
                        targetComps = target.comps[selectedComps];
                    } else {
                        targetComps = target;
                    }
                    
                    if (selectedComps !== null) {
                        selector.status("inactive", targetComps);
                        selector.utils.store.vars.compSelectionName.current = null;
                    }
                }
                
                function factorIconCallback() {
                    
                    var lastSelector = selector.utils.store.vars.factorSelectionName.last;
                    
                    if (selector.factors[lastSelector]) {
                        selector.factors[lastSelector].factorIcon.style.display = "none";
                    }
                }
                    
                states = {
                    inactive: function () {
                        selector.pgEle.setAttribute("class", selector.baseClass);
                        if (selector.type === "factor") {
                            selector.compSelectorGroup.setAttribute("class", "dim_selectors");
                            
                        } else {
                            //selector.content.style.maxHeight = "30px";
                        }
                        selector.content.classList.remove("show");
                        selector.selected = false;
                        return "inactive";
                    },
                    over: function () {
            
                        selector.pgEle.setAttribute("class", selector.baseClass + " highlight");
                        
                        // if the user has selected the currently selected selector
                        // this block will return the system to initial state.
                        if (selector.selected) {
                            
                            if (selector.type === "factor") {
                                selector.compSelectorGroup.setAttribute("class", "dim_selectors");
                                selector.factorGroup.setAttribute("class", "factor_group");
                                initialise(0);
                            } else {
                                selector.content.setAttribute("class", "dim_content");
                            }
                            compDeselect();
            
                            selector.selected = false;
                            return "highlighted";
                        }
                    },
                    selected: function () {
                        
                        selector.pgEle.setAttribute("class", selector.baseClass + " selected");
                        
                        if (selector.type === "factor") {
                            
                            // if there is curently no Factor (and therefore nothing) selected, i.e. the system is in intialised state and the
                            // first selection of a factor selector has just been made, add selectionMade class to
                            // selector graphic, push out slider and set selectionMade variable to true.
                            // -Else ...
                           
                            if (!selector.utils.store.vars.selectionMade) {
                                initialise(1);
                            } else {
                                
                                // variable storing current and priviouse Factor selections updated
                                lastSelectionName = selector.utils.store.vars.factorSelectionName.current;
                                selector.utils.store.vars.factorSelectionName.last = lastSelectionName;
                                selector.utils.store.vars.factorSelectionName.current = currentSelectionName;
                                
                                // Deselect the previously selected selector and its competencies
                                selector.status("inactive", selector.factors[lastSelectionName]);
                                compDeselect(selector.factors[lastSelectionName]);
                                selector.factors[lastSelectionName].factorGroup.setAttribute("class", "factor_group");
                            }
        
                            // shows the compatancy ring: adds the 'show' class so g.dim_selectors
                            // is scale(1) and is apperrs from beind masking parent group
                            selector.compSelectorGroup.setAttribute("class", "dim_selectors show");
                            
                            // toggles on the "sellected" class of the enclosing factor group group
                            selector.factorGroup.setAttribute("class", "factor_group selected");
                            
                            
                            if (selector.factorIcon) {
                                selector.factorIcon.addEventListener("transitionend", factorIconCallback, false);
                                selector.factorIcon.style.display = "inline";
                            }
                            //siblingDeselect(selector.factors);
                            
                        } else {
                            
                            // user has selected a Compatancy of the current Factor. If it is the first selection
                            // 'compSelectionName.current' is null and the 'compDeselect' function call will do nothing
                            // should I put an if here?
                            
                            lastSelectionName = selector.utils.store.vars.compSelectionName.current;
                            compDeselect(selector.factorSelectorGroup.comps[lastSelectionName]);

                            // Current and Last variables updated.
                            selector.utils.store.vars.compSelectionName.last = lastSelectionName;
                            selector.utils.store.vars.compSelectionName.current = selector.name;
                            
                            // Displayes the compatancy discription below the heading animated with css transiton
                            //selector.content.style.maxHeight = selector.content.scrollHeight + "px";
                            //selector.content.classList.add(;
                        }
                        selector.content.classList.add("show");
                        selector.selected = true;
                        
                        return "selected";
                    }
                };
                
                states[s]();
            },
 
            makeSelector: function (sN, sDA, cDA) {

                // This constructor function is used for the Factor objects and the
                // is children objects the Compatancy objects
                function Selector(setStatus) {
                    this.name = sN;
                    this.pgEle = sDA;
                    this.content = cDA;
                    this.status = setStatus;
                    this.selected = false;
                    // this property object is the containor for the Compatancy child objects
                    // its later deleted from the Compatancy child objects.
                    this.comps = {};
                }
                    
                //monitor baseClass - is it optimal? or good enough
                Selector.prototype.baseClass = function () {
                    this.baseClass = this.pgEle.className.baseVal;
                    if (this.baseClass === "factor_selector") {
                        this.type = "factor";
                    } else if (this.baseClass === "dim_selector") {
                        this.type = "dimention";
                    } else if (this.baseClass === "com_selector") {
                        this.type = "dimention";
                    } else {
                        this.type = "unclassified";
                    }
                    return this.baseClass;
                };

                Selector.prototype.handleEvent = function (e) {

                    switch (e.type) {

                    case "mouseenter":

                        if (!this.selected) {
                            this.status("over", this);
                        }
                        break;

                    case "mouseleave":

                        if (!this.selected) {
                            this.status("inactive", this);
                        }
                        break;

                    case "mousedown":

                        if (this.selected) {
                            this.status("over", this);
                        } else {
                            this.status("selected", this);
                        }
                        break;
                    }
                };

                Selector.prototype.init = function (utils) {

                    utils.setListeners(this.pgEle, ["mousedown", "mouseleave", "mouseenter"], this);

                    this.baseClass();

                    if (this.baseClass === "factor_selector") {
                        utils.compsTime = true;
                        utils.store.domBits.s_comps = this.pgEle.parentNode.querySelectorAll(".dim_selector");
                        utils.store.domBits.c_comps = this.content.querySelectorAll(".dim_content");
                        this.factorGroup = this.pgEle.parentNode;
                        this.factorIcon = this.factorGroup.querySelector(".factorIcon");
                        this.comps = utils.selectorLoop(this.comps, this);
                    } else {
                        delete this.comps;
                    }

                    this.utils = utils;
                };

                // calls the Constructor – passing it the 'setStatus' method
                return new Selector(this.setStatus);
            }
        }
    };
    
    ///COMPLEATLY UNITERGATED ADTIONAL FUNCIOALIT TO REIELS THE COMPONENT DEATLIS!!!!
    
    var coms = doc.querySelectorAll(".components h2"),
        articles = doc.querySelectorAll(".components .com_content"),
        comNum = coms.length,
        behaviour;
    
    function showCom() {
        console.log(this.nextElementSibling.classList);
        if (this.nextElementSibling.classList.contains("show")) {
            this.nextElementSibling.classList.remove("show");
            this.classList.remove("show");
        } else {
            comNum = coms.length;
            while (comNum--) {
                articles[comNum].classList.remove("show");
                coms[comNum].classList.remove("show");
            }
            this.nextElementSibling.classList.add("show");
            this.classList.add("show");
        }
        
        
    }
    
    while (comNum--) {
//        comNum;
        console.log(coms[comNum]);
        
        coms[comNum].addEventListener("click", showCom, true);
    }
    
    return UCF_model.ucf_framework();
    
}(this.document));