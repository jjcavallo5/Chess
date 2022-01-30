//Set Pawns
var lightPawns = document.querySelectorAll(".LPawn");
var darkPawns = document.querySelectorAll(".DPawn");
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

var board15 = new UpdatedBoard();
// console.time("Perft");
// console.log(board15.perft(PERFT_DEPTH));
// console.timeEnd("Perft");
SetBoard();

// console.time("Get Moves");
// for (let i = 0; i < 10000; i++) {
//     board15.getWhiteMoves();
// }
// console.timeEnd("Get Moves");

// let move = new Move(8, 16, 0b0000);
// console.time("Make Move");
// for (let i = 0; i < 10000; i++) {
//     board15.makeMove(move);
// }
// console.timeEnd("Make Move");

function SetBoard() {
    let node;

    for (let i = 0; i < lightPawns.length; i++) {
        node = document.createElement("IMG");
        node.src = "images/whitePawn.png";
        node.id = String.fromCharCode(i + 65) + "2Pawn";
        lightPawns[i].appendChild(node);
        node = document.createElement("IMG");
        node.src = "images/blackPawn.png";
        node.id = String.fromCharCode(i + 65) + "7Pawn";
        darkPawns[i].appendChild(node);

        lightPawns[i].classList.add("Occupied");
        darkPawns[i].classList.add("Occupied");
    }

    for (let i = 0; i < lightRooks.length; i++) {
        node = document.createElement("IMG");
        node.src = "images/whiteRook.png";
        if (i == 0) node.id = "A1Rook";
        else node.id = "H1Rook";
        lightRooks[i].appendChild(node);
        node = document.createElement("IMG");
        node.src = "images/blackRook.png";
        if (i == 0) node.id = "A8Rook";
        else node.id = "H8Rook";
        darkRooks[i].appendChild(node);

        lightRooks[i].classList.add("Occupied");
        darkRooks[i].classList.add("Occupied");
    }

    for (let i = 0; i < lightKnights.length; i++) {
        node = document.createElement("IMG");
        node.src = "images/whiteKnight.png";
        if (i == 0) node.id = "B1Knight";
        else node.id = "G1Knight";
        lightKnights[i].appendChild(node);
        node = document.createElement("IMG");
        node.src = "images/blackKnight.png";
        if (i == 0) node.id = "B8Knight";
        else node.id = "G8Knight";
        darkKnights[i].appendChild(node);

        lightKnights[i].classList.add("Occupied");
        darkKnights[i].classList.add("Occupied");
    }

    for (let i = 0; i < lightBishops.length; i++) {
        node = document.createElement("IMG");
        node.src = "images/whiteBishop.png";
        if (i == 0) node.id = "C1Bishop";
        else node.id = "F1Bishop";
        lightBishops[i].appendChild(node);
        node = document.createElement("IMG");
        node.src = "images/blackBishop.png";
        if (i == 0) node.id = "C8Bishop";
        else node.id = "F8Bishop";
        darkBishops[i].appendChild(node);

        lightBishops[i].classList.add("Occupied");
        darkBishops[i].classList.add("Occupied");
    }

    node = document.createElement("IMG");
    node.src = "images/whiteKing.png";
    node.id = "E1King";
    lightKing.appendChild(node);

    node = document.createElement("IMG");
    node.src = "images/blackKing.png";
    node.id = "E8King";
    darkKing.appendChild(node);

    node = document.createElement("IMG");
    node.src = "images/whiteQueen.png";
    node.id = "D1Queen";
    lightQueen.appendChild(node);

    node = document.createElement("IMG");
    node.src = "images/blackQueen.png";
    node.id = "D8Queen";
    darkQueen.appendChild(node);

    lightKing.classList.add("Occupied");
    darkKing.classList.add("Occupied");
    lightQueen.classList.add("Occupied");
    darkQueen.classList.add("Occupied");

    InitEventListeners();
}

function getSquareIndexFromClassName(sq_string) {
    let file = sq_string.charCodeAt(0) - 65;
    return file + 8 * parseInt(sq_string[1] - 1);
}

