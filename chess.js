let darkPawns1 = 0b0000000000000000000000000000000000000000000000001111111100000000n;
let lightPawns1 = 0b0000000011111111000000000000000000000000000000000000000000000000n;

function isLegalMove(oldSquare, newSquare, element) {
    console.log("in is legal move")   
    target = document.querySelector('.' + newSquare); 
    if (target.classList.contains('Occupied')) {
        console.log("in occupied", element.id)
        if ((target.classList[3][0] == 'L' || target.classList[4][0] == 'L') && element.id[1] <= 2) return false;
        if ((target.classList[3][0] == 'D' || target.classList[4][0] == 'D') && element.id[1] >= 7) return false;
        else {
            let container = document.querySelector(".PieceContainer")
            target.children[0].style.top = 0;
            target.children[0].style.left = 0;
            target.classList.remove(target.classList[3], target.classList[4]);
            target.classList.add("Occupied");
            container.appendChild(target.children[0])
        }
    }
    return true;
}

function updateBoard() {
    console.log("in update board");
}

class Board {
    constructor() {
        this.lightPawns     = 0b0000000011111111000000000000000000000000000000000000000000000000n;
        this.lightRooks     = 0b1000000100000000000000000000000000000000000000000000000000000000n;
        this.lightKnights   = 0b0100001000000000000000000000000000000000000000000000000000000000n;
        this.lightBishops   = 0b0010010000000000000000000000000000000000000000000000000000000000n;
        this.lightQueen     = 0b0001000000000000000000000000000000000000000000000000000000000000n;
        this.lightKing      = 0b0000100000000000000000000000000000000000000000000000000000000000n;

        this.darkPawns      = 0b0000000000000000000000000000000000000000000000001111111100000000n;
        this.darkRooks      = 0b0000000000000000000000000000000000000000000000000000000010000001n;
        this.darkKnights    = 0b0000000000000000000000000000000000000000000000000000000001000010n;
        this.darkBishops    = 0b0000000000000000000000000000000000000000000000000000000000100100n;
        this.darkQueen      = 0b0000000000000000000000000000000000000000000000000000000000010000n;
        this.darkKing       = 0b0000000000000000000000000000000000000000000000000000000000001000n;

        this.whitePieces    = this.lightPawns | this.lightRooks | this.lightKnights | this.lightBishops | this.lightQueen | this.lightKing;
        this.darkPieces    = this.darkPawns | this.darkRooks | this.darkKnights | this.darkBishops | this.darkQueen | this.darkKing;
    }

    getWhiteMoves() {
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
        let masked;
        let tempKnight;
        let pawnMoves = [];
        let knightMoves = [];
        for (let i = 0; i < 64; i++) {
            //Pawns
            masked = this.lightPawns & mask;
            if (masked != 0n) {
                pawnMoves.push(masked >> 8n);
                if (i < 16)
                    pawnMoves.push(masked >> 16n);
            }
            mask >>= 1n;
        }
        
        let sumPawnMoves = 0n;
        for (let i = 0; i < pawnMoves.length; i++)
            sumPawnMoves |= pawnMoves[i];
        
        console.log(sumPawnMoves.toString(2))
    }

    printPieceStatus() {
        console.log(this.whitePieces);
        console.log(this.darkPieces);
    }
}

let board = new Board();
board.printPieceStatus();
board.getWhiteMoves()