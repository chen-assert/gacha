
let tooltip = {
    timeout: 0,
    element: null,
    contentFunc: null,
}
function registerTooltip(element, contentFunc) {
    element.addEventListener("pointerenter", () => {
        clearTimeout(tooltip.timeout);
        document.body.addEventListener("pointermove", updateTooltipPos);
        tooltip.element = element;
        tooltip.contentFunc = contentFunc;
        tooltip.timeout = setTimeout(() => {
            elms.tooltip.innerHTML = "";
            contentFunc(elms.tooltip);
            elms.tooltip.classList.add("active");
        }, elms.tooltip.classList.contains("active") ? 0 : 300);
    });
    element.addEventListener("pointerleave", () => {
        clearTimeout(tooltip.timeout);
        document.body.removeEventListener("pointermove", updateTooltipPos);
        tooltip.element = tooltip.contentFunc = null
        tooltip.timeout = setTimeout(() => {
            elms.tooltip.classList.remove("active");
        }, 100);
    });
}
function registerTooltipEvent(event) {
    if (!tooltip.element) return;
    let elm = tooltip.element;
    let callback = () => {
        requestAnimationFrame(() => tooltip.contentFunc(elms.tooltip));
    }
    let leave = () => {
        removeEvent(event, callback);
        elm.removeEventListener("pointerleave", leave);
    }
    addEvent(event, callback);
    elm.addEventListener("pointerleave", leave);
}


function updateTooltipPos(ev) {
    let inset = { top: "auto", left: "auto", bottom: "auto", right: "auto" };

    if (ev.clientX < window.innerWidth / 2) inset.left = ev.clientX + "px";
    else inset.right = window.innerWidth - ev.clientX + "px";
    if (ev.clientY < window.innerHeight / 2) inset.top = ev.clientY + "px";
    else inset.bottom = window.innerHeight - ev.clientY + "px";

    elms.tooltip.style.inset = inset.top + " " + inset.right + " " + inset.bottom + " " + inset.left;
}

let tooltipTemplates = {
    card (pack, rarity, id, mode = null) {
        let data = cards[pack][rarity][id];
        return (tooltip) => {
            registerTooltipEvent("card-update");
            let state = game.cards[pack]?.[rarity]?.[id];

            let level = 1, stars = 1;
            if (state) ({level, stars} = state);
            let curFx = [], newFx = null;
            fx = (x) => curFx[x];
            for (let f of data.effects) curFx.push(f(level, stars));

            if (mode == "level-up") {
                newFx = [];
                fx = (x) => newFx[x];
                for (let f of data.effects) newFx.push(f(level + 1, stars));
            } else if (mode == "star-up") {
                newFx = [];
                fx = (x) => newFx[x];
                for (let f of data.effects) newFx.push(f(level, stars + 1));
            }

            tooltip.innerHTML = `
                <div class="tooltip-header">
                    <h2><rarity rarity="${rarity}"></rarity> ${data.name}</h2>
                    <small>${state ? `
                        ${data.crown 
                            ? ``
                            : `(<span class="number">+${format(state.amount)}</span> extra copies)<br>`
                        }
                        ${data.crown 
                            ? `(crown card)`
                            : `(<span class="number">${format(state.stars)}/${format(5)}</span> stars)`
                        }
                        ${data.levelCost ? data.maxLevel
                            ? `(level <span class="number">${format(state.level)}/${format(data.maxLevel)}</span>)`
                            : `(level <span class="number">${format(state.level)}</span>)`
                            : ``
                        }
                    ` : `
                        (card not yet owned)
                    `}</small>
                </div>
                <div>
                    ${format.effect(data.desc, curFx, newFx)}
                </div>
            `

            if (mode == "level-up") {
                if (!data.levelCost) {
                    tooltip.innerHTML += `<div class="tooltip-action">
                        This card can not be upgraded.
                    </div>`
                } else if (data.maxLevel && state.level >= data.maxLevel) {
                    tooltip.innerHTML += `<div class="tooltip-action">
                        Max level reached.
                    </div>`
                } else {
                    let levelCost = getCardLevelCost(pack, rarity, id);
                    let canLevelUp = game.res[levelCost[1]] >= levelCost[0];
                    let name = currencies[levelCost[1]].name;
                    tooltip.innerHTML += `<div class="tooltip-formula"> 
                        <h4>Upgrade cost:</h4>
                        <div><span>${name}</span>${$number(format(game.res[levelCost[1]]) + " / " + format(levelCost[0]))}</div>
                    </div><div class="tooltip-action">
                        ${canLevelUp ? "Click to upgrade." : "Insufficient " + name + "."}
                    </div>`
                }
            } else if (mode == "star-up") {
                if (data.crown) {
                    tooltip.innerHTML += `<div class="tooltip-action">
                        This card can not be fused.
                    </div>`
                } else if (state.star >= 5) {
                    tooltip.innerHTML += `<div class="tooltip-action">
                        Max star reached.
                    </div>`
                } else {
                    let starCost = getCardStarCost(pack, rarity, id);
                    let canStarUp = state.amount >= starCost;
                    tooltip.innerHTML += `<div class="tooltip-formula"> 
                        <h4>Fusion cost:</h4>
                        <div><span>Extra copies</span>${$number(format(state.amount) + " / " + format(starCost))}</div>
                    </div><div class="tooltip-action">
                        ${canStarUp ? "Click to fuse." : "Insufficient copies."}
                    </div>`
                }
            } else {
                tooltip.innerHTML += `<div class="tooltip-quote">
                    “${data.quote}“
                </div>`
            }
        }
    }
}