function checkPromotion(legalMoves, i, target_sq, element) {
    const CAPTURE_FLAG = 0b0100;

    let color;
    color = target_sq[1] == 8 ? "white" : "black";
    let promo = document.getElementsByClassName(color + " PromoSelector");
    promo[0].style.display = "flex";

    //Display and position promo menus
    if (color == "white") {
        promo[0].style.left = element.offsetLeft + "px";
        promo[0].style.top = element.offsetTop + "px";
    } else {
        promo[0].style.left = element.offsetLeft + "px";
        promo[0].style.top = element.offsetTop - 300 + "px";
    }

    let index;
    let firstChar;
    if (color == "white") {
        index = 0;
        firstChar = "L";
    } else {
        index = 1;
        firstChar = "D";
    }

    //Add event listeners for clicks on promo pieces,
    //Call appropriate "makeMove" function
    document.getElementsByClassName("QueenPromo")[index].addEventListener("click", () => {
        board15.makeMove(legalMoves[i + 3]);
        promo[0].style.display = "none";
        document.getElementsByClassName(target_sq)[0].firstChild.src =
            "images/" + color + "Queen.png";
        document.getElementsByClassName(target_sq)[0].classList.add(firstChar + "Queen");
    });

    document.getElementsByClassName("KnightPromo")[index].addEventListener("click", () => {
        board15.makeMove(legalMoves[i]);
        promo[0].style.display = "none";
        document.getElementsByClassName(target_sq)[0].firstChild.src =
            "images/" + color + "Knight.png";
        document.getElementsByClassName(target_sq)[0].classList.add(firstChar + "Knight");
    });

    document.getElementsByClassName("BishopPromo")[index].addEventListener("click", () => {
        board15.makeMove(legalMoves[i + 1]);
        promo[0].style.display = "none";
        document.getElementsByClassName(target_sq)[0].firstChild.src =
            "images/" + color + "Bishop.png";
        document.getElementsByClassName(target_sq)[0].classList.add(firstChar + "Bishop");
    });

    document.getElementsByClassName("RookPromo")[index].addEventListener("click", () => {
        board15.makeMove(legalMoves[i + 2]);
        promo[0].style.display = "none";
        document.getElementsByClassName(target_sq)[0].firstChild.src =
            "images/" + color + "Rook.png";
        document.getElementsByClassName(target_sq)[0].classList.add(firstChar + "Rook");
    });

    document.getElementsByClassName(target_sq)[0].classList.remove(firstChar + "Pawn");

    //Check for promo capture
    if (legalMoves[i].flags & CAPTURE_FLAG) {
        let target = document.querySelector("." + target_sq);
        let container = document.querySelector(".PieceContainer");
        container.append(target.children[0]);
        target.classList.remove(target.classList[3]);
    }
}

function handleMate(winningPlayer) {
    document.getElementById("MateH1").innerHTML = winningPlayer + " Wins!";
    document.querySelector(".Checkmate").style.display = "flex";
}

function resetBoard() {
    let squares = document.querySelectorAll(".Square");

    for (let i = 0; i < squares.length; i++) {
        while (squares[i].classList.length > 3) {
            squares[i].classList.remove(squares[i].classList[3]);
        }
        squares[i].innerHTML = "";
    }

    let container = document.querySelector(".PieceContainer");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    document.querySelector(".Checkmate").style.display = "none";

    board15 = new UpdatedBoard();
    SetBoard();
}

