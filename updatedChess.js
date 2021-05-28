const CAPTURE_FLAG = 0b0100;
const PERFT_DEPTH = 6;

class Move {
    constructor(from, to, flags) {
        this.from = from;
        this.target = to;
        this.flags = flags;

        this.move = (from << 10) | (to << 4) | flags;
    }
    isCapture() {
        return this.flags == CAPTURE_FLAG;
    }
    getButterflyIndex() {
        return this.move & 0x000f;
    }
}

class UpdatedBoard {
    constructor() {
        this.boardArray = [
            ["r", "n", "b", "q", "k", "b", "n", "r"],
            ["p", "p", "p", "p", "p", "p", "p", "p"],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            [" ", " ", " ", " ", " ", " ", " ", " "],
            ["P", "P", "P", "P", "P", "P", "P", "P"],
            ["R", "N", "B", "Q", "K", "B", "N", "R"],
        ];

        this.boardFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR";

        this.lightPawns = 0n;
        this.lightRooks = 0n;
        this.lightKnights = 0n;
        this.lightBishops = 0n;
        this.lightQueen = 0n;
        this.lightKing = 0n;

        this.darkPawns = 0n;
        this.darkRooks = 0n;
        this.darkKnights = 0n;
        this.darkBishops = 0n;
        this.darkQueen = 0n;
        this.darkKing = 0n;

        this.lightPieces = 0n;
        this.darkPieces = 0n;
        this.occupied = 0n;

        //Store Castle Rights
        this.lightCastleRights = [true, true];
        this.darkCastleRights = [true, true];

        //Store En-Passant Squares
        this.lightEnPassantTarget = 0n;
        this.darkEnPassantTarget = 0n;

        this.playerBoolean = true;

        //Reversible Moves
        this.reversibleMoves = 0;

        //Move target
        this.moveTargets = [];
        this.moveList = [];
        this.capturedBlackPieceStack = [];
        this.capturedWhitePieceStack = [];

        this.captureCount = 0;
        this.divideArr = [];

        this.bitBoardFromArray(this.boardArray);
        //this.bitboardFromFEN();
    }

    bitBoardFromArray(arr) {
        //Converts board to bitboards from array
        let mask = maskInit;
        for (let i = 7; i >= 0; i--) {
            for (let j = 0; j < 8; j++) {
                switch (arr[i][j]) {
                    case "P":
                        this.lightPawns |= mask;
                        break;
                    case "p":
                        this.darkPawns |= mask;
                        break;
                    case "R":
                        this.lightRooks |= mask;
                        break;
                    case "r":
                        this.darkRooks |= mask;
                        break;
                    case "N":
                        this.lightKnights |= mask;
                        break;
                    case "n":
                        this.darkKnights |= mask;
                        break;
                    case "B":
                        this.lightBishops |= mask;
                        break;
                    case "b":
                        this.darkBishops |= mask;
                        break;
                    case "Q":
                        this.lightQueen |= mask;
                        break;
                    case "q":
                        this.darkQueen |= mask;
                        break;
                    case "K":
                        this.lightKing |= mask;
                        break;
                    case "k":
                        this.darkKing |= mask;
                        break;
                }
                mask >>= 1n;
            }
        }

        this.lightPieces =
            this.lightPawns |
            this.lightRooks |
            this.lightKnights |
            this.lightBishops |
            this.lightQueen |
            this.lightKing;
        this.darkPieces =
            this.darkPawns |
            this.darkRooks |
            this.darkKnights |
            this.darkBishops |
            this.darkQueen |
            this.darkKing;

        this.occupied = this.lightPieces | this.darkPieces;
    }

    bitboardFromFEN() {
        let arr = [[], [], [], [], [], [], [], []];
        let arrIndex = 0;
        for (let i = 0; i < this.boardFEN.length; i++) {
            if (this.boardFEN[i] == "/") arrIndex++;
            else if (this.boardFEN[i] >= "0" && this.boardFEN[i] <= "8") {
                for (let j = 0; j < parseInt(this.boardFEN[i]); j++) arr[arrIndex].push(" ");
            } else {
                arr[arrIndex].push(this.boardFEN[i]);
            }
        }

        this.bitBoardFromArray(arr);
    }

