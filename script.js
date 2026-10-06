// ==========================================
// HEART2HEART
// RESPONSIVE DIGITAL LOVE LETTER
// ==========================================

const canvas = document.getElementById("canvas");
const SVG_NS = "http://www.w3.org/2000/svg";


// ==========================================
// PAGE SETTINGS
// ==========================================

const LEFT_MARGIN = 30;
const RIGHT_MARGIN = 30;

const TOP_MARGIN = 40;

const LETTER_HEIGHT = 80;
const LINE_HEIGHT = 88;

const LETTER_GAP = 3;
const SPACE_WIDTH = 35;


// ==========================================
// LETTER WIDTH SETTINGS
// ==========================================

// Very fast typing = extremely narrow
const MIN_TIME = 50;
const MIN_STRETCH = 0.12;

// Long pause = dramatically wide
const MAX_TIME = 1500;
const MAX_STRETCH = 10;


// ==========================================
// CURSOR SETTINGS
// ==========================================

const CURSOR_GAP = 12;
const CURSOR_SCALE = 1;


// ==========================================
// CURSOR BLINK SETTINGS
// ==========================================

const BLINK_FAST = 320;
const BLINK_SLOW = 1100;

// Cursor stays fast initially
const SLOWDOWN_START = 1200;

// Gradually reaches slowest blink
const SLOWDOWN_END = 4500;


// ==========================================
// CURRENT WRITING POSITION
// ==========================================

let cursorX = LEFT_MARGIN;
let cursorY = TOP_MARGIN;

let lastKeyTime = null;

let history = [];


// ==========================================
// SVG FILE MAP
// ==========================================

const glyphFiles = {

    // LETTERS

    A: "./glyphs/A.svg",
    B: "./glyphs/B.svg",
    C: "./glyphs/C.svg",
    D: "./glyphs/D.svg",
    E: "./glyphs/E.svg",
    F: "./glyphs/F.svg",
    G: "./glyphs/G.svg",
    H: "./glyphs/H.svg",
    I: "./glyphs/I.svg",
    J: "./glyphs/J.svg",
    K: "./glyphs/K.svg",
    L: "./glyphs/L.svg",
    M: "./glyphs/M.svg",
    N: "./glyphs/N.svg",
    O: "./glyphs/O.svg",
    P: "./glyphs/P.svg",
    Q: "./glyphs/Q.svg",
    R: "./glyphs/R.svg",
    S: "./glyphs/S.svg",
    T: "./glyphs/T.svg",
    U: "./glyphs/U.svg",
    V: "./glyphs/V.svg",
    W: "./glyphs/W.svg",
    X: "./glyphs/X.svg",
    Y: "./glyphs/Y.svg",
    Z: "./glyphs/Z.svg",


    // NUMBERS

    "0": "./glyphs/0.svg",
    "1": "./glyphs/1.svg",
    "2": "./glyphs/2.svg",
    "3": "./glyphs/3.svg",
    "4": "./glyphs/4.svg",
    "5": "./glyphs/5.svg",
    "6": "./glyphs/6.svg",
    "7": "./glyphs/7.svg",
    "8": "./glyphs/8.svg",
    "9": "./glyphs/9.svg",


    // PUNCTUATION

    "'": "./glyphs/apostrophe.svg",
    '"': "./glyphs/quotation.svg",

    ",": "./glyphs/comma.svg",
    ".": "./glyphs/period.svg",

    ":": "./glyphs/colon.svg",
    ";": "./glyphs/semicolon.svg",

    "?": "./glyphs/question.svg",
    "!": "./glyphs/exclamation.svg",


    // SYMBOLS

    "+": "./glyphs/plus.svg",
    "-": "./glyphs/hyphen.svg",
    "=": "./glyphs/equals.svg",
    "_": "./glyphs/underscore.svg",

    "%": "./glyphs/percent.svg",
    "$": "./glyphs/dollar.svg",
    "#": "./glyphs/hash.svg",
    "*": "./glyphs/asterisk.svg",

    "^": "./glyphs/caret.svg",
    "|": "./glyphs/vertical-bar.svg",

    "@": "./glyphs/at.svg",
    "&": "./glyphs/ampersand.svg",


    // SLASHES

    "/": "./glyphs/slash.svg",
    "\\": "./glyphs/backslash.svg",


    // ANGLE BRACKETS

    "<": "./glyphs/less-than.svg",
    ">": "./glyphs/greater-than.svg",


    // PARENTHESES

    "(": "./glyphs/left-parenthesis.svg",
    ")": "./glyphs/right-parenthesis.svg",


    // SQUARE BRACKETS

    "[": "./glyphs/left-square-bracket.svg",
    "]": "./glyphs/right-square-bracket.svg",


    // CURLY BRACES

    "{": "./glyphs/left-curly-brace.svg",
    "}": "./glyphs/right-curly-brace.svg"
};