function isLegalMove(start_sq, target_sq, element) {
    console.log(start_sq, target_sq);
    const CAPTURE_FLAG = 0b0100;
    const CASTLE_SHORT_FLAG = 0b0010;
    const CASTLE_LONG_FLAG = 0b0011;
    const EN_PASSANT_FLAG = 0b0101;
    let legal;
    let start = getSquareIndexFromClassName(start_sq);
    let target = getSquareIndexFromClassName(target_sq);
    if (board15.playerBoolean) {
        legal = board15.getWhiteMoves();
    } else {
        legal = board15.getBlackMoves();
    }

    for (let i = 0; i < legal.length; i++) {
        //Check if move is found
        if (legal[i].from == start && legal[i].target == target) {
            //Check promotion
            if (legal[i].flags & 0b1000) {
                checkPromotion(legal, i, target_sq, element);
                return true;
            }

            //Update Board State
            board15.makeMove(legal[i]);

            //Check Captures, update UI accordingly
            if (legal[i].flags & CAPTURE_FLAG) {
                let target = document.querySelector("." + target_sq);
                let container = document.querySelector(".PieceContainer");
                container.append(target.children[0]);
                target.classList.remove(target.classList[3]);
            }

            //Check castles, update UI accordingly
            if (legal[i].flags == CASTLE_SHORT_FLAG || legal[i].flags == CASTLE_LONG_FLAG) {
                checkCastles(start_sq, target_sq);
            }

            //Check En Passant, update UI accordingly
            if (legal[i].flags == EN_PASSANT_FLAG) {
                checkEnPassants(start_sq, target_sq);
            }

            if (!board15.playerBoolean && board15.getBlackMoves().length == 0) {
                handleMate("White");
            } else if (board15.getWhiteMoves().length == 0) {
                handleMate("Black");
            }

            //Move is legal, return
            return true;
        }
    }

    //Move not found, return without taking action
    return false;
}

function dragStart(e, element, elementClass) {
    // (1) prepare to moving: make absolute and on top by z-index
    initSquare = element.parentElement.classList[2];
    element.style.position = "absolute";
    element.style.zIndex = 1;

    // move it out of any current parents directly into body
    // to make it positioned relative to the body
    element.parentElement.classList.remove("Occupied");
    element.parentElement.classList.remove(elementClass);
    document.body.append(element);

    // centers the ball at (pageX, pageY) coordinates
    function moveAt(pageX, pageY) {
        element.style.left = pageX - element.offsetWidth / 2 + "px";
        element.style.top = pageY - element.offsetHeight / 2 + "px";
    }

    // move our absolutely positioned ball under the pointer
    moveAt(e.pageX, e.pageY);

    function onMouseMove(e) {
        moveAt(e.pageX, e.pageY);
    }

    // (2) move the ball on mousemove
    document.addEventListener("mousemove", onMouseMove);

    // (3) drop the ball, remove unneeded handlers
    element.onmouseup = function () {
        locationX = element.offsetLeft + 50;
        locationY = element.offsetTop + 50;
        let square = getSquare(locationX, locationY);
        if (isLegalMove(initSquare, square, element)) {
            let newSquare = document.querySelector("." + square);
            element.style.position = "relative";
            element.style.top = 0;
            element.style.left = 0;
            newSquare.appendChild(element);
            newSquare.classList.add(elementClass);
            newSquare.classList.add("Occupied");
        } else {
            let oldSquare = document.querySelector("." + initSquare);
            element.style.position = "relative";
            element.style.top = 0;
            element.style.left = 0;
            oldSquare.appendChild(element);
            oldSquare.classList.add(elementClass);
            oldSquare.classList.add("Occupied");
            console.log(initSquare, square, "Illegal");
        }
        document.removeEventListener("mousemove", onMouseMove);
        element.onmouseup = null;
    };
    element.ondragstart = () => {
        return false;
    };
}

function drawArrow() {
    return;
}

function getSquare(x, y) {
    board = document.querySelector(".ChessBoard");
    let topLeftY = board.offsetTop;
    let topLeftX = board.offsetLeft;
    let boardSize = min(800, screen.width * 0.9);
    let squareSize = boardSize / 8;

    let distX = x - topLeftX;
    let distY = y - topLeftY;
    let square = "";

    if (distX < squareSize) square += "A";
    else if (distX < 2 * squareSize) square += "B";
    else if (distX < 3 * squareSize) square += "C";
    else if (distX < 4 * squareSize) square += "D";
    else if (distX < 5 * squareSize) square += "E";
    else if (distX < 6 * squareSize) square += "F";
    else if (distX < 7 * squareSize) square += "G";
    else if (distX < 8 * squareSize) square += "H";

    if (distY < squareSize) square += "8";
    else if (distY < 2 * squareSize) square += "7";
    else if (distY < 3 * squareSize) square += "6";
    else if (distY < 4 * squareSize) square += "5";
    else if (distY < 5 * squareSize) square += "4";
    else if (distY < 6 * squareSize) square += "3";
    else if (distY < 7 * squareSize) square += "2";
    else if (distY < 8 * squareSize) square += "1";

    return square;
}