    getWhiteMoves() {
        let horzInBetween, vertInBetween, diaInBetween, antiInBetween;
        let kingSuperAttacksOrtho, kingSuperAttacksDia;
        let anyBlackAttack;

        //Black rooks and queens West
        let _blackAttacks = westAttacks(
            this.darkRooks | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack = _blackAttacks;
        let _superAttacks = slidingEastRay(this.lightKing, this.occupied);
        kingSuperAttacksOrtho = _superAttacks;
        horzInBetween = _blackAttacks & _superAttacks;
        //Black rooks and queens East
        _blackAttacks = eastAttacks(
            this.darkRooks | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingWestRay(this.lightKing, this.occupied);
        kingSuperAttacksOrtho |= _superAttacks;
        horzInBetween |= _blackAttacks & _superAttacks;
        //Black rooks and queens North
        _blackAttacks = northAttacks(
            this.darkRooks | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingSouthRay(this.lightKing, this.occupied);
        kingSuperAttacksOrtho |= _superAttacks;
        vertInBetween = _blackAttacks & _superAttacks;
        //Black rooks and queens South
        _blackAttacks = southAttacks(
            this.darkRooks | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingNorthRay(this.lightKing, this.occupied);
        kingSuperAttacksOrtho |= _superAttacks;
        vertInBetween |= _blackAttacks & _superAttacks;

        //Black bishops and queens NE
        _blackAttacks = northEastAttacks(
            this.darkBishops | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingSouthWestRay(this.lightKing, this.occupied);
        kingSuperAttacksDia = _superAttacks;
        diaInBetween = _blackAttacks & _superAttacks;
        //Black bishops and queens SW
        _blackAttacks = southWestAttacks(
            this.darkBishops | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingNorthEastRay(this.lightKing, this.occupied);
        kingSuperAttacksDia |= _superAttacks;
        diaInBetween |= _blackAttacks & _superAttacks;
        //Black bishops and queens NW
        _blackAttacks = northWestAttacks(
            this.darkBishops | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingSouthEastRay(this.lightKing, this.occupied);
        kingSuperAttacksDia |= _superAttacks;
        antiInBetween = _blackAttacks & _superAttacks;
        //Black bishops and queens SE
        _blackAttacks = southEastAttacks(
            this.darkBishops | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingNorthWestRay(this.lightKing, this.occupied);
        kingSuperAttacksDia |= _superAttacks;
        antiInBetween |= _blackAttacks & _superAttacks;

        //Knights, Pawns, King
        anyBlackAttack |= knightAttacks(this.darkKnights);
        anyBlackAttack |= blackPawnEastAttacks(this.darkPawns);
        anyBlackAttack |= blackPawnWestAttacks(this.darkPawns);
        anyBlackAttack |= kingAttacksFromSquare[getSquareIndex(this.darkKing)];

        //Calc Check
        let allInBetween = horzInBetween | vertInBetween | diaInBetween | antiInBetween;
        let _blocks = allInBetween & ~this.occupied;
        let _checkFrom =
            (kingSuperAttacksOrtho & (this.darkRooks | this.darkQueen)) |
            (kingSuperAttacksDia & (this.darkBishops | this.darkQueen)) |
            (knightAttacks(this.lightKing) & this.darkKnights) |
            (lightPawnAttacksFromSquare[getSquareIndex(this.lightKing)] & this.darkPawns);

        let _nullIfCheck = ((anyBlackAttack & this.lightKing) - 1n) >> 63n;
        let _nullIfDoubleCheck = ((_checkFrom & (_checkFrom - 1n)) - 1n) >> 63n;

        let _checkTo = _checkFrom | _blocks | _nullIfCheck;
        let targetMask = ~this.lightPieces & _checkTo & _nullIfDoubleCheck;

        //Horizontal queen and rook moves
        let _sliders = (this.lightRooks | this.lightQueen) & ~(allInBetween ^ horzInBetween);
        this.moveTargets[6] = westAttacks(_sliders, ~this.occupied) & targetMask;
        this.moveTargets[2] = eastAttacks(_sliders, ~this.occupied) & targetMask;
        //Vertical queen and rook moves
        _sliders = (this.lightRooks | this.lightQueen) & ~(allInBetween ^ vertInBetween);
        this.moveTargets[0] = northAttacks(_sliders, ~this.occupied) & targetMask;
        this.moveTargets[4] = southAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        //Diagonal queen and bishop moves
        _sliders = (this.lightBishops | this.lightQueen) & ~(allInBetween ^ diaInBetween);
        this.moveTargets[1] = northEastAttacks(_sliders, ~this.occupied) & targetMask;
        this.moveTargets[5] = southWestAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        //Antidiagonal queen and rook moves
        _sliders = (this.lightBishops | this.lightQueen) & ~(allInBetween ^ antiInBetween);
        this.moveTargets[3] = southEastAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        this.moveTargets[7] = northWestAttacks(_sliders, ~this.occupied) & targetMask;

        //Knights
        let _knights = this.lightKnights & ~allInBetween;
        this.moveTargets[8] = NOne(NEOne(_knights)) & targetMask;
        this.moveTargets[9] = EOne(NEOne(_knights)) & targetMask;
        this.moveTargets[10] = EOne(SEOne(_knights)) & targetMask;
        this.moveTargets[11] = SOne(SEOne(_knights)) & targetMask;
        this.moveTargets[12] = SOne(SWOne(_knights)) & targetMask;
        this.moveTargets[13] = WOne(SWOne(_knights)) & targetMask;
        this.moveTargets[14] = WOne(NWOne(_knights)) & targetMask;
        this.moveTargets[15] = NOne(NWOne(_knights)) & targetMask;

        //Pawns
        //print(targetMask);
        let _targets = (this.darkPieces & targetMask) | (this.lightEnPassantTarget & targetMask);
        if (!_nullIfCheck && this.lightEnPassantTarget)
            if (NWOne(this.lightKing) & this.darkPawns || NEOne(this.lightKing) & this.darkPawns)
                _targets |= this.lightEnPassantTarget;
        let _pawns = this.lightPawns & ~(allInBetween ^ diaInBetween);
        this.moveTargets[1] |= NEOne(_pawns) & _targets;
        _pawns = this.lightPawns & ~(allInBetween ^ antiInBetween);
        this.moveTargets[7] |= NWOne(_pawns) & _targets;
        _pawns = this.lightPawns & ~(allInBetween ^ vertInBetween);
        let _pawnPushes = NOne(_pawns) & ~this.occupied;
        this.moveTargets[0] |= _pawnPushes & targetMask;
        let _rank4 = 0x000000ff00000000n;
        this.moveTargets[0] |= NOne(_pawnPushes) & ~this.occupied & targetMask & _rank4;

        //King
        targetMask = ~(this.lightPieces | anyBlackAttack);
        this.moveTargets[0] |= NOne(this.lightKing) & targetMask;
        this.moveTargets[1] |= NEOne(this.lightKing) & targetMask;
        this.moveTargets[2] |= EOne(this.lightKing) & targetMask;
        this.moveTargets[3] |= SEOne(this.lightKing) & targetMask;
        this.moveTargets[4] |= SOne(this.lightKing) & targetMask;
        this.moveTargets[5] |= SWOne(this.lightKing) & targetMask;
        this.moveTargets[6] |= WOne(this.lightKing) & targetMask;
        this.moveTargets[7] |= NWOne(this.lightKing) & targetMask;

        let mask = maskInit;
        let targetSquares;
        let endSq;
        let flag = 0b0000;
        for (let i = 0; i < 64; i++) {
            if (this.lightPieces & mask) {
                //NORTH
                targetSquares = slidingNorthRay(mask, this.occupied) & this.moveTargets[0];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    if (endSq & this.darkPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //NORTH EAST
                targetSquares = slidingNorthEastRay(mask, this.occupied) & this.moveTargets[1];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    if (endSq & this.darkPieces) flag = 0b0100;
                    else if (endSq & this.lightEnPassantTarget && SWOne(endSq) & this.lightPawns) {
                        flag = 0b0101;
                    }
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //EAST
                targetSquares = slidingEastRay(mask, this.occupied) & this.moveTargets[2];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    if (endSq & this.darkPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH EAST
                targetSquares = slidingSouthEastRay(mask, this.occupied) & this.moveTargets[3];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    if (endSq & this.darkPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH
                targetSquares = slidingSouthRay(mask, this.occupied) & this.moveTargets[4];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    if (endSq & this.darkPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH WEST
                targetSquares = slidingSouthWestRay(mask, this.occupied) & this.moveTargets[5];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    if (endSq & this.darkPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //WEST
                targetSquares = slidingWestRay(mask, this.occupied) & this.moveTargets[6];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    if (endSq & this.darkPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //NORTH WEST
                targetSquares = slidingNorthWestRay(mask, this.occupied) & this.moveTargets[7];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    if (endSq & this.darkPieces) flag = 0b0100;
                    else if (endSq & this.lightEnPassantTarget && SEOne(endSq) & this.lightPawns) {
                        flag = 0b0101;
                    }
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                if (mask & this.lightKnights) {
                    //NNE
                    targetSquares = NOne(NEOne(mask)) & this.moveTargets[8];
                    if (targetSquares) {
                        if (targetSquares & this.darkPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = EOne(NEOne(mask)) & this.moveTargets[9];
                    if (targetSquares) {
                        if (targetSquares & this.darkPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = EOne(SEOne(mask)) & this.moveTargets[10];
                    if (targetSquares) {
                        if (targetSquares & this.darkPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = SOne(SEOne(mask)) & this.moveTargets[11];
                    if (targetSquares) {
                        if (targetSquares & this.darkPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = SOne(SWOne(mask)) & this.moveTargets[12];
                    if (targetSquares) {
                        if (targetSquares & this.darkPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = WOne(SWOne(mask)) & this.moveTargets[13];
                    if (targetSquares) {
                        if (targetSquares & this.darkPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = WOne(NWOne(mask)) & this.moveTargets[14];
                    if (targetSquares) {
                        if (targetSquares & this.darkPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = NOne(NWOne(mask)) & this.moveTargets[15];
                    if (targetSquares) {
                        if (targetSquares & this.darkPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                }
            }
            mask >>= 1n;
        }

        return this.moveList;
    }

    getBlackMoves() {
        let horzInBetween, vertInBetween, diaInBetween, antiInBetween;
        let kingSuperAttacksOrtho, kingSuperAttacksDia;
        let anyWhiteAttack;

        //Black rooks and queens West
        let _whiteAttacks = westAttacks(
            this.lightRooks | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack = _whiteAttacks;
        let _superAttacks = slidingEastRay(this.darkKing, this.occupied);
        kingSuperAttacksOrtho = _superAttacks;
        horzInBetween = _whiteAttacks & _superAttacks;
        //Black rooks and queens East
        _whiteAttacks = eastAttacks(
            this.lightRooks | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingWestRay(this.darkKing, this.occupied);
        kingSuperAttacksOrtho |= _superAttacks;
        horzInBetween |= _whiteAttacks & _superAttacks;
        //Black rooks and queens North
        _whiteAttacks = northAttacks(
            this.lightRooks | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingSouthRay(this.darkKing, this.occupied);
        kingSuperAttacksOrtho |= _superAttacks;
        vertInBetween = _whiteAttacks & _superAttacks;
        //Black rooks and queens South
        _whiteAttacks = southAttacks(
            this.lightRooks | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingNorthRay(this.darkKing, this.occupied);
        kingSuperAttacksOrtho |= _superAttacks;
        vertInBetween |= _whiteAttacks & _superAttacks;

        //Black bishops and queens NE
        _whiteAttacks = northEastAttacks(
            this.lightBishops | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingSouthWestRay(this.darkKing, this.occupied);
        kingSuperAttacksDia = _superAttacks;
        diaInBetween = _whiteAttacks & _superAttacks;
        //Black bishops and queens SW
        _whiteAttacks = southWestAttacks(
            this.lightBishops | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingNorthEastRay(this.darkKing, this.occupied);
        kingSuperAttacksDia |= _superAttacks;
        diaInBetween |= _whiteAttacks & _superAttacks;
        //Black bishops and queens NW
        _whiteAttacks = northWestAttacks(
            this.lightBishops | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingSouthEastRay(this.darkKing, this.occupied);
        kingSuperAttacksDia |= _superAttacks;
        antiInBetween = _whiteAttacks & _superAttacks;
        //Black bishops and queens SE
        _whiteAttacks = southEastAttacks(
            this.lightBishops | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingNorthWestRay(this.darkKing, this.occupied);
        kingSuperAttacksDia |= _superAttacks;
        antiInBetween |= _whiteAttacks & _superAttacks;

        //Knights, Pawns, King
        anyWhiteAttack |= knightAttacks(this.lightKnights);
        anyWhiteAttack |= whitePawnEastAttacks(this.lightPawns);
        anyWhiteAttack |= whitePawnWestAttacks(this.lightPawns);
        anyWhiteAttack |= kingAttacksFromSquare[getSquareIndex(this.lightKing)];

        //Calc Check
        let allInBetween = horzInBetween | vertInBetween | diaInBetween | antiInBetween;
        let _blocks = allInBetween & ~this.occupied;
        let _checkFrom =
            (kingSuperAttacksOrtho & (this.lightRooks | this.lightQueen)) |
            (kingSuperAttacksDia & (this.lightBishops | this.lightQueen)) |
            (knightAttacks(this.darkKing) & this.lightKnights) |
            (darkPawnAttacksFromSquare[getSquareIndex(this.darkKing)] & this.lightPawns);

        let _nullIfCheck = ((anyWhiteAttack & this.darkKing) - 1n) >> 63n;
        let _nullIfDoubleCheck = ((_checkFrom & (_checkFrom - 1n)) - 1n) >> 63n;

        let _checkTo = _checkFrom | _blocks | _nullIfCheck;
        let targetMask = ~this.darkPieces & _checkTo & _nullIfDoubleCheck;

        //Horizontal queen and rook moves
        let _sliders = (this.darkRooks | this.darkQueen) & ~(allInBetween ^ horzInBetween);
        this.moveTargets[6] = westAttacks(_sliders, ~this.occupied) & targetMask;
        this.moveTargets[2] = eastAttacks(_sliders, ~this.occupied) & targetMask;
        //Vertical queen and rook moves
        _sliders = (this.darkRooks | this.darkQueen) & ~(allInBetween ^ vertInBetween);
        this.moveTargets[0] = northAttacks(_sliders, ~this.occupied) & targetMask;
        this.moveTargets[4] = southAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        //Diagonal queen and bishop moves
        _sliders = (this.darkBishops | this.darkQueen) & ~(allInBetween ^ diaInBetween);
        this.moveTargets[1] = northEastAttacks(_sliders, ~this.occupied) & targetMask;
        this.moveTargets[5] = southWestAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        //Antidiagonal queen and rook moves
        _sliders = (this.darkBishops | this.darkQueen) & ~(allInBetween ^ antiInBetween);
        this.moveTargets[3] = southEastAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        this.moveTargets[7] = northWestAttacks(_sliders, ~this.occupied) & targetMask;

        //Knights
        let _knights = this.darkKnights & ~allInBetween;
        this.moveTargets[8] = NOne(NEOne(_knights)) & targetMask;
        this.moveTargets[9] = EOne(NEOne(_knights)) & targetMask;
        this.moveTargets[10] = EOne(SEOne(_knights)) & targetMask;
        this.moveTargets[11] = SOne(SEOne(_knights)) & targetMask;
        this.moveTargets[12] = SOne(SWOne(_knights)) & targetMask;
        this.moveTargets[13] = WOne(SWOne(_knights)) & targetMask;
        this.moveTargets[14] = WOne(NWOne(_knights)) & targetMask;
        this.moveTargets[15] = NOne(NWOne(_knights)) & targetMask;

        //Pawns
        let _targets = (this.lightPieces & targetMask) | (this.darkEnPassantTarget & targetMask);
        if (!_nullIfCheck && this.darkEnPassantTarget)
            if (SWOne(this.darkKing) & this.lightPawns || SEOne(this.darkKing) & this.lightPawns)
                _targets |= this.darkEnPassantTarget;
        let _pawns = this.darkPawns & ~(allInBetween ^ antiInBetween);
        this.moveTargets[3] |= SEOne(_pawns) & _targets;
        _pawns = this.darkPawns & ~(allInBetween ^ diaInBetween);
        this.moveTargets[5] |= SWOne(_pawns) & _targets;
        _pawns = this.darkPawns & ~(allInBetween ^ vertInBetween);
        let _pawnPushes = SOne(_pawns) & ~this.occupied;
        this.moveTargets[4] |= _pawnPushes & targetMask;
        let _rank5 = 0x00000000ff000000n;
        this.moveTargets[4] |= SOne(_pawnPushes) & ~this.occupied & targetMask & _rank5;

        //King
        targetMask = ~(this.darkPieces | anyWhiteAttack);
        this.moveTargets[0] |= NOne(this.darkKing) & targetMask;
        this.moveTargets[1] |= NEOne(this.darkKing) & targetMask;
        this.moveTargets[2] |= EOne(this.darkKing) & targetMask;
        this.moveTargets[3] |= SEOne(this.darkKing) & targetMask;
        this.moveTargets[4] |= SOne(this.darkKing) & targetMask;
        this.moveTargets[5] |= SWOne(this.darkKing) & targetMask;
        this.moveTargets[6] |= WOne(this.darkKing) & targetMask;
        this.moveTargets[7] |= NWOne(this.darkKing) & targetMask;

        let mask = maskInit;
        let targetSquares;
        let endSq;
        let flag = 0b0000;
        for (let i = 0; i < 64; i++) {
            if (this.darkPieces & mask) {
                //NORTH
                targetSquares = slidingNorthRay(mask, this.occupied) & this.moveTargets[0];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    if (endSq & this.lightPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //NORTH EAST
                targetSquares = slidingNorthEastRay(mask, this.occupied) & this.moveTargets[1];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    if (endSq & this.lightPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //EAST
                targetSquares = slidingEastRay(mask, this.occupied) & this.moveTargets[2];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    if (endSq & this.lightPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH EAST
                targetSquares = slidingSouthEastRay(mask, this.occupied) & this.moveTargets[3];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    if (endSq & this.lightPieces) flag = 0b0100;
                    else if (endSq & this.darkEnPassantTarget && NWOne(endSq) & this.darkPawns) {
                        flag = 0b0101;
                    }
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH
                targetSquares = slidingSouthRay(mask, this.occupied) & this.moveTargets[4];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    if (endSq & this.lightPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH WEST
                targetSquares = slidingSouthWestRay(mask, this.occupied) & this.moveTargets[5];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    if (endSq & this.lightPieces) flag = 0b0100;
                    else if (endSq & this.darkEnPassantTarget && NEOne(endSq) & this.darkPawns) {
                        flag = 0b0101;
                    }
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //WEST
                targetSquares = slidingWestRay(mask, this.occupied) & this.moveTargets[6];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    if (endSq & this.lightPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //NORTH WEST
                targetSquares = slidingNorthWestRay(mask, this.occupied) & this.moveTargets[7];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    if (endSq & this.lightPieces) flag = 0b0100;
                    this.moveList.push(new Move(getSquareIndex(mask), getSquareIndex(endSq), flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                if (mask & this.darkKnights) {
                    //NNE
                    targetSquares = NOne(NEOne(mask)) & this.moveTargets[8];
                    if (targetSquares) {
                        if (targetSquares & this.lightPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = EOne(NEOne(mask)) & this.moveTargets[9];
                    if (targetSquares) {
                        if (targetSquares & this.lightPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = EOne(SEOne(mask)) & this.moveTargets[10];
                    if (targetSquares) {
                        if (targetSquares & this.lightPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = SOne(SEOne(mask)) & this.moveTargets[11];
                    if (targetSquares) {
                        if (targetSquares & this.lightPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = SOne(SWOne(mask)) & this.moveTargets[12];
                    if (targetSquares) {
                        if (targetSquares & this.lightPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = WOne(SWOne(mask)) & this.moveTargets[13];
                    if (targetSquares) {
                        if (targetSquares & this.lightPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = WOne(NWOne(mask)) & this.moveTargets[14];
                    if (targetSquares) {
                        if (targetSquares & this.lightPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = NOne(NWOne(mask)) & this.moveTargets[15];
                    if (targetSquares) {
                        if (targetSquares & this.lightPieces) flag = 0b0100;
                        this.moveList.push(
                            new Move(getSquareIndex(mask), getSquareIndex(targetSquares), flag)
                        );
                        flag = 0b0000;
                    }
                }
            }
            mask >>= 1n;
        }

        return this.moveList;
    }

    makeMove(move) {
        let start = getBinFromSquare(move.from);
        let target = getBinFromSquare(move.target);

        //console.log(move.from, " --> ", move.target);

        if (move.getButterflyIndex() & CAPTURE_FLAG) {
            this.captureCount++;
            if (start & this.lightPieces) {
                if (move.getButterflyIndex() == 0b0101) {
                    //EP Capture
                    this.darkPawns &= ~(target << 8n);
                } else {
                    if (target & this.darkPawns) {
                        this.capturedBlackPieceStack.push(0);
                    }
                    if (target & this.darkRooks) this.capturedBlackPieceStack.push(1);
                    if (target & this.darkKnights) this.capturedBlackPieceStack.push(2);
                    if (target & this.darkBishops) this.capturedBlackPieceStack.push(3);
                    if (target & this.darkQueen) this.capturedBlackPieceStack.push(4);
                    this.darkPawns &= ~target;
                    this.darkRooks &= ~target;
                    this.darkKnights &= ~target;
                    this.darkBishops &= ~target;
                    this.darkQueen &= ~target;
                }
            } else {
                if (move.getButterflyIndex() == 0b0101) {
                    //EP Capture
                    this.lightPawns &= ~(target >> 8n);
                } else {
                    if (target & this.lightPawns) this.capturedWhitePieceStack.push(0);
                    if (target & this.lightRooks) this.capturedWhitePieceStack.push(1);
                    if (target & this.lightKnights) this.capturedWhitePieceStack.push(2);
                    if (target & this.lightBishops) this.capturedWhitePieceStack.push(3);
                    if (target & this.lightQueen) this.capturedWhitePieceStack.push(4);
                    this.lightPawns &= ~target;
                    this.lightRooks &= ~target;
                    this.lightKnights &= ~target;
                    this.lightBishops &= ~target;
                    this.lightQueen &= ~target;
                }
            }
        }

        this.lightEnPassantTarget = 0n;
        this.darkEnPassantTarget = 0n;

        if (start & this.lightPawns) {
            this.lightPawns &= ~start;
            this.lightPawns |= target;
            if (target & 0x000000ff00000000n && start & 0x00ff000000000000n) {
                if (WOne(target) & this.darkPawns) {
                    if (
                        !(
                            (slidingEastRay(target, this.occupied) |
                                slidingWestRay(target, this.occupied & ~WOne(target))) &
                                this.darkKing &&
                            (slidingEastRay(target, this.occupied) |
                                slidingWestRay(target, this.occupied & ~WOne(target))) &
                                (this.lightRooks | this.lightQueen)
                        )
                    ) {
                        this.darkEnPassantTarget = target << 8n;
                    }
                } else if (EOne(target) & this.darkPawns) {
                    if (
                        !(
                            (slidingEastRay(target, this.occupied & ~EOne(target)) |
                                slidingWestRay(target, this.occupied)) &
                                this.darkKing &&
                            (slidingEastRay(target, this.occupied & ~EOne(target)) |
                                slidingWestRay(target, this.occupied)) &
                                (this.lightRooks | this.lightQueen)
                        )
                    ) {
                        this.darkEnPassantTarget = target << 8n;
                    }
                }
            }
        }
        if (start & this.lightRooks) {
            this.lightRooks &= ~start;
            this.lightRooks |= target;
        }
        if (start & this.lightBishops) {
            this.lightBishops &= ~start;
            this.lightBishops |= target;
        }
        if (start & this.lightQueen) {
            this.lightQueen &= ~start;
            this.lightQueen |= target;
        }
        if (start & this.lightKnights) {
            this.lightKnights &= ~start;
            this.lightKnights |= target;
        }
        if (start & this.lightKing) {
            this.lightKing &= ~start;
            this.lightKing |= target;
        }
        if (start & this.darkPawns) {
            this.darkPawns &= ~start;
            this.darkPawns |= target;
            if (target & 0x00000000ff000000n && start & 0x000000000000ff00n) {
                if (WOne(target) & this.lightPawns) {
                    if (
                        !(
                            (slidingEastRay(target, this.occupied) |
                                slidingWestRay(target, this.occupied & ~WOne(target))) &
                                this.lightKing &&
                            (slidingEastRay(target, this.occupied) |
                                slidingWestRay(target, this.occupied & ~WOne(target))) &
                                (this.darkRooks | this.darkQueen)
                        )
                    ) {
                        this.lightEnPassantTarget = target >> 8n;
                    }
                } else if (EOne(target) & this.lightPawns) {
                    if (
                        !(
                            (slidingEastRay(target, this.occupied & ~EOne(target)) |
                                slidingWestRay(target, this.occupied)) &
                                this.lightKing &&
                            (slidingEastRay(target, this.occupied & ~EOne(target)) |
                                slidingWestRay(target, this.occupied)) &
                                (this.darkRooks | this.darkQueen)
                        )
                    ) {
                        this.lightEnPassantTarget = target >> 8n;
                    }
                }
            }
        }
        if (start & this.darkRooks) {
            this.darkRooks &= ~start;
            this.darkRooks |= target;
        }
        if (start & this.darkBishops) {
            this.darkBishops &= ~start;
            this.darkBishops |= target;
        }
        if (start & this.darkQueen) {
            this.darkQueen &= ~start;
            this.darkQueen |= target;
        }
        if (start & this.darkKnights) {
            this.darkKnights &= ~start;
            this.darkKnights |= target;
        }
        if (start & this.darkKing) {
            this.darkKing &= ~start;
            this.darkKing |= target;
        }

        this.lightPieces =
            this.lightKnights |
            this.lightPawns |
            this.lightRooks |
            this.lightQueen |
            this.lightKing |
            this.lightBishops;
        this.darkPieces =
            this.darkKnights |
            this.darkPawns |
            this.darkRooks |
            this.darkQueen |
            this.darkKing |
            this.darkBishops;
        this.occupied = this.lightPieces | this.darkPieces;

        this.playerBoolean = !this.playerBoolean;
        this.moveList = [];
    }

    unmakeMove(move) {
        let start = getBinFromSquare(move.target);
        let target = getBinFromSquare(move.from);

        if (start & this.lightPawns) {
            this.lightPawns &= ~start;
            this.lightPawns |= target;
        }
        if (start & this.lightRooks) {
            this.lightRooks &= ~start;
            this.lightRooks |= target;
        }
        if (start & this.lightBishops) {
            this.lightBishops &= ~start;
            this.lightBishops |= target;
        }
        if (start & this.lightQueen) {
            this.lightQueen &= ~start;
            this.lightQueen |= target;
        }
        if (start & this.lightKnights) {
            this.lightKnights &= ~start;
            this.lightKnights |= target;
        }
        if (start & this.lightKing) {
            this.lightKing &= ~start;
            this.lightKing |= target;
        }
        if (start & this.darkPawns) {
            this.darkPawns &= ~start;
            this.darkPawns |= target;
        }
        if (start & this.darkRooks) {
            this.darkRooks &= ~start;
            this.darkRooks |= target;
        }
        if (start & this.darkBishops) {
            this.darkBishops &= ~start;
            this.darkBishops |= target;
        }
        if (start & this.darkQueen) {
            this.darkQueen &= ~start;
            this.darkQueen |= target;
        }
        if (start & this.darkKnights) {
            this.darkKnights &= ~start;
            this.darkKnights |= target;
        }
        if (start & this.darkKing) {
            this.darkKing &= ~start;
            this.darkKing |= target;
        }

        if (move.getButterflyIndex() & CAPTURE_FLAG) {
            if (start & this.lightPieces) {
                if (move.getButterflyIndex() == 0b0101) {
                    //EP Capture
                    this.darkPawns |= start << 8n;
                } else {
                    let piece = this.capturedBlackPieceStack.pop();
                    if (piece == 0) this.darkPawns |= start;
                    else if (piece == 1) this.darkRooks |= start;
                    else if (piece == 2) this.darkKnights |= start;
                    else if (piece == 3) this.darkBishops |= start;
                    else if (piece == 4) this.darkQueen |= start;
                }
            } else {
                if (move.getButterflyIndex() == 0b0101) {
                    this.lightPawns |= start >> 8n;
                } else {
                    let piece = this.capturedWhitePieceStack.pop();
                    if (piece == 0) this.lightPawns |= start;
                    else if (piece == 1) this.lightRooks |= start;
                    else if (piece == 2) this.lightKnights |= start;
                    else if (piece == 3) this.lightBishops |= start;
                    else if (piece == 4) this.lightQueen |= start;
                }
            }
        }

        this.lightPieces =
            this.lightKnights |
            this.lightPawns |
            this.lightRooks |
            this.lightQueen |
            this.lightKing |
            this.lightBishops;
        this.darkPieces =
            this.darkKnights |
            this.darkPawns |
            this.darkRooks |
            this.darkQueen |
            this.darkKing |
            this.darkBishops;
        this.occupied = this.lightPieces | this.darkPieces;
        this.playerBoolean = !this.playerBoolean;
        this.moveList = [];
    }

    perft(depth) {
        if (depth == 0) {
            return 1;
        }
        let moves;
        if (this.playerBoolean) moves = this.getWhiteMoves();
        else moves = this.getBlackMoves();

        let count = 0;
        for (let i = 0; i < moves.length; i++) {
            this.makeMove(moves[i]);
            //this.updateGUI();
            //window.prompt("next");
            count += this.perft(depth - 1);
            if (depth == PERFT_DEPTH) this.divideArr.push(count);
            this.unmakeMove(moves[i]);
            //this.updateGUI();
        }

        return count;
    }

    updateGUI() {
        let mask = maskInit;
        let sq = "";
        let div;
        let node;
        for (let i = 1; i <= 8; i++) {
            for (let j = 65; j <= 72; j++) {
                sq = String.fromCharCode(j);
                sq += i;
                div = document.querySelector("." + sq);
                if (div.firstChild) div.removeChild(div.firstChild);

                if (mask & this.occupied) {
                    node = document.createElement("IMG");
                    if (mask & this.lightPawns) node.src = "images/whitePawn.png";
                    else if (mask & this.lightRooks) node.src = "images/whiteRook.png";
                    else if (mask & this.lightKnights) node.src = "images/whiteKnight.png";
                    else if (mask & this.lightBishops) node.src = "images/whiteBishop.png";
                    else if (mask & this.lightQueen) node.src = "images/whiteQueen.png";
                    else if (mask & this.lightKing) node.src = "images/whiteKing.png";
                    else if (mask & this.darkPawns) node.src = "images/blackPawn.png";
                    else if (mask & this.darkRooks) node.src = "images/blackRook.png";
                    else if (mask & this.darkKnights) node.src = "images/blackKnight.png";
                    else if (mask & this.darkBishops) node.src = "images/blackBishop.png";
                    else if (mask & this.darkQueen) node.src = "images/blackQueen.png";
                    else if (mask & this.darkKing) node.src = "images/blackKing.png";

                    div.append(node);
                    node = null;
                }
                mask >>= 1n;
            }
        }
    }
}

let board15 = new UpdatedBoard();
console.log("In second thing");

console.log(board15.perft(PERFT_DEPTH));
board15.updateGUI();
console.log(board15.captureCount, getArrayDiff(board15.divideArr));