// ==========================================
// LOAD SVG
// ==========================================

async function loadSVG(file) {

    const response = await fetch(file);

    if (!response.ok) {

        console.error(
            "Could not load:",
            file
        );

        return null;
    }


    const svgText =
        await response.text();


    const parser =
        new DOMParser();


    const svgDocument =
        parser.parseFromString(
            svgText,
            "image/svg+xml"
        );


    return svgDocument.documentElement;
}


// ==========================================
// SVG STORAGE
// ==========================================

const glyphs = {};

let cursorSource = null;


// ==========================================
// LOAD EVERYTHING
// ==========================================

async function loadEverything() {

    const characters =
        Object.keys(glyphFiles);


    await Promise.all(

        characters.map(

            async function (character) {

                glyphs[character] =
                    await loadSVG(
                        glyphFiles[character]
                    );
            }

        )

    );


    cursorSource =
        await loadSVG(
            "./glyphs/cursor.svg"
        );


    if (cursorSource) {

        createCursor();
    }


    console.log(
        "Heart2Heart loaded!"
    );
}


loadEverything();


// ==========================================
// TYPING TIME → LETTER WIDTH
// ==========================================

function getStretch(interval) {

    const time =
        Math.min(
            Math.max(
                interval,
                MIN_TIME
            ),
            MAX_TIME
        );


    let amount =
        (
            time -
            MIN_TIME
        )
        /
        (
            MAX_TIME -
            MIN_TIME
        );


    // More variation throughout
    // normal typing speeds

    amount =
        Math.pow(
            amount,
            1.1
        );


    return (
        MIN_STRETCH +
        amount *
        (
            MAX_STRETCH -
            MIN_STRETCH
        )
    );
}


// ==========================================
// KEEP STROKE THICKNESS CONSTANT
// ==========================================

function preserveStrokeWidth(element) {

    const selectors =
        "path, line, polyline, polygon, circle, ellipse, rect";


    if (
        element.matches &&
        element.matches(selectors)
    ) {

        element.setAttribute(
            "vector-effect",
            "non-scaling-stroke"
        );
    }


    if (element.querySelectorAll) {

        element
            .querySelectorAll(selectors)
            .forEach(

                function (shape) {

                    shape.setAttribute(
                        "vector-effect",
                        "non-scaling-stroke"
                    );
                }

            );
    }
}


// ==========================================
// CURSOR
// ==========================================

let cursorGroup = null;

let cursorPauseStart =
    performance.now();

let lastBlinkTime =
    performance.now();

let cursorVisible = true;


// ==========================================
// CREATE CURSOR
// ==========================================

function createCursor() {

    if (!cursorSource) {
        return;
    }


    cursorGroup =
        document.createElementNS(
            SVG_NS,
            "g"
        );


    Array.from(
        cursorSource.children
    ).forEach(

        function (child) {

            const copy =
                document.importNode(
                    child,
                    true
                );


            preserveStrokeWidth(
                copy
            );


            cursorGroup.appendChild(
                copy
            );
        }

    );


    canvas.appendChild(
        cursorGroup
    );


    cursorPauseStart =
        performance.now();


    lastBlinkTime =
        performance.now();


    cursorVisible = true;


    animateCursor();
}


// ==========================================
// ANIMATE CURSOR
// ==========================================

function animateCursor() {

    if (
        !cursorGroup ||
        !cursorSource
    ) {

        return;
    }


    const now =
        performance.now();


    const pausedFor =
        now -
        cursorPauseStart;


    // ======================================
    // SMOOTH PROGRESSIVE BLINK SLOWDOWN
    // ======================================

    let blinkSpeed =
        BLINK_FAST;


    if (
        pausedFor >
        SLOWDOWN_START
    ) {

        let progress =
            (
                pausedFor -
                SLOWDOWN_START
            )
            /
            (
                SLOWDOWN_END -
                SLOWDOWN_START
            );


        progress =
            Math.min(
                Math.max(
                    progress,
                    0
                ),
                1
            );


        // Smooth easing

        progress =
            progress *
            progress *
            (
                3 -
                2 * progress
            );


        blinkSpeed =
            BLINK_FAST +
            (
                BLINK_SLOW -
                BLINK_FAST
            )
            *
            progress;
    }


    // ======================================
    // BLINK CURSOR
    // ======================================

    if (
        now -
        lastBlinkTime >=
        blinkSpeed
    ) {

        cursorVisible =
            !cursorVisible;


        lastBlinkTime =
            now;
    }


    cursorGroup.style.opacity =
        cursorVisible
            ? "1"
            : "0";


    // ======================================
    // CURSOR SIZE
    // ======================================

    const viewBox =
        cursorSource.viewBox.baseVal;


    const baseScale =
        LETTER_HEIGHT /
        viewBox.height;


    const finalScale =
        baseScale *
        CURSOR_SCALE;


    const centreX =
        viewBox.x +
        viewBox.width / 2;


    const centreY =
        viewBox.y +
        viewBox.height / 2;


    // ======================================
    // CURSOR POSITION
    // ======================================

    const anchorX =
        cursorX +
        CURSOR_GAP;


    const anchorY =
        cursorY +
        LETTER_HEIGHT / 2;


    cursorGroup.setAttribute(

        "transform",

        `
        translate(${anchorX} ${anchorY})
        scale(${finalScale})
        translate(${-centreX} ${-centreY})
        `
    );


    // Keep cursor above letters

    canvas.appendChild(
        cursorGroup
    );


    ensureCursorVisible();


    requestAnimationFrame(
        animateCursor
    );
}


// ==========================================
// RESET CURSOR AFTER KEYSTROKE
// ==========================================

function resetCursor() {

    cursorPauseStart =
        performance.now();


    lastBlinkTime =
        performance.now();


    cursorVisible =
        true;


    if (cursorGroup) {

        cursorGroup.style.opacity =
            "1";
    }
}


// ==========================================
// AUTOMATIC PAGE SCROLL
// ==========================================

let lastScrollLine = -1;


function ensureCursorVisible() {

    const currentLine =
        Math.round(
            (
                cursorY -
                TOP_MARGIN
            )
            /
            LINE_HEIGHT
        );


    const cursorOnScreen =
        cursorY -
        window.scrollY;


    const safeBottom =
        window.innerHeight *
        0.75;


    if (
        cursorOnScreen >
        safeBottom &&
        currentLine !==
        lastScrollLine
    ) {

        lastScrollLine =
            currentLine;


        window.scrollTo({

            top:
                Math.max(
                    0,

                    cursorY -
                    window.innerHeight *
                    0.55
                ),

            behavior:
                "smooth"
        });
    }
}


// ==========================================
// CANVAS HEIGHT
// ==========================================

function updateCanvasHeight() {

    const requiredHeight =
        cursorY +
        LINE_HEIGHT +
        150;


    const minimumHeight =
        window.innerHeight;


    canvas.setAttribute(

        "height",

        Math.max(
            requiredHeight,
            minimumHeight
        )

    );
}


// ==========================================
// DRAW CHARACTER
// ==========================================

function drawGlyph(
    character,
    interval
) {

    const sourceSVG =
        glyphs[character];


    if (!sourceSVG) {
        return;
    }


    // ======================================
    // SVG DIMENSIONS
    // ======================================

    const viewBox =
        sourceSVG.viewBox.baseVal;


    const originalWidth =
        viewBox.width;


    const originalHeight =
        viewBox.height;


    // ======================================
    // TYPING RHYTHM → WIDTH
    // ======================================

    const stretch =
        getStretch(
            interval
        );


    const scaleY =
        LETTER_HEIGHT /
        originalHeight;


    const scaleX =
        scaleY *
        stretch;


    const baseWidth =
        originalWidth *
        scaleY;


    const newWidth =
        baseWidth *
        stretch;


    // ======================================
    // AUTOMATIC LINE WRAP
    // ======================================

    const availableWidth =
        window.innerWidth -
        RIGHT_MARGIN;


    if (
        cursorX !==
        LEFT_MARGIN
        &&
        cursorX +
        newWidth +
        CURSOR_GAP >
        availableWidth
    ) {

        cursorX =
            LEFT_MARGIN;


        cursorY +=
            LINE_HEIGHT;


        updateCanvasHeight();
    }


    const startX =
        cursorX;


    const startY =
        cursorY;


    // ======================================
    // CREATE GLYPH
    // ======================================

    const group =
        document.createElementNS(
            SVG_NS,
            "g"
        );


    // ======================================
    // COPY SVG ARTWORK
    // ======================================

    Array.from(
        sourceSVG.children
    ).forEach(

        function (child) {

            const copy =
                document.importNode(
                    child,
                    true
                );


            preserveStrokeWidth(
                copy
            );


            group.appendChild(
                copy
            );
        }

    );


    // ======================================
    // POSITION + STRETCH
    // ======================================

    group.setAttribute(

        "transform",

        `
        translate(${startX} ${startY})
        scale(${scaleX} ${scaleY})
        translate(${-viewBox.x} ${-viewBox.y})
        `
    );


    canvas.appendChild(
        group
    );


    if (cursorGroup) {

        canvas.appendChild(
            cursorGroup
        );
    }


    // ======================================
    // SAVE FOR BACKSPACE
    // ======================================

    history.push({

        type: "glyph",

        element: group,

        x: startX,

        y: startY
    });


    // ======================================
    // MOVE CURSOR
    // ======================================

    cursorX +=
        newWidth +
        LETTER_GAP;


    resetCursor();


    updateCanvasHeight();
}