function min(a, b) {
    if (a < b) return a;
    return b;
}

function InitEventListeners() {
    A2Pawn = document.getElementById("A2Pawn");
    A2Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, A2Pawn, "LPawn");
        } else drawArrow(e);
    });
    B2Pawn = document.getElementById("B2Pawn");
    B2Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, B2Pawn, "LPawn");
        } else drawArrow(e);
    });
    C2Pawn = document.getElementById("C2Pawn");
    C2Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, C2Pawn, "LPawn");
        } else drawArrow(e);
    });
    D2Pawn = document.getElementById("D2Pawn");
    D2Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, D2Pawn, "LPawn");
        } else drawArrow(e);
    });
    E2Pawn = document.getElementById("E2Pawn");
    E2Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, E2Pawn, "LPawn");
        } else drawArrow();
    });
    F2Pawn = document.getElementById("F2Pawn");
    F2Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, F2Pawn, "LPawn");
        } else drawArrow();
    });
    G2Pawn = document.getElementById("G2Pawn");
    G2Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, G2Pawn, "LPawn");
        } else drawArrow();
    });
    H2Pawn = document.getElementById("H2Pawn");
    H2Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, H2Pawn, "LPawn");
        } else drawArrow();
    });

    A7Pawn = document.getElementById("A7Pawn");
    A7Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, A7Pawn, "DPawn");
        } else drawArrow();
    });
    B7Pawn = document.getElementById("B7Pawn");
    B7Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, B7Pawn, "DPawn");
        } else drawArrow();
    });
    C7Pawn = document.getElementById("C7Pawn");
    C7Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, C7Pawn, "DPawn");
        } else drawArrow();
    });
    D7Pawn = document.getElementById("D7Pawn");
    D7Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, D7Pawn, "DPawn");
        } else drawArrow();
    });
    E7Pawn = document.getElementById("E7Pawn");
    E7Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, E7Pawn, "DPawn");
        } else drawArrow();
    });
    F7Pawn = document.getElementById("F7Pawn");
    F7Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, F7Pawn, "DPawn");
        } else drawArrow();
    });
    G7Pawn = document.getElementById("G7Pawn");
    G7Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, G7Pawn, "DPawn");
        } else drawArrow();
    });
    H7Pawn = document.getElementById("H7Pawn");
    H7Pawn.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, H7Pawn, "DPawn");
        } else drawArrow();
    });

    A1Rook = document.getElementById("A1Rook");
    A1Rook.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, A1Rook, "LRook");
        } else drawArrow();
    });
    H1Rook = document.getElementById("H1Rook");
    H1Rook.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, H1Rook, "LRook");
        } else drawArrow();
    });
    A8Rook = document.getElementById("A8Rook");
    A8Rook.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, A8Rook, "DRook");
        } else drawArrow();
    });
    H8Rook = document.getElementById("H8Rook");
    H8Rook.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, H8Rook, "DRook");
        } else drawArrow();
    });

    B1Knight = document.getElementById("B1Knight");
    B1Knight.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, B1Knight, "LKnight");
        } else drawArrow();
    });
    G1Knight = document.getElementById("G1Knight");
    G1Knight.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, G1Knight, "LKnight");
        } else drawArrow();
    });
    B8Knight = document.getElementById("B8Knight");
    B8Knight.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, B8Knight, "DKnight");
        } else drawArrow();
    });
    G8Knight = document.getElementById("G8Knight");
    G8Knight.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, G8Knight, "DKnight");
        } else drawArrow();
    });

    C1Bishop = document.getElementById("C1Bishop");
    C1Bishop.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, C1Bishop, "LBishop");
        } else drawArrow();
    });
    F1Bishop = document.getElementById("F1Bishop");
    F1Bishop.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, F1Bishop, "LBishop");
        } else drawArrow();
    });
    C8Bishop = document.getElementById("C8Bishop");
    C8Bishop.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, C8Bishop, "DBishop");
        } else drawArrow();
    });
    F8Bishop = document.getElementById("F8Bishop");
    F8Bishop.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, F8Bishop, "DBishop");
        } else drawArrow();
    });

    E1King = document.getElementById("E1King");
    E1King.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, E1King, "LKing");
        } else drawArrow();
    });
    E8King = document.getElementById("E8King");
    E8King.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, E8King, "DKing");
        } else drawArrow();
    });
    D1Queen = document.getElementById("D1Queen");
    D1Queen.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, D1Queen, "LQueen");
        } else drawArrow();
    });
    D8Queen = document.getElementById("D8Queen");
    D8Queen.addEventListener("mousedown", (e) => {
        if (e.button == 0) {
            dragStart(e, D8Queen, "DQueen");
        } else drawArrow();
    });
}

