const CAPTURE_FLAG = 0b0100;
const CASTLE_SHORT_FLAG = 0b0010;
const CASTLE_LONG_FLAG = 0b0011;
const EN_PASSANT_FLAG = 0b0101;
const KNIGHT_PROMO = 0b1000;
const BISHOP_PROMO = 0b1001;
const ROOK_PROMO = 0b1010;
const QUEEN_PROMO = 0b1011;
const PERFT_DEPTH = 5;

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
            ["r", " ", " ", " ", "k", " ", " ", "r"],
            ["p", " ", "p", "p", "q", "p", "b", " "],
            ["b", "n", " ", " ", "p", "n", "p", " "],
            [" ", " ", " ", "P", "N", " ", " ", " "],
            [" ", "p", " ", " ", "P", " ", " ", " "],
            [" ", " ", "N", " ", " ", "Q", " ", "p"],
            ["P", "P", "P", "B", "B", "P", "P", "P"],
            ["R", " ", " ", " ", "K", " ", " ", "R"],
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
        this.darkCastleBroken = false;
        this.lightCastleBroken = false;
        this.lightOldRights = [true, true];
        this.darkOldRights = [true, true];

        //Store En-Passant Squares
        this.lightEnPassantTarget = 0n;
        this.darkEnPassantTarget = 0n;

        this.playerBoolean = true;

        //Reversible Moves
        this.reversibleMoves = 0;

        //Move target
        this.capturedBlackPieceStack = [];
        this.capturedWhitePieceStack = [];

        this.captureCount = 0;
        this.divideArr = [];

        //Copied from tables to keep local scope
        this.rayAttacksFromSquare = rayAttacksFromSquare;
        this.binaryDict = binaryDict;

        // this.bitBoardFromArray(this.boardArray);
        this.bitboardFromFEN();
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
        let moveTargets = [],
            moveList = [];

        //Black rooks and queens West
        let _blackAttacks = westAttacks(
            this.darkRooks | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack = _blackAttacks;
        let _superAttacks = slidingEastRay(
            this.lightKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksOrtho = _superAttacks;
        horzInBetween = _blackAttacks & _superAttacks;
        //Black rooks and queens East
        _blackAttacks = eastAttacks(
            this.darkRooks | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingWestRay(
            this.lightKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksOrtho |= _superAttacks;
        horzInBetween |= _blackAttacks & _superAttacks;
        //Black rooks and queens North
        _blackAttacks = northAttacks(
            this.darkRooks | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingSouthRay(
            this.lightKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksOrtho |= _superAttacks;
        vertInBetween = _blackAttacks & _superAttacks;
        //Black rooks and queens South
        _blackAttacks = southAttacks(
            this.darkRooks | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingNorthRay(
            this.lightKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksOrtho |= _superAttacks;
        vertInBetween |= _blackAttacks & _superAttacks;

        //Black bishops and queens NE
        _blackAttacks = northEastAttacks(
            this.darkBishops | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingSouthWestRay(
            this.lightKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksDia = _superAttacks;
        diaInBetween = _blackAttacks & _superAttacks;
        //Black bishops and queens SW
        _blackAttacks = southWestAttacks(
            this.darkBishops | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingNorthEastRay(
            this.lightKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksDia |= _superAttacks;
        diaInBetween |= _blackAttacks & _superAttacks;
        //Black bishops and queens NW
        _blackAttacks = northWestAttacks(
            this.darkBishops | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingSouthEastRay(
            this.lightKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksDia |= _superAttacks;
        antiInBetween = _blackAttacks & _superAttacks;
        //Black bishops and queens SE
        _blackAttacks = southEastAttacks(
            this.darkBishops | this.darkQueen,
            ~(this.occupied & ~this.lightKing)
        );
        anyBlackAttack |= _blackAttacks;
        _superAttacks = slidingNorthWestRay(
            this.lightKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksDia |= _superAttacks;
        antiInBetween |= _blackAttacks & _superAttacks;

        //Knights, Pawns, King
        anyBlackAttack |= knightAttacks(this.darkKnights);
        anyBlackAttack |= blackPawnEastAttacks(this.darkPawns);
        anyBlackAttack |= blackPawnWestAttacks(this.darkPawns);
        anyBlackAttack |= kingAttacksFromSquare[this.binaryDict[this.darkKing]];

        //Calc Check
        let allInBetween = horzInBetween | vertInBetween | diaInBetween | antiInBetween;
        let _blocks = allInBetween & ~this.occupied;
        let _checkFrom =
            (kingSuperAttacksOrtho & (this.darkRooks | this.darkQueen)) |
            (kingSuperAttacksDia & (this.darkBishops | this.darkQueen)) |
            (knightAttacks(this.lightKing) & this.darkKnights) |
            (lightPawnAttacksFromSquare[this.binaryDict[this.lightKing]] & this.darkPawns);

        let _nullIfCheck = ((anyBlackAttack & this.lightKing) - 1n) >> 63n;
        let _nullIfDoubleCheck = ((_checkFrom & (_checkFrom - 1n)) - 1n) >> 63n;

        let _checkTo = _checkFrom | _blocks | _nullIfCheck;
        let targetMask = ~this.lightPieces & _checkTo & _nullIfDoubleCheck;

        //Horizontal queen and rook moves
        let _sliders = (this.lightRooks | this.lightQueen) & ~(allInBetween ^ horzInBetween);
        moveTargets[6] = westAttacks(_sliders, ~this.occupied) & targetMask;
        moveTargets[2] = eastAttacks(_sliders, ~this.occupied) & targetMask;
        //Vertical queen and rook moves
        _sliders = (this.lightRooks | this.lightQueen) & ~(allInBetween ^ vertInBetween);
        moveTargets[0] = northAttacks(_sliders, ~this.occupied) & targetMask;
        moveTargets[4] = southAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        //Diagonal queen and bishop moves
        _sliders = (this.lightBishops | this.lightQueen) & ~(allInBetween ^ diaInBetween);
        moveTargets[1] = northEastAttacks(_sliders, ~this.occupied) & targetMask;
        moveTargets[5] = southWestAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        //Antidiagonal queen and rook moves
        _sliders = (this.lightBishops | this.lightQueen) & ~(allInBetween ^ antiInBetween);
        moveTargets[3] = southEastAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        moveTargets[7] = northWestAttacks(_sliders, ~this.occupied) & targetMask;

        //Knights
        let _knights = this.lightKnights & ~allInBetween;
        moveTargets[8] = NOne(NEOne(_knights)) & targetMask;
        moveTargets[9] = EOne(NEOne(_knights)) & targetMask;
        moveTargets[10] = EOne(SEOne(_knights)) & targetMask;
        moveTargets[11] = SOne(SEOne(_knights)) & targetMask;
        moveTargets[12] = SOne(SWOne(_knights)) & targetMask;
        moveTargets[13] = WOne(SWOne(_knights)) & targetMask;
        moveTargets[14] = WOne(NWOne(_knights)) & targetMask;
        moveTargets[15] = NOne(NWOne(_knights)) & targetMask;

        //Pawns
        let _targets = (this.darkPieces & targetMask) | (this.lightEnPassantTarget & targetMask);
        let _otherCheck =
            NWOne(this.lightKing) & this.darkPawns || NEOne(this.lightKing) & this.darkPawns;
        _targets |= this.lightEnPassantTarget * BigInt(!_nullIfCheck * (_otherCheck != 0));
        let _pawns = this.lightPawns & ~(allInBetween ^ diaInBetween);
        moveTargets[1] |= NEOne(_pawns) & _targets;
        _pawns = this.lightPawns & ~(allInBetween ^ antiInBetween);
        moveTargets[7] |= NWOne(_pawns) & _targets;
        _pawns = this.lightPawns & ~(allInBetween ^ vertInBetween);
        let _pawnPushes = NOne(_pawns) & ~this.occupied;
        moveTargets[0] |= _pawnPushes & targetMask;
        let _rank4 = 0x000000ff00000000n;
        moveTargets[0] |= NOne(_pawnPushes) & ~this.occupied & targetMask & _rank4;

        //King
        targetMask = ~(this.lightPieces | anyBlackAttack);
        moveTargets[0] |= NOne(this.lightKing) & targetMask;
        moveTargets[1] |= NEOne(this.lightKing) & targetMask;
        moveTargets[2] |= EOne(this.lightKing) & targetMask;
        moveTargets[3] |= SEOne(this.lightKing) & targetMask;
        moveTargets[4] |= SOne(this.lightKing) & targetMask;
        moveTargets[5] |= SWOne(this.lightKing) & targetMask;
        moveTargets[6] |= WOne(this.lightKing) & targetMask;
        moveTargets[7] |= NWOne(this.lightKing) & targetMask;

        //Castling
        let _KSCastleBool = this.lightCastleRights[0];
        _KSCastleBool *= (this.lightKing & binarySquares[4]) != 0n;
        _KSCastleBool *= !(anyBlackAttack & wKingCastleMask) && !(this.occupied & wKingCastleMask);
        let _QSCastleBool = this.lightCastleRights[1];
        let _QSCastleMask = 0b0111000000000000000000000000000000000000000000000000000000000000n;
        _QSCastleBool *= (this.lightKing & binarySquares[4]) != 0n;
        _QSCastleBool *= !(anyBlackAttack & wQueenCastleMask) && !(this.occupied & _QSCastleMask);
        if (_KSCastleBool) moveList.push(new Move(4, 6, CASTLE_SHORT_FLAG));
        if (_QSCastleBool) moveList.push(new Move(4, 2, CASTLE_LONG_FLAG));

        let mask = maskInit;
        let targetSquares;
        let endSq;
        let flag = 0b0000;
        let _rank8 = 0x00000000000000ffn;
        for (let i = 0; i < 64; i++) {
            if (this.lightPieces & mask) {
                //NORTH
                targetSquares =
                    slidingNorthRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[0];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.darkPieces) != 0n);

                    //Promotion
                    if (mask & this.lightPawns && endSq & _rank8) {
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                KNIGHT_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                BISHOP_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                ROOK_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                QUEEN_PROMO | flag
                            )
                        );
                    } else
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[endSq], flag)
                        );
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //NORTH EAST
                targetSquares =
                    slidingNorthEastRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[1];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    if (endSq & this.darkPieces) flag = 0b0100;
                    else if (endSq & this.lightEnPassantTarget && SWOne(endSq) & this.lightPawns) {
                        flag = 0b0101;
                    }

                    //Promotion
                    if (mask & this.lightPawns && endSq & _rank8) {
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                KNIGHT_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                BISHOP_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                ROOK_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                QUEEN_PROMO | flag
                            )
                        );
                    } else
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[endSq], flag)
                        );
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //EAST
                targetSquares =
                    slidingEastRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[2];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.darkPieces) != 0n);
                    moveList.push(new Move(this.binaryDict[mask], this.binaryDict[endSq], flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH EAST
                targetSquares =
                    slidingSouthEastRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[3];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.darkPieces) != 0n);
                    moveList.push(new Move(this.binaryDict[mask], this.binaryDict[endSq], flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH
                targetSquares =
                    slidingSouthRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[4];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.darkPieces) != 0n);
                    moveList.push(new Move(this.binaryDict[mask], this.binaryDict[endSq], flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH WEST
                targetSquares =
                    slidingSouthWestRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[5];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.darkPieces) != 0n);
                    moveList.push(new Move(this.binaryDict[mask], this.binaryDict[endSq], flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //WEST
                targetSquares =
                    slidingWestRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[6];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.darkPieces) != 0n);
                    moveList.push(new Move(this.binaryDict[mask], this.binaryDict[endSq], flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //NORTH WEST
                targetSquares =
                    slidingNorthWestRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[7];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.darkPieces) != 0n);
                    flag |=
                        0b0001 *
                        Boolean(
                            (endSq & this.lightEnPassantTarget) != 0 &&
                                (SEOne(endSq) & this.lightPawns) != 0
                        );

                    //Promotion
                    if (mask & this.lightPawns && endSq & _rank8) {
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                KNIGHT_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                BISHOP_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                ROOK_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                QUEEN_PROMO | flag
                            )
                        );
                    } else
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[endSq], flag)
                        );
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                if (mask & this.lightKnights) {
                    //NNE
                    targetSquares = NOne(NEOne(mask)) & moveTargets[8];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.darkPieces) != 0n);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = EOne(NEOne(mask)) & moveTargets[9];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.darkPieces) != 0n);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = EOne(SEOne(mask)) & moveTargets[10];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.darkPieces) != 0n);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = SOne(SEOne(mask)) & moveTargets[11];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.darkPieces) != 0n);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = SOne(SWOne(mask)) & moveTargets[12];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.darkPieces) != 0n);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = WOne(SWOne(mask)) & moveTargets[13];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.darkPieces) != 0n);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = WOne(NWOne(mask)) & moveTargets[14];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.darkPieces) != 0n);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = NOne(NWOne(mask)) & moveTargets[15];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.darkPieces) != 0n);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                }
            }
            mask >>= 1n;
        }

        return moveList;
    }

    getBlackMoves() {
        let horzInBetween, vertInBetween, diaInBetween, antiInBetween;
        let kingSuperAttacksOrtho, kingSuperAttacksDia;
        let anyWhiteAttack;
        let moveTargets = [],
            moveList = [];

        //Black rooks and queens West
        let _whiteAttacks = westAttacks(
            this.lightRooks | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack = _whiteAttacks;
        let _superAttacks = slidingEastRay(
            this.darkKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksOrtho = _superAttacks;
        horzInBetween = _whiteAttacks & _superAttacks;
        //Black rooks and queens East
        _whiteAttacks = eastAttacks(
            this.lightRooks | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingWestRay(
            this.darkKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksOrtho |= _superAttacks;
        horzInBetween |= _whiteAttacks & _superAttacks;
        //Black rooks and queens North
        _whiteAttacks = northAttacks(
            this.lightRooks | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingSouthRay(
            this.darkKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksOrtho |= _superAttacks;
        vertInBetween = _whiteAttacks & _superAttacks;
        //Black rooks and queens South
        _whiteAttacks = southAttacks(
            this.lightRooks | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingNorthRay(
            this.darkKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksOrtho |= _superAttacks;
        vertInBetween |= _whiteAttacks & _superAttacks;

        //Black bishops and queens NE
        _whiteAttacks = northEastAttacks(
            this.lightBishops | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingSouthWestRay(
            this.darkKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksDia = _superAttacks;
        diaInBetween = _whiteAttacks & _superAttacks;
        //Black bishops and queens SW
        _whiteAttacks = southWestAttacks(
            this.lightBishops | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingNorthEastRay(
            this.darkKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksDia |= _superAttacks;
        diaInBetween |= _whiteAttacks & _superAttacks;
        //Black bishops and queens NW
        _whiteAttacks = northWestAttacks(
            this.lightBishops | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingSouthEastRay(
            this.darkKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksDia |= _superAttacks;
        antiInBetween = _whiteAttacks & _superAttacks;
        //Black bishops and queens SE
        _whiteAttacks = southEastAttacks(
            this.lightBishops | this.lightQueen,
            ~(this.occupied & ~this.darkKing)
        );
        anyWhiteAttack |= _whiteAttacks;
        _superAttacks = slidingNorthWestRay(
            this.darkKing,
            this.occupied,
            this.binaryDict,
            this.rayAttacksFromSquare
        );
        kingSuperAttacksDia |= _superAttacks;
        antiInBetween |= _whiteAttacks & _superAttacks;

        //Knights, Pawns, King
        anyWhiteAttack |= knightAttacks(this.lightKnights);
        anyWhiteAttack |= whitePawnEastAttacks(this.lightPawns);
        anyWhiteAttack |= whitePawnWestAttacks(this.lightPawns);
        anyWhiteAttack |= kingAttacksFromSquare[this.binaryDict[this.lightKing]];

        //Calc Check
        let allInBetween = horzInBetween | vertInBetween | diaInBetween | antiInBetween;
        let _blocks = allInBetween & ~this.occupied;
        let _checkFrom =
            (kingSuperAttacksOrtho & (this.lightRooks | this.lightQueen)) |
            (kingSuperAttacksDia & (this.lightBishops | this.lightQueen)) |
            (knightAttacks(this.darkKing) & this.lightKnights) |
            (darkPawnAttacksFromSquare[this.binaryDict[this.darkKing]] & this.lightPawns);

        let _nullIfCheck = ((anyWhiteAttack & this.darkKing) - 1n) >> 63n;
        let _nullIfDoubleCheck = ((_checkFrom & (_checkFrom - 1n)) - 1n) >> 63n;

        let _checkTo = _checkFrom | _blocks | _nullIfCheck;
        let targetMask = ~this.darkPieces & _checkTo & _nullIfDoubleCheck;

        //Horizontal queen and rook moves
        let _sliders = (this.darkRooks | this.darkQueen) & ~(allInBetween ^ horzInBetween);
        moveTargets[6] = westAttacks(_sliders, ~this.occupied) & targetMask;
        moveTargets[2] = eastAttacks(_sliders, ~this.occupied) & targetMask;
        //Vertical queen and rook moves
        _sliders = (this.darkRooks | this.darkQueen) & ~(allInBetween ^ vertInBetween);
        moveTargets[0] = northAttacks(_sliders, ~this.occupied) & targetMask;
        moveTargets[4] = southAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        //Diagonal queen and bishop moves
        _sliders = (this.darkBishops | this.darkQueen) & ~(allInBetween ^ diaInBetween);
        moveTargets[1] = northEastAttacks(_sliders, ~this.occupied) & targetMask;
        moveTargets[5] = southWestAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        //Antidiagonal queen and rook moves
        _sliders = (this.darkBishops | this.darkQueen) & ~(allInBetween ^ antiInBetween);
        moveTargets[3] = southEastAttacks(_sliders, ~this.occupied) & targetMask & boardMask;
        moveTargets[7] = northWestAttacks(_sliders, ~this.occupied) & targetMask;

        //Knights
        let _knights = this.darkKnights & ~allInBetween;
        moveTargets[8] = NOne(NEOne(_knights)) & targetMask;
        moveTargets[9] = EOne(NEOne(_knights)) & targetMask;
        moveTargets[10] = EOne(SEOne(_knights)) & targetMask;
        moveTargets[11] = SOne(SEOne(_knights)) & targetMask;
        moveTargets[12] = SOne(SWOne(_knights)) & targetMask;
        moveTargets[13] = WOne(SWOne(_knights)) & targetMask;
        moveTargets[14] = WOne(NWOne(_knights)) & targetMask;
        moveTargets[15] = NOne(NWOne(_knights)) & targetMask;

        //Pawns
        let _targets = (this.lightPieces & targetMask) | (this.darkEnPassantTarget & targetMask);
        let _otherCheck =
            SWOne(this.darkKing) & this.lightPawns || SEOne(this.darkKing) & this.lightPawns;
        _targets |= this.darkEnPassantTarget * BigInt(!_nullIfCheck * (_otherCheck != 0));
        let _pawns = this.darkPawns & ~(allInBetween ^ antiInBetween);
        moveTargets[3] |= SEOne(_pawns) & _targets;
        _pawns = this.darkPawns & ~(allInBetween ^ diaInBetween);
        moveTargets[5] |= SWOne(_pawns) & _targets;
        _pawns = this.darkPawns & ~(allInBetween ^ vertInBetween);
        let _pawnPushes = SOne(_pawns) & ~this.occupied;
        moveTargets[4] |= _pawnPushes & targetMask;
        let _rank5 = 0x00000000ff000000n;
        moveTargets[4] |= SOne(_pawnPushes) & ~this.occupied & targetMask & _rank5;

        //King
        targetMask = ~(this.darkPieces | anyWhiteAttack);
        moveTargets[0] |= NOne(this.darkKing) & targetMask;
        moveTargets[1] |= NEOne(this.darkKing) & targetMask;
        moveTargets[2] |= EOne(this.darkKing) & targetMask;
        moveTargets[3] |= SEOne(this.darkKing) & targetMask;
        moveTargets[4] |= SOne(this.darkKing) & targetMask;
        moveTargets[5] |= SWOne(this.darkKing) & targetMask;
        moveTargets[6] |= WOne(this.darkKing) & targetMask;
        moveTargets[7] |= NWOne(this.darkKing) & targetMask;

        //Castling
        let _KSCastleBool = this.darkCastleRights[0];
        _KSCastleBool *= (this.darkKing & binarySquares[60]) != 0n;
        _KSCastleBool *= !(anyWhiteAttack & bKingCastleMask) && !(this.occupied & bKingCastleMask);
        let _QSCastleBool = this.darkCastleRights[1];
        let _QSCastleMask = 0b0000000000000000000000000000000000000000000000000000000001110000n;
        _QSCastleBool *= (this.darkKing & binarySquares[60]) != 0n;
        _QSCastleBool *= !(anyWhiteAttack & bQueenCastleMask) && !(this.occupied & _QSCastleMask);
        if (_KSCastleBool) moveList.push(new Move(60, 62, CASTLE_SHORT_FLAG));
        if (_QSCastleBool) moveList.push(new Move(60, 58, CASTLE_LONG_FLAG));

        let mask = maskInit;
        let targetSquares;
        let endSq;
        let flag = 0b0000;
        let _rank1 = 0xff00000000000000n;
        for (let i = 0; i < 64; i++) {
            if (this.darkPieces & mask) {
                //NORTH
                targetSquares =
                    slidingNorthRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[0];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.lightPieces) != 0);
                    moveList.push(new Move(this.binaryDict[mask], this.binaryDict[endSq], flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //NORTH EAST
                targetSquares =
                    slidingNorthEastRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[1];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.lightPieces) != 0);
                    moveList.push(new Move(this.binaryDict[mask], this.binaryDict[endSq], flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //EAST
                targetSquares =
                    slidingEastRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[2];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.lightPieces) != 0);
                    moveList.push(new Move(this.binaryDict[mask], this.binaryDict[endSq], flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH EAST
                targetSquares =
                    slidingSouthEastRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[3];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.lightPieces) != 0);
                    flag |=
                        0b0001 *
                        Boolean(
                            (endSq & this.darkEnPassantTarget) != 0 &&
                                (NWOne(endSq) & this.darkPawns) != 0
                        );
                    //Promotion
                    if (mask & this.darkPawns && endSq & _rank1) {
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                KNIGHT_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                BISHOP_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                ROOK_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                QUEEN_PROMO | flag
                            )
                        );
                    } else
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[endSq], flag)
                        );
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH
                targetSquares =
                    slidingSouthRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[4];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.lightPieces) != 0);
                    //Promotion
                    if (mask & this.darkPawns && endSq & _rank1) {
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                KNIGHT_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                BISHOP_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                ROOK_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                QUEEN_PROMO | flag
                            )
                        );
                    } else
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[endSq], flag)
                        );
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //SOUTH WEST
                targetSquares =
                    slidingSouthWestRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[5];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.lightPieces) != 0);
                    flag |=
                        0b0001 *
                        Boolean(
                            (endSq & this.darkEnPassantTarget) != 0 &&
                                (NEOne(endSq) & this.darkPawns) != 0
                        );
                    //Promotion
                    if (mask & this.darkPawns && endSq & _rank1) {
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                KNIGHT_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                BISHOP_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                ROOK_PROMO | flag
                            )
                        );
                        moveList.push(
                            new Move(
                                this.binaryDict[mask],
                                this.binaryDict[endSq],
                                QUEEN_PROMO | flag
                            )
                        );
                    } else
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[endSq], flag)
                        );
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //WEST
                targetSquares =
                    slidingWestRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[6];
                while (targetSquares) {
                    endSq = LSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.lightPieces) != 0);
                    moveList.push(new Move(this.binaryDict[mask], this.binaryDict[endSq], flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                //NORTH WEST
                targetSquares =
                    slidingNorthWestRay(
                        mask,
                        this.occupied,
                        this.binaryDict,
                        this.rayAttacksFromSquare
                    ) & moveTargets[7];
                while (targetSquares) {
                    endSq = MSB1(targetSquares);
                    flag = 0b0100 * Boolean((endSq & this.lightPieces) != 0);
                    moveList.push(new Move(this.binaryDict[mask], this.binaryDict[endSq], flag));
                    targetSquares &= ~endSq;
                    flag = 0b0000;
                }

                if (mask & this.darkKnights) {
                    //NNE
                    targetSquares = NOne(NEOne(mask)) & moveTargets[8];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.lightPieces) != 0);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = EOne(NEOne(mask)) & moveTargets[9];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.lightPieces) != 0);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = EOne(SEOne(mask)) & moveTargets[10];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.lightPieces) != 0);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = SOne(SEOne(mask)) & moveTargets[11];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.lightPieces) != 0);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = SOne(SWOne(mask)) & moveTargets[12];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.lightPieces) != 0);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = WOne(SWOne(mask)) & moveTargets[13];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.lightPieces) != 0);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = WOne(NWOne(mask)) & moveTargets[14];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.lightPieces) != 0);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                    //NNE
                    targetSquares = NOne(NWOne(mask)) & moveTargets[15];
                    if (targetSquares) {
                        flag = 0b0100 * Boolean((targetSquares & this.lightPieces) != 0);
                        moveList.push(
                            new Move(this.binaryDict[mask], this.binaryDict[targetSquares], flag)
                        );
                        flag = 0b0000;
                    }
                }
            }
            mask >>= 1n;
        }

        return moveList;
    }

    makeMove(move) {
        let start = getBinFromSquare(move.from);
        let target = getBinFromSquare(move.target);

        this.lightCastleBroken = false;
        this.darkCastleBroken = false;

        //CAPTURES
        if (move.getButterflyIndex() & CAPTURE_FLAG) {
            this.captureCount++;
            if (start & this.lightPieces) {
                if (move.getButterflyIndex() == EN_PASSANT_FLAG) {
                    //EP Capture
                    this.darkPawns &= ~(target << 8n);
                } else {
                    if (target & this.darkPawns) {
                        this.capturedBlackPieceStack.push(0);
                    }
                    if (target & this.darkRooks) {
                        this.capturedBlackPieceStack.push(1);
                        if (target & binarySquares[56]) {
                            this.darkOldRights = this.darkCastleRights;
                            this.darkCastleRights[1] = false;
                            this.darkCastleBroken = true;
                        } else if (target & binarySquares[63]) {
                            this.darkOldRights = this.darkCastleRights;
                            this.darkCastleRights[0] = false;
                            this.darkCastleBroken = true;
                        }
                    }
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
                    if (target & this.lightRooks) {
                        this.capturedWhitePieceStack.push(1);
                        if (target & binarySquares[0]) {
                            this.lightOldRights = this.lightCastleRights;
                            this.lightCastleRights[1] = false;
                            this.lightCastleBroken = true;
                        } else if (target & binarySquares[7]) {
                            this.lightOldRights = this.lightCastleRights;
                            this.lightCastleRights[0] = false;
                            this.lightCastleBroken = true;
                        }
                    }
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

        //CASTLING - branchless
        let _whiteCastleShortBool = move.getButterflyIndex() == CASTLE_SHORT_FLAG;
        _whiteCastleShortBool *= Boolean((start & this.lightKing) != 0);
        this.lightRooks &= ~(binarySquares[7] * BigInt(_whiteCastleShortBool));
        this.lightRooks |= binarySquares[5] * BigInt(_whiteCastleShortBool);
        let _blackCastleShortBool = move.getButterflyIndex() == CASTLE_SHORT_FLAG;
        _blackCastleShortBool *= Boolean((start & this.darkKing) != 0);
        this.darkRooks &= ~(binarySquares[63] * BigInt(_blackCastleShortBool));
        this.darkRooks |= binarySquares[61] * BigInt(_blackCastleShortBool);

        let _whiteCastleLongBool = move.getButterflyIndex() == CASTLE_LONG_FLAG;
        _whiteCastleLongBool *= Boolean((start & this.lightKing) != 0n);
        this.lightRooks &= ~(binarySquares[0] * BigInt(_whiteCastleLongBool));
        this.lightRooks |= binarySquares[3] * BigInt(_whiteCastleLongBool);
        let _blackCastleLongBool = move.getButterflyIndex() == CASTLE_LONG_FLAG;
        _blackCastleLongBool *= Boolean((start & this.darkKing) != 0n);
        this.darkRooks &= ~(binarySquares[56] * BigInt(_blackCastleLongBool));
        this.darkRooks |= binarySquares[59] * BigInt(_blackCastleLongBool);

        // ! OLD BRANCHING VERSION
        // if (move.getButterflyIndex() == CASTLE_SHORT_FLAG) {
        //     if (start & this.lightKing) {
        //         this.lightRooks &= ~binarySquares[7];
        //         this.lightRooks |= binarySquares[5];
        //     } else {
        //         this.darkRooks &= ~binarySquares[63];
        //         this.darkRooks |= binarySquares[61];
        //     }
        // }
        // if (move.getButterflyIndex() == CASTLE_LONG_FLAG) {
        //     if (start & this.lightKing) {
        //         this.lightRooks &= ~binarySquares[0];
        //         this.lightRooks |= binarySquares[3];
        //     } else {
        //         this.darkRooks &= ~binarySquares[56];
        //         this.darkRooks |= binarySquares[59];
        //     }
        // }

        //Promotions - branchless
        let _promoBool = Boolean(move.getButterflyIndex() & 0b1000);
        let _whitePromo = _promoBool * Boolean(start & this.lightPawns);
        let _whiteKnightPromo =
            _whitePromo *
            Boolean(move.getButterflyIndex() == 0b1000 || move.getButterflyIndex() == 0b1100);
        let _whiteBishopPromo =
            _whitePromo *
            Boolean(move.getButterflyIndex() == 0b1001 || move.getButterflyIndex() == 0b1101);
        let _whiteRookPromo =
            _whitePromo *
            Boolean(move.getButterflyIndex() == 0b1010 || move.getButterflyIndex() == 0b1110);
        let _whiteQueenPromo =
            _whitePromo *
            Boolean(move.getButterflyIndex() == 0b1011 || move.getButterflyIndex() == 0b1111);
        this.lightPawns &= ~(target * BigInt(_whitePromo));
        this.lightPawns &= ~(start * BigInt(_whitePromo));
        this.lightKnights |= target * BigInt(_whiteKnightPromo);
        this.lightBishops |= target * BigInt(_whiteBishopPromo);
        this.lightRooks |= target * BigInt(_whiteRookPromo);
        this.lightQueen |= target * BigInt(_whiteQueenPromo);

        let _blackPromo = _promoBool * Boolean(start & this.darkPawns);
        let _blackKnightPromo =
            _blackPromo *
            Boolean(move.getButterflyIndex() == 0b1000 || move.getButterflyIndex() == 0b1100);
        let _blackBishopPromo =
            _blackPromo *
            Boolean(move.getButterflyIndex() == 0b1001 || move.getButterflyIndex() == 0b1101);
        let _blackRookPromo =
            _blackPromo *
            Boolean(move.getButterflyIndex() == 0b1010 || move.getButterflyIndex() == 0b1110);
        let _blackQueenPromo =
            _blackPromo *
            Boolean(move.getButterflyIndex() == 0b1011 || move.getButterflyIndex() == 0b1111);
        this.darkPawns &= ~(target * BigInt(_blackPromo));
        this.darkPawns &= ~(start * BigInt(_blackPromo));
        this.darkKnights |= target * BigInt(_blackKnightPromo);
        this.darkBishops |= target * BigInt(_blackBishopPromo);
        this.darkRooks |= target * BigInt(_blackRookPromo);
        this.darkQueen |= target * BigInt(_blackQueenPromo);

        // ! OLD BRANCHING VERSION
        // if (move.getButterflyIndex() & 0b1000) {
        //     if (start & this.lightPawns) {
        //         this.lightPawns &= ~target;
        //         this.lightPawns &= ~start;
        //         if (move.getButterflyIndex() == 0b1000) this.lightKnights |= target;
        //         else if (move.getButterflyIndex() == 0b1001) this.lightBishops |= target;
        //         else if (move.getButterflyIndex() == 0b1010) this.lightRooks |= target;
        //         else if (move.getButterflyIndex() == 0b1011) this.lightQueen |= target;
        //         else if (move.getButterflyIndex() == 0b1100) this.lightKnights |= target;
        //         else if (move.getButterflyIndex() == 0b1101) this.lightBishops |= target;
        //         else if (move.getButterflyIndex() == 0b1110) this.lightRooks |= target;
        //         else if (move.getButterflyIndex() == 0b1111) this.lightQueen |= target;
        //     } else {
        //         this.darkPawns &= ~target;
        //         this.darkPawns &= ~start;
        //         if (move.getButterflyIndex() == 0b1000) this.darkKnights |= target;
        //         else if (move.getButterflyIndex() == 0b1001) this.darkBishops |= target;
        //         else if (move.getButterflyIndex() == 0b1010) this.darkRooks |= target;
        //         else if (move.getButterflyIndex() == 0b1011) this.darkQueen |= target;
        //         else if (move.getButterflyIndex() == 0b1100) this.darkKnights |= target;
        //         else if (move.getButterflyIndex() == 0b1101) this.darkBishops |= target;
        //         else if (move.getButterflyIndex() == 0b1110) this.darkRooks |= target;
        //         else if (move.getButterflyIndex() == 0b1111) this.darkQueen |= target;
        //     }
        // }

        //Reset EP Targets
        this.lightEnPassantTarget = 0n;
        this.darkEnPassantTarget = 0n;

        //Check Pawn Moves
        if (start & this.lightPawns) {
            this.lightPawns &= ~start;
            this.lightPawns |= target;
            if (target & 0x000000ff00000000n && start & 0x00ff000000000000n) {
                if (WOne(target) & this.darkPawns) {
                    if (
                        !(
                            (slidingEastRay(
                                target,
                                this.occupied,
                                this.binaryDict,
                                this.rayAttacksFromSquare
                            ) |
                                slidingWestRay(
                                    target,
                                    this.occupied & ~WOne(target),
                                    this.binaryDict,
                                    this.rayAttacksFromSquare
                                )) &
                                this.darkKing &&
                            (slidingEastRay(
                                target,
                                this.occupied,
                                this.binaryDict,
                                this.rayAttacksFromSquare
                            ) |
                                slidingWestRay(
                                    target,
                                    this.occupied & ~WOne(target),
                                    this.binaryDict,
                                    this.rayAttacksFromSquare
                                )) &
                                (this.lightRooks | this.lightQueen)
                        )
                    ) {
                        this.darkEnPassantTarget = target << 8n;
                    }
                } else if (EOne(target) & this.darkPawns) {
                    if (
                        !(
                            (slidingEastRay(
                                target,
                                this.occupied & ~EOne(target),
                                this.binaryDict,
                                this.rayAttacksFromSquare
                            ) |
                                slidingWestRay(
                                    target,
                                    this.occupied,
                                    this.binaryDict,
                                    this.rayAttacksFromSquare
                                )) &
                                this.darkKing &&
                            (slidingEastRay(
                                target,
                                this.occupied & ~EOne(target),
                                this.binaryDict,
                                this.rayAttacksFromSquare
                            ) |
                                slidingWestRay(
                                    target,
                                    this.occupied,
                                    this.binaryDict,
                                    this.rayAttacksFromSquare
                                )) &
                                (this.lightRooks | this.lightQueen)
                        )
                    ) {
                        this.darkEnPassantTarget = target << 8n;
                    }
                }
            }
        }

        //Check Rook Moves
        if (start & this.lightRooks) {
            this.lightRooks &= ~start;
            this.lightRooks |= target;
            if (start & binarySquares[0]) {
                this.lightOldRights = this.lightCastleRights;
                this.lightCastleRights = [this.lightCastleRights[0], false];
                this.lightCastleBroken = true;
            } else if (start & binarySquares[7]) {
                this.lightOldRights = this.lightCastleRights;
                this.lightCastleRights = [false, this.lightCastleRights[1]];
                this.lightCastleBroken = true;
            }
        }

        //Check Bishop Moves
        let _lightBishopMove = Boolean(start & this.lightBishops);
        let _darkBishopMove = Boolean(start & this.darkBishops);
        this.lightBishops &= ~(start * BigInt(_lightBishopMove));
        this.lightBishops |= target * BigInt(_lightBishopMove);
        this.darkBishops &= ~(start * BigInt(_darkBishopMove));
        this.darkBishops |= target * BigInt(_darkBishopMove);

        //Check Queen Moves
        let _lightQueenMove = Boolean(start & this.lightQueen);
        let _darkQueenMove = Boolean(start & this.darkQueen);
        this.lightQueen &= ~(start * BigInt(_lightQueenMove));
        this.darkQueen &= ~(start * BigInt(_darkQueenMove));
        this.lightQueen |= target * BigInt(_lightQueenMove);
        this.darkQueen |= target * BigInt(_darkQueenMove);

        //Check Knight Moves
        let _lightKnightMove = Boolean(start & this.lightKnights);
        let _darkKnightMove = Boolean(start & this.darkKnights);
        this.lightKnights &= ~(start * BigInt(_lightKnightMove));
        this.darkKnights &= ~(start * BigInt(_darkKnightMove));
        this.lightKnights |= target * BigInt(_lightKnightMove);
        this.darkKnights |= target * BigInt(_darkKnightMove);

        //Check King Moves
        let _lightKingMove = Boolean(start & this.lightKing);
        let _darkKingMove = Boolean(start & this.darkKing);
        this.lightKing &= ~(start * BigInt(_lightKingMove));
        this.darkKing &= ~(start * BigInt(_darkKingMove));
        this.lightKing |= target * BigInt(_lightKingMove);
        this.darkKing |= target * BigInt(_darkKingMove);

        if (start & this.lightKing) {
            this.lightOldRights = this.lightCastleRights;
            this.lightCastleRights = [false, false];
            this.lightCastleBroken = true;
        }

        if (start & this.darkKing) {
            this.darkOldRights = this.darkCastleRights;
            this.darkCastleRights = [false, false];
            this.darkCastleBroken = true;
        }

        //Check Pawn Moves
        if (start & this.darkPawns) {
            this.darkPawns &= ~start;
            this.darkPawns |= target;
            if (target & 0x00000000ff000000n && start & 0x000000000000ff00n) {
                if (WOne(target) & this.lightPawns) {
                    if (
                        !(
                            (slidingEastRay(
                                target,
                                this.occupied,
                                this.binaryDict,
                                this.rayAttacksFromSquare
                            ) |
                                slidingWestRay(
                                    target,
                                    this.occupied & ~WOne(target),
                                    this.binaryDict,
                                    this.rayAttacksFromSquare
                                )) &
                                this.lightKing &&
                            (slidingEastRay(
                                target,
                                this.occupied,
                                this.binaryDict,
                                this.rayAttacksFromSquare
                            ) |
                                slidingWestRay(
                                    target,
                                    this.occupied & ~WOne(target),
                                    this.binaryDict,
                                    this.rayAttacksFromSquare
                                )) &
                                (this.darkRooks | this.darkQueen)
                        )
                    ) {
                        this.lightEnPassantTarget = target >> 8n;
                    }
                } else if (EOne(target) & this.lightPawns) {
                    if (
                        !(
                            (slidingEastRay(
                                target,
                                this.occupied & ~EOne(target),
                                this.binaryDict,
                                this.rayAttacksFromSquare
                            ) |
                                slidingWestRay(
                                    target,
                                    this.occupied,
                                    this.binaryDict,
                                    this.rayAttacksFromSquare
                                )) &
                                this.lightKing &&
                            (slidingEastRay(
                                target,
                                this.occupied & ~EOne(target),
                                this.binaryDict,
                                this.rayAttacksFromSquare
                            ) |
                                slidingWestRay(
                                    target,
                                    this.occupied,
                                    this.binaryDict,
                                    this.rayAttacksFromSquare
                                )) &
                                (this.darkRooks | this.darkQueen)
                        )
                    ) {
                        this.lightEnPassantTarget = target >> 8n;
                    }
                }
            }
        }

        //Check Rook Moves
        if (start & this.darkRooks) {
            this.darkRooks &= ~start;
            this.darkRooks |= target;
            if (start & binarySquares[63]) {
                this.darkOldRights = this.darkCastleRights;
                this.darkCastleRights = [false, this.darkCastleRights[1]];
                this.darkCastleBroken = true;
            } else if (start & binarySquares[56]) {
                this.darkOldRights = this.darkCastleRights;
                this.darkCastleRights = [this.darkCastleRights[0], false];
                this.darkCastleBroken = true;
            }
        }

        //Check Bishop Moves
        // if (start & this.darkBishops) {
        //     this.darkBishops &= ~start;
        //     this.darkBishops |= target;
        // }

        //Check Queen Moves
        // if (start & this.darkQueen) {
        //     this.darkQueen &= ~start;
        //     this.darkQueen |= target;
        // }

        //Check Knight Moves
        // if (start & this.darkKnights) {
        //     this.darkKnights &= ~start;
        //     this.darkKnights |= target;
        // }

        //Check King Moves
        // if (start & this.darkKing) {
        //     this.darkOldRights = this.darkCastleRights;
        //     this.darkCastleRights = [false, false];
        //     this.darkCastleBroken = true;
        // }

        //Re-Evaluate Pieces
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

        //Update Player, Empty move list
        this.playerBoolean = !this.playerBoolean;
    }

    unmakeMove(move) {
        // * ONLY USED IN PERFT

        let start = getBinFromSquare(move.target);
        let target = getBinFromSquare(move.from);

        //CASTLING
        if (move.getButterflyIndex() == 0b0010) {
            if (start & this.lightKing) {
                this.lightRooks &= ~binarySquares[5];
                this.lightRooks |= binarySquares[7];
                this.lightCastleRights[0] = true;
            } else {
                this.darkRooks &= ~binarySquares[61];
                this.darkRooks |= binarySquares[63];
                this.darkCastleRights[0] = true;
            }
        }
        if (move.getButterflyIndex() == 0b0011) {
            if (start & this.lightKing) {
                this.lightRooks &= ~binarySquares[3];
                this.lightRooks |= binarySquares[0];
                this.lightCastleRights[1] = true;
            } else {
                this.darkRooks &= ~binarySquares[59];
                this.darkRooks |= binarySquares[56];
                this.darkCastleRights[1] = true;
            }
        }

        //Promotions
        if (move.getButterflyIndex() & 0b1000) {
            if (start & this.lightPieces) {
                this.lightPawns |= target;
                this.lightKnights &= ~start;
                this.lightBishops &= ~start;
                this.lightRooks &= ~start;
                this.lightQueens &= ~start;
            } else {
                this.darkPawns |= target;
                this.darkKnights &= ~start;
                this.darkBishops &= ~start;
                this.darkRooks &= ~start;
                this.darkQueen &= ~start;
            }
        }

        if (start & this.lightPawns) {
            this.lightPawns &= ~start;
            this.lightPawns |= target;
        }
        if (start & this.lightRooks) {
            this.lightRooks &= ~start;
            this.lightRooks |= target;
            if (this.lightCastleBroken) this.lightCastleRights = this.lightOldRights;
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
            if (this.lightCastleBroken) this.lightCastleRights = this.lightOldRights;
        }
        if (start & this.darkPawns) {
            this.darkPawns &= ~start;
            this.darkPawns |= target;
        }
        if (start & this.darkRooks) {
            this.darkRooks &= ~start;
            this.darkRooks |= target;
            if (this.darkCastleBroken) {
                this.darkCastleRights = this.darkOldRights;
            }
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
            if (this.darkCastleBroken) {
                this.darkCastleRights = this.darkOldRights;
            }
        }

        if (move.getButterflyIndex() & CAPTURE_FLAG) {
            if (start & this.lightPieces) {
                if (move.getButterflyIndex() == 0b0101) {
                    //EP Capture
                    this.darkPawns |= start << 8n;
                } else {
                    let piece = this.capturedBlackPieceStack.pop();
                    if (piece == 0) this.darkPawns |= start;
                    else if (piece == 1) {
                        this.darkRooks |= start;
                        if (this.darkCastleBroken) {
                            this.darkCastleRights = this.darkOldRights;
                        }
                    } else if (piece == 2) this.darkKnights |= start;
                    else if (piece == 3) this.darkBishops |= start;
                    else if (piece == 4) this.darkQueen |= start;
                }
            } else {
                if (move.getButterflyIndex() == 0b0101) {
                    this.lightPawns |= start >> 8n;
                } else {
                    let piece = this.capturedWhitePieceStack.pop();
                    if (piece == 0) this.lightPawns |= start;
                    else if (piece == 1) {
                        this.lightRooks |= start;
                        if (this.lightCastleBroken) this.lightCastleRights = this.lightOldRights;
                    } else if (piece == 2) this.lightKnights |= start;
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
    }

    perft(depth) {
        // * Recursively plays and unplays moves
        // -> Used to test rule implementation

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
            if (depth == PERFT_DEPTH) {
                this.divideArr.push(count);
            }
            this.unmakeMove(moves[i]);
            //this.updateGUI();
        }

        return count;
    }

    updateGUI() {
        // ! NOT USED

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

// console.time("Perft");
// console.log(board15.perft(PERFT_DEPTH));
// console.timeEnd("Perft");
// board15.updateGUI();
// console.log(board15.captureCount, getArrayDiff(board15.divideArr));
