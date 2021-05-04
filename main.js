//Vars

    //Set kings and queens

    //Set Pawns
    var lightPawns = document.querySelectorAll(".LPawn")
    var darkPawns = document.querySelectorAll(".DPawn")
    //Set Rooks
    var lightRooks = document.querySelectorAll(".LRook");
    var darkRooks = document.querySelectorAll(".DRook");
    //Set Knights
    var lightKnights = document.querySelectorAll(".LKnight");
    var darkKnights = document.querySelectorAll(".DKnight");
    //Set Bishops
    var lightBishops = document.querySelectorAll(".LBishop");
    var darkBishops = document.querySelectorAll(".DBishop");
    var lightKing = document.querySelector(".LKing");
    var darkKing = document.querySelector(".DKing");
    var lightQueen = document.querySelector(".LQueen");
    var darkQueen = document.querySelector(".DQueen");

function SetBoard() {
    let node;

    for (let i = 0; i < lightPawns.length; i++) {
        node = document.createElement("IMG");
        node.src = "images/Chess_plt60.png";
        node.id = String.fromCharCode(i + 65) + '2Pawn';
        lightPawns[i].appendChild(node);
        node = document.createElement("IMG")
        node.src = "images/Chess_pdt60.png";
        node.id = String.fromCharCode(i + 65) + '7Pawn';
        darkPawns[i].appendChild(node);

        lightPawns[i].classList.add("Occupied")
        darkPawns[i].classList.add("Occupied")
    }



    for (let i = 0; i < lightRooks.length; i++) {
        node = document.createElement("IMG");
        node.src = "images/Chess_rlt60.png";
        if (i == 0) node.id = "A1Rook";
        else node.id = "H1Rook";
        lightRooks[i].appendChild(node);
        node = document.createElement("IMG");
        node.src = "images/Chess_rdt60.png";
        if (i == 0) node.id = "A8Rook";
        else node.id = "H8Rook";
        darkRooks[i].appendChild(node);

        lightRooks[i].classList.add("Occupied")
        darkRooks[i].classList.add("Occupied")
    }



    for (let i = 0; i < lightKnights.length; i++ ) {
        node = document.createElement("IMG");
        node.src = "images/Chess_nlt60.png";
        if (i == 0) node.id = "B1Knight";
        else node.id = "G1Knight";
        lightKnights[i].appendChild(node);
        node = document.createElement("IMG");
        node.src = "images/Chess_ndt60.png";
        if (i == 0) node.id = "B8Knight";
        else node.id = "G8Knight";
        darkKnights[i].appendChild(node);

        lightKnights[i].classList.add("Occupied")
        darkKnights[i].classList.add("Occupied")
    }



    for (let i = 0; i < lightBishops.length; i++) {
        node = document.createElement("IMG");
        node.src = "images/Chess_blt60.png";
        if (i == 0) node.id = "C1Bishop";
        else node.id = "F1Bishop";
        lightBishops[i].appendChild(node);
        node = document.createElement("IMG");
        node.src = "images/Chess_bdt60.png";
        if (i == 0) node.id = "C8Bishop";
        else node.id = "F8Bishop";
        darkBishops[i].appendChild(node);

        lightBishops[i].classList.add("Occupied");
        darkBishops[i].classList.add("Occupied");
    }

    node = document.createElement("IMG")
    node.src = "images/Chess_klt60.png"
    node.id = "E1King"
    lightKing.appendChild(node);

    node = document.createElement("IMG")
    node.src = "images/Chess_kdt60.png"
    node.id = "E8King"
    darkKing.appendChild(node);

    node = document.createElement("IMG")
    node.src = "images/Chess_qlt60.png"
    node.id = "D1Queen"
    lightQueen.appendChild(node);

    node = document.createElement("IMG")
    node.src = "images/Chess_qdt60.png"
    node.id = "D8Queen"
    darkQueen.appendChild(node);


    lightKing.classList.add("Occupied")
    darkKing.classList.add("Occupied")
    lightQueen.classList.add("Occupied")
    darkQueen.classList.add("Occupied")

    InitEventListeners();
}