// * CHECK CASTLES * //
function checkCastles(oldSquare, newSquare) {
    //King not on correct square
    if (oldSquare != "E1" && oldSquare != "E8") return;

    if (oldSquare == "E1" && newSquare == "G1") {
        //Castling requested and approved, move rook.
        let rook = document.querySelector("#H1Rook");
        let rookTarget = document.querySelector(".F1");
        rookTarget.classList.add("Occupied");
        rookTarget.classList.add("LRook");
        rook.parentElement.classList.remove("LRook");
        rook.parentElement.classList.remove("Occupied");
        rookTarget.append(rook);
        return;
    }

    if (oldSquare == "E1" && newSquare == "C1") {
        //Castling requested and approved, move rook.
        let rook = document.querySelector("#A1Rook");
        let rookTarget = document.querySelector(".D1");
        rookTarget.classList.add("Occupied");
        rookTarget.classList.add("LRook");
        rook.parentElement.classList.remove("LRook");
        rook.parentElement.classList.remove("Occupied");
        rookTarget.append(rook);
        return;
    }

    if (oldSquare == "E8" && newSquare == "G8") {
        //Castling requested and approved, move rook.
        let rook = document.querySelector("#H8Rook");
        let rookTarget = document.querySelector(".F8");
        rookTarget.classList.add("Occupied");
        rookTarget.classList.add("DRook");
        rook.parentElement.classList.remove("DRook");
        rook.parentElement.classList.remove("Occupied");
        rookTarget.append(rook);
        return;
    }

    if (oldSquare == "E8" && newSquare == "C8") {
        //Castling requested and approved, move rook.
        let rook = document.querySelector("#A8Rook");
        let rookTarget = document.querySelector(".D8");
        rookTarget.classList.add("Occupied");
        rookTarget.classList.add("LRook");
        rook.parentElement.classList.remove("LRook");
        rook.parentElement.classList.remove("Occupied");
        rookTarget.append(rook);
        return;
    }
}

// * CHECK EN PASSANT * //
function checkEnPassants(oldSquare, newSquare) {
    //Eliminates pawns on all other squares
    if (oldSquare[1] != "4" && oldSquare[1] != "5") return;

    //Get elements from DOM
    let newSquareDiv = document.querySelector("." + newSquare);
    let container = document.querySelector(".PieceContainer");

    if (oldSquare[1] == "5" && newSquare[1] == "6") {
        if (!newSquareDiv.classList.contains("Occupied") && oldSquare[0] != newSquare[0]) {
            //En Passant Requested and approved
            let clearSquare = document.querySelector("." + newSquare[0] + oldSquare[1]);
            container.append(clearSquare.children[0]);
            clearSquare.classList.remove(clearSquare.classList[3], clearSquare.classList[4]);
        }
        return;
    }

    if (oldSquare[1] == "4" && newSquare[1] == "3") {
        if (!newSquareDiv.classList.contains("Occupied") && oldSquare[0] != newSquare[0]) {
            //En Passant Requested and approved
            let clearSquare = document.querySelector("." + newSquare[0] + oldSquare[1]);
            container.append(clearSquare.children[0]);
            clearSquare.classList.remove(clearSquare.classList[3], clearSquare.classList[4]);
        }
    }
}
