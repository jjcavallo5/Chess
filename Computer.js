let computerBoard = new Board();
computerBoard.bitBoardFromArray();

class Computer {
    constructor(board1) {
        this.board = board1;
        this.moveCount = 0;
    }

    getMovesArray(board) {
        let moveArray = [];
        let mask = initMask;
        let innerMask = initMask;
        let activePieces = board.getActivePieces();
        let legalMoves;
        for (let i = 0; i < 64; i++) {
            if (mask & activePieces) {
                legalMoves = board.getLegal(mask);
                innerMask = initMask;
                for (let j = 0; j < 64; j++) {
                    if (innerMask & legalMoves) {
                        moveArray.push([mask, innerMask]);
                    }
                    innerMask >>= 1n;
                }
            }
            mask >>= 1n;
        }

        return moveArray;
    }

    deepCopy(board1, board2) {
        //for
    }

    countMoves(depth, board) {
        if (depth == 0) return 1;
        let tempBoard = board;
        let moves = this.getMovesArray(board);
        let count = 0;

        for (let i = 0; i < moves.length; i++) {
            board.makeMove(moves[i][0], moves[i][1]);
            count += this.countMoves(depth - 1, board);
            board = Object.create(tempBoard);
        }
        return count;
    }
}

let computer = new Computer(computerBoard);
let moveCount = computer.countMoves(2, computer.board);
console.log(moveCount);