function dragStart(e, element, elementClass) {
  // (1) prepare to moving: make absolute and on top by z-index
    initSquare = element.parentElement.classList[2];
    element.style.position = 'absolute';
    element.style.zIndex = 1000;


    // move it out of any current parents directly into body
    // to make it positioned relative to the body
     element.parentElement.classList.remove("Occupied");
    element.parentElement.classList.remove(elementClass)
    document.body.append(element);

    // centers the ball at (pageX, pageY) coordinates
    function moveAt(pageX, pageY) {
        element.style.left = pageX - element.offsetWidth / 2 + 'px';
        element.style.top = pageY - element.offsetHeight / 2 + 'px';
    }

    // move our absolutely positioned ball under the pointer
    moveAt(e.pageX, e.pageY);

    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }

    // (2) move the ball on mousemove
    document.addEventListener('mousemove', onMouseMove);

    // (3) drop the ball, remove unneeded handlers
    element.onmouseup = function() {
        locationX = element.offsetLeft + 50;
        locationY = element.offsetTop + 50;
        let square = getSquare(locationX,locationY)
        if (isLegalMove(initSquare, square, element)) {
            let newSquare = document.querySelector('.' + square)
            element.style.position = 'relative'
            element.style.top = 0;
            element.style.left = 0;
            newSquare.appendChild(element);
            newSquare.classList.add(elementClass);
            newSquare.classList.add("Occupied");
        } else {
            let oldSquare = document.querySelector('.' + initSquare);
            element.style.position = 'relative'
            element.style.top = 0;
            element.style.left = 0;
            oldSquare.appendChild(element);
            oldSquare.classList.add(elementClass);
            oldSquare.classList.add("Occupied");
            console.log(initSquare, square, "Illegal")
        }
        document.removeEventListener('mousemove', onMouseMove);
        element.onmouseup = null;
    };
    element.ondragstart = () => {return false;}
}

SetBoard();

function getSquare(x, y) {
    board = document.querySelector(".ChessBoard");
    let topLeftY = board.offsetTop;
    let topLeftX = board.offsetLeft;
    let boardSize = min(800, screen.width * 0.9);
    let squareSize = boardSize / 8;

    let distX = x - topLeftX;
    let distY = y - topLeftY;
    let square = "";

    if (distX < squareSize)
        square += 'A'
    else if (distX < 2*squareSize)
        square += 'B'
    else if (distX < 3*squareSize)
        square += 'C'
    else if (distX < 4*squareSize)
        square += 'D'
    else if (distX < 5*squareSize)
        square += 'E'
    else if (distX < 6*squareSize)
        square += 'F'
    else if (distX < 7*squareSize)
        square += 'G'
    else if (distX < 8*squareSize)
        square += 'H'

    if (distY < squareSize)
        square += '8';
    else if (distY < 2*squareSize)
        square += '7'
    else if (distY < 3*squareSize)
        square += '6'
    else if (distY < 4*squareSize)
        square += '5'
    else if (distY < 5*squareSize)
        square += '4'
    else if (distY < 6*squareSize)
        square += '3'
    else if (distY < 7*squareSize)
        square += '2'
    else if (distY < 8*squareSize)
        square += '1'

    return square;
}

function min(a, b) {
    if (a < b) return a;
    return b;
}

