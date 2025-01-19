

const SAVE_KEY = "gacha";

function getNewGame() {
    return {
        res: {
            points: 0,
            shreds: 0,
            energy: 0,

            fire: 0,
            water: 0,
            leaf: 0,
            sun: 0,
            moon: 0,
        },
        time: {
            now: Date.now(),
            drawCooldown: 0,
        },
        stats: {
            timePlayed: 0,
            cardsDrawn: 0
        },
        cards: {},
        drawPref: {
            faction: ""
        },
        option: {
            notation: "default",
            music: "",
        },
    }
}