// ==========================================
// KEYBOARD
// ==========================================

window.addEventListener(

    "keydown",

    function (event) {


        // ==================================
        // ENTER
        // ==================================

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();


            history.push({

                type: "return",

                x: cursorX,

                y: cursorY
            });


            cursorX =
                LEFT_MARGIN;


            cursorY +=
                LINE_HEIGHT;


            lastKeyTime =
                null;


            resetCursor();

            updateCanvasHeight();


            return;
        }


        // ==================================
        // BACKSPACE
        // ==================================

        if (
            event.key ===
            "Backspace"
        ) {

            event.preventDefault();


            if (
                history.length === 0
            ) {

                return;
            }


            const last =
                history.pop();


            if (
                last.type ===
                "glyph"
            ) {

                last.element.remove();


                cursorX =
                    last.x;


                cursorY =
                    last.y;
            }


            else if (
                last.type ===
                "space"
            ) {

                cursorX =
                    last.x;


                cursorY =
                    last.y;
            }


            else if (
                last.type ===
                "return"
            ) {

                cursorX =
                    last.x;


                cursorY =
                    last.y;
            }


            lastKeyTime =
                null;


            resetCursor();

            updateCanvasHeight();


            return;
        }


        // ==================================
        // IGNORE COMPUTER SHORTCUTS
        // ==================================

        if (
            event.metaKey ||
            event.ctrlKey ||
            event.altKey
        ) {

            return;
        }


        // Ignore Shift, arrows etc.

        if (
            event.key.length !== 1
        ) {

            return;
        }


        event.preventDefault();


        // ==================================
        // SPACE
        // ==================================

        if (
            event.key === " "
        ) {

            history.push({

                type: "space",

                x: cursorX,

                y: cursorY
            });


            cursorX +=
                SPACE_WIDTH;


            if (
                cursorX >
                window.innerWidth -
                RIGHT_MARGIN
            ) {

                cursorX =
                    LEFT_MARGIN;


                cursorY +=
                    LINE_HEIGHT;
            }


            resetCursor();

            updateCanvasHeight();


            return;
        }


        // ==================================
        // CHARACTER
        // ==================================

        let character =
            event.key;


        // Alphabet automatically CAPS

        if (
            /^[a-zA-Z]$/.test(
                character
            )
        ) {

            character =
                character.toUpperCase();
        }


        // Ignore unsupported characters

        if (
            !glyphs[character]
        ) {

            console.warn(
                "Unsupported character:",
                character
            );


            return;
        }


        // ==================================
        // MEASURE KEYSTROKE INTERVAL
        // ==================================

        const now =
            performance.now();


        let interval =
            200;


        if (
            lastKeyTime !== null
        ) {

            interval =
                now -
                lastKeyTime;
        }


        lastKeyTime =
            now;


        // ==================================
        // DRAW
        // ==================================

        drawGlyph(
            character,
            interval
        );
    }

);


// ==========================================
// WINDOW RESIZE
// ==========================================

window.addEventListener(

    "resize",

    function () {

        updateCanvasHeight();
    }

);


// ==========================================
// INITIAL CANVAS HEIGHT
// ==========================================

updateCanvasHeight();