function InitEventListeners() {
    A2Pawn = document.getElementById("A2Pawn");
    A2Pawn.addEventListener('mousedown', (e) => {dragStart(e, A2Pawn, "LPawn")});
    B2Pawn = document.getElementById("B2Pawn");
    B2Pawn.addEventListener('mousedown', (e) => {dragStart(e, B2Pawn, "LPawn")});
    C2Pawn = document.getElementById("C2Pawn");
    C2Pawn.addEventListener('mousedown', (e) => {dragStart(e, C2Pawn, "LPawn")});
    D2Pawn = document.getElementById("D2Pawn");
    D2Pawn.addEventListener('mousedown', (e) => {dragStart(e, D2Pawn, "LPawn")});
    E2Pawn = document.getElementById("E2Pawn");
    E2Pawn.addEventListener('mousedown', (e) => {dragStart(e, E2Pawn, "LPawn")});
    F2Pawn = document.getElementById("F2Pawn");
    F2Pawn.addEventListener('mousedown', (e) => {dragStart(e, F2Pawn, "LPawn")});
    G2Pawn = document.getElementById("G2Pawn");
    G2Pawn.addEventListener('mousedown', (e) => {dragStart(e, G2Pawn, "LPawn")});
    H2Pawn = document.getElementById("H2Pawn");
    H2Pawn.addEventListener('mousedown', (e) => {dragStart(e, H2Pawn, "LPawn")});

    A7Pawn = document.getElementById("A7Pawn");
    A7Pawn.addEventListener('mousedown', (e) => {dragStart(e, A7Pawn, "DPawn")});
    B7Pawn = document.getElementById("B7Pawn");
    B7Pawn.addEventListener('mousedown', (e) => {dragStart(e, B7Pawn, "DPawn")});
    C7Pawn = document.getElementById("C7Pawn");
    C7Pawn.addEventListener('mousedown', (e) => {dragStart(e, C7Pawn, "DPawn")});
    D7Pawn = document.getElementById("D7Pawn");
    D7Pawn.addEventListener('mousedown', (e) => {dragStart(e, D7Pawn, "DPawn")});
    E7Pawn = document.getElementById("E7Pawn");
    E7Pawn.addEventListener('mousedown', (e) => {dragStart(e, E7Pawn, "DPawn")});
    F7Pawn = document.getElementById("F7Pawn");
    F7Pawn.addEventListener('mousedown', (e) => {dragStart(e, F7Pawn, "DPawn")});
    G7Pawn = document.getElementById("G7Pawn");
    G7Pawn.addEventListener('mousedown', (e) => {dragStart(e, G7Pawn, "DPawn")});
    H7Pawn = document.getElementById("H7Pawn");
    H7Pawn.addEventListener('mousedown', (e) => {dragStart(e, H7Pawn, "DPawn")});

    A1Rook = document.getElementById("A1Rook");
    A1Rook.addEventListener('mousedown', (e) => {dragStart(e, A1Rook, "LRook")});
    H1Rook = document.getElementById("H1Rook");
    H1Rook.addEventListener('mousedown', (e) => {dragStart(e, H1Rook, "LRook")});
    A8Rook = document.getElementById("A8Rook");
    A8Rook.addEventListener('mousedown', (e) => {dragStart(e, A8Rook, "DRook")});
    H8Rook = document.getElementById("H8Rook");
    H8Rook.addEventListener('mousedown', (e) => {dragStart(e, H8Rook, "DRook")});

    B1Knight = document.getElementById("B1Knight");
    B1Knight.addEventListener('mousedown', (e) => {dragStart(e, B1Knight, "LKnight")});
    G1Knight = document.getElementById("G1Knight");
    G1Knight.addEventListener('mousedown', (e) => {dragStart(e, G1Knight, "LKnight")});
    B8Knight = document.getElementById("B8Knight");
    B8Knight.addEventListener('mousedown', (e) => {dragStart(e, B8Knight, "DKnight")});
    G8Knight = document.getElementById("G8Knight");
    G8Knight.addEventListener('mousedown', (e) => {dragStart(e, G8Knight, "DKnight")});

    C1Bishop = document.getElementById("C1Bishop");
    C1Bishop.addEventListener('mousedown', (e) => {dragStart(e, C1Bishop, "LBishop")});
    F1Bishop = document.getElementById("F1Bishop");
    F1Bishop.addEventListener('mousedown', (e) => {dragStart(e, F1Bishop, "LBishop")});
    C8Bishop = document.getElementById("C8Bishop");
    C8Bishop.addEventListener('mousedown', (e) => {dragStart(e, C8Bishop, "DBishop")});
    F8Bishop = document.getElementById("F8Bishop");
    F8Bishop.addEventListener('mousedown', (e) => {dragStart(e, F8Bishop, "DBishop")});

    E1King = document.getElementById("E1King");
    E1King.addEventListener('mousedown', (e) => {dragStart(e, E1King, "LKing")})
    E8King = document.getElementById("E8King");
    E8King.addEventListener('mousedown', (e) => {dragStart(e, E8King, "DKing")})
    D1Queen = document.getElementById("D1Queen");
    D1Queen.addEventListener('mousedown', (e) => {dragStart(e, D1Queen, "LQueen")})
    D8Queen = document.getElementById("D8Queen");
    D8Queen.addEventListener('mousedown', (e) => {dragStart(e, D8Queen, "DQueen")})
}