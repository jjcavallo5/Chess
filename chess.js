// * USEFULL CONSTANTS FOR SPECIAL MOVES
const a1        = 0b1000000000000000000000000000000000000000000000000000000000000000n;
const c1        = 0b0010000000000000000000000000000000000000000000000000000000000000n;
const d1        = 0b0001000000000000000000000000000000000000000000000000000000000000n;
const e1        = 0b0000100000000000000000000000000000000000000000000000000000000000n;
const f1        = 0b0000010000000000000000000000000000000000000000000000000000000000n;
const g1        = 0b0000001000000000000000000000000000000000000000000000000000000000n;
const h1        = 0b0000000100000000000000000000000000000000000000000000000000000000n;
const a8        = 0b0000000000000000000000000000000000000000000000000000000010000000n;
const c8        = 0b0000000000000000000000000000000000000000000000000000000000100000n;
const d8        = 0b0000000000000000000000000000000000000000000000000000000000010000n;
const e8        = 0b0000000000000000000000000000000000000000000000000000000000001000n;
const f8        = 0b0000000000000000000000000000000000000000000000000000000000000100n;
const g8        = 0b0000000000000000000000000000000000000000000000000000000000000010n;
const h8        = 0b0000000000000000000000000000000000000000000000000000000000000001n;
const rowTwo    = 0b0000000011111111000000000000000000000000000000000000000000000000n;
const rowFour   = 0b0000000000000000000000001111111100000000000000000000000000000000n;
const rowFive   = 0b0000000000000000000000000000000011111111000000000000000000000000n;
const rowSeven  = 0b0000000000000000000000000000000000000000000000001111111100000000n;
const initMask  = 0b1000000000000000000000000000000000000000000000000000000000000000n;
const noHMask   = 0b1111111011111110111111101111111011111110111111101111111011111110n;
const noAMask   = 0b0111111101111111011111110111111101111111011111110111111101111111n;
const no8Mask   = 0b1111111111111111111111111111111111111111111111111111111100000000n;
const no1Mask   = 0b0000000011111111111111111111111111111111111111111111111111111111n;

//TODO -->  Implement En-Passant ----------------------- DONE
//TODO -->  Fix error with king after castling --------- DONE
//TODO -->  Fix Castling ------------------------------- DONE
//TODO -->  Implement "Check" -------------------------- DONE
    // ! Fix Raycasting - rays aren't exclusive -------- DONE
    //TODO -->  Move Out Of Check ---------------------- DONE
    //TODO -->  Block Check ---------------------------- DONE
    //TODO -->  Capture Checking Piece ----------------- DONE
//TODO -->  Implement Pins, discovered check, etc ------ DONE
//TODO -->  Promotion ---------------------------------- DONE
//TODO -->  Implement MATE
//TODO -->  En Passant Discovered Check
//TODO -->  CLEAN CODE

// * MAIN BOARD CLASS * //
class Board {
    constructor() {
        this.boardArray = [
            ['r','n','b','q','k','b','n','r'],
            ['p','p','p','p','p','p','p','p'],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' '],
            ['P','P','P','P','P','P','P','P'],
            ['R','N','B','Q','K','B','N','R']
        ]

        this.lightPawns     = 0n;
        this.lightRooks     = 0n;
        this.lightKnights   = 0n;
        this.lightBishops   = 0n;
        this.lightQueen     = 0n;
        this.lightKing      = 0n;

        this.darkPawns      = 0n;
        this.darkRooks      = 0n;
        this.darkKnights    = 0n;
        this.darkBishops    = 0n;
        this.darkQueen      = 0n;
        this.darkKing       = 0n;

        this.lightPieces    = 0n;
        this.darkPieces     = 0n;

        //Boolean for Checks
        this.lightInCheck = [false, []];
        this.darkInCheck = [false, []];

        //Store Castle Rights
        this.lightCastleRights = [true, true];
        this.darkCastleRights = [true, true];

        //Store En-Passant Squares
        this.lightEnPassant = 0n;
        this.darkEnPassant = 0n;

        this.playerBoolean = true;
    }

    print() {
        //Prints board status
        console.log("White Pawns", this.printPieceStatus(this.lightPawns));
        console.log("White Rooks", this.printPieceStatus(this.lightRooks));
        console.log("White Knights", this.printPieceStatus(this.lightKnights));
        console.log("White Bishops", this.printPieceStatus(this.lightBishops));
        console.log("White Queen", this.printPieceStatus(this.lightQueen));
        console.log("White King", this.printPieceStatus(this.lightKing));
        console.log("Dark Pawns", this.printPieceStatus(this.darkPawns));
        console.log("Dark Rooks", this.printPieceStatus(this.darkRooks));
        console.log("Dark Knights", this.printPieceStatus(this.darkKnights));
        console.log("Dark Bishops", this.printPieceStatus(this.darkBishops));
        console.log("Dark Queen", this.printPieceStatus(this.darkQueen));
        console.log("Dark King", this.printPieceStatus(this.darkKing));

    }

    bitBoardFromArray() {
        //Converts board to bitboards from array
        let mask = initMask;
        for (let i = 7; i >= 0; i--) {
            for (let j = 0; j < 8; j++) {
                switch (this.boardArray[i][j]) {
                    case 'P':
                        this.lightPawns |= mask;
                        break;
                    case 'p':
                        this.darkPawns |= mask;
                        break;
                    case 'R':
                        this.lightRooks |= mask;
                        break;
                    case 'r':
                        this.darkRooks |= mask;
                        break;
                    case 'N':
                        this.lightKnights |= mask;
                        break;
                    case 'n':
                        this.darkKnights |= mask;
                        break;
                    case 'B':
                        this.lightBishops |= mask;
                        break;
                    case 'b':
                        this.darkBishops |= mask;
                        break;
                    case 'Q':
                        this.lightQueen |= mask;
                        break;
                    case 'q':
                        this.darkQueen |= mask;
                        break;
                    case 'K':
                        this.lightKing |= mask;
                        break;
                    case 'k':
                        this.darkKing |= mask;
                        break;
                }
                mask >>= 1n;
            }
        }

        this.lightPieces    = this.lightPawns | this.lightRooks | this.lightKnights | this.lightBishops | this.lightQueen | this.lightKing;
        this.darkPieces     = this.darkPawns | this.darkRooks | this.darkKnights | this.darkBishops | this.darkQueen | this.darkKing;
    }

    getWhiteMoves() {
        //Pawns
        let lightPawnMoves = this.calcLightPawnMoveBitBoard(this.lightPawns);

        //Rooks
        let lightRookMoves = this.calcRookMoveBitBoard(this.lightRooks, this.lightPieces, this.darkPieces);

        //Knights
        let lightKnightMoves = this.calcKnightMoveBitBoard(this.lightKnights, this.lightPieces);

        //Bishops
        let lightBishopMoves = this.calcBishopMoveBitBoard(this.lightBishops, this.lightPieces, this.darkPieces);

        //Queen
        let lightQueenMoves = this.calcQueenMoveBitboard(this.lightQueen, this.lightPieces, this.darkPieces);

        //King
        let lightKingMoves = this.calcKingMoveBitBoard(this.lightKing, this.lightPieces, this.darkPieces, this.lightCastleRights, true);

        return [lightPawnMoves, lightRookMoves, lightKnightMoves, lightBishopMoves, lightQueenMoves, lightKingMoves];
    }

    getBlackMoves() {
        let darkPawnMoves = this.calcLightPawnMoveBitBoard(this.darkPawns);
        let darkRookMoves = this.calcRookMoveBitBoard(this.darkRooks, this.darkPieces, this.lightPieces);
        let darkKnightMoves = this.calcKnightMoveBitBoard(this.darkKnights, this.darkPieces)
        let darkBishopMoves = this.calcBishopMoveBitBoard(this.darkBishops, this.darkPieces, this.lightPieces);
        let darkQueenMoves = this.calcQueenMoveBitboard(this.darkQueen, this.darkPieces, this.lightPieces);
        let darkKingMoves = this.calcKingMoveBitBoard(this.darkKing, this.darkPieces, this.lightPieces, this.darkCastleRights, false);
        return [darkPawnMoves, darkRookMoves, darkKnightMoves, darkBishopMoves, darkQueenMoves, darkKingMoves];
    }

    printPieceStatus(bitboard) {
        //Prints board from 64 bit number
        let mask = initMask;
        let string = "";
        
        for (let i = 1; i <= 8; i++) {
            for (let j = 65; j <= 72; j++) {
                if (mask & bitboard)
                    string += '1';
                else
                    string += '0'
                mask >>= 1n;
            }
            string += '\n'
        }
        return string;
    }

    checkEnPassant(color, bitboard, pinningRays) {
        let enPassants = 0n;
        if (color) {
            if (this.lightKing & rowFive) {
                if (countBits((rowFive & pinningRays) & this.lightPieces) == 2 && countBits((rowFive & pinningRays) & this.darkPieces) == 2)
                    return 0n;
            }
            if (this.darkEnPassant) {
                //Left
                if (((this.darkEnPassant & noAMask) << 1n) & bitboard) {
                    enPassants |= (this.darkEnPassant >> 8n)
                }
                //Right
                if (((this.darkEnPassant & noHMask) >> 1n) & bitboard) {
                    enPassants |= (this.darkEnPassant >> 8n)
                }
            }
            return enPassants;
        } 

        if (this.darkKing & rowFour) {
            if (countBits((rowFour & pinningRays) & this.darkPieces) == 2 && countBits((rowFour & pinningRays) & this.lightPieces) == 2)
                return 0n;
        }
        if (this.lightEnPassant) {
            if (((this.lightEnPassant & noAMask) << 1n) & bitboard) {
                enPassants |= (this.lightEnPassant << 8n)
            }
            if (((this.lightEnPassant & noHMask) >> 1n) & bitboard) {
                enPassants |= (this.lightEnPassant << 8n)
            }
        }

        return enPassants;
    }

    calcLightPawnMoveBitBoard(pawnBitmap) {
        // Variables
        let mask = initMask;
        let masked;
        let temp;
        let pawnMove = 0n;
        let pawnMoves = [];
        let color;
        if (pawnBitmap == this.lightPawns) color = true;
        else if (pawnBitmap == this.darkPawns) color = false;
        let pinningRays = this.getPinningRays(color);

        //Loop Through Board
        for (let i = 0; i < 64; i++) {
            masked = pawnBitmap & mask;
            if (masked) {
                // * Pawns Found
                temp = masked;
                //Check for En Passant
                pawnMove |= this.checkEnPassant(color, masked, pinningRays)

                //Shift Masked
                if (color)
                    masked >>= 8n;
                else
                    masked <<= 8n;

                //Standard forward moves
                if ((masked & this.lightPieces) == 0n && (masked & this.darkPieces) == 0n) {
                    pawnMove |= masked;
                    if ((color && i < 16) || (!color && i >= 48)) {
                        //Pawn on initial Square
                        if (color)
                            masked >>= 8n;
                        else
                            masked <<= 8n;

                        if ((masked & this.lightPieces) == 0n && (masked & this.darkPieces) == 0n)
                            pawnMove |= masked;
                    }
                }

                //Check Capture Right
                if (color) {
                    if (((temp & noHMask) >> 9n) & this.darkPieces) {
                        pawnMove |= (temp >> 9n)
                    }

                    //Check Capture Left
                    if (((temp & noAMask) >> 7n) & this.darkPieces) {
                        pawnMove |= (temp >> 7n)
                    }
                } else {
                    if ((((temp & noHMask) << 7n) & this.lightPieces) != 0n) {
                        pawnMove |= (temp << 7n)
                    }
    
                    //Check left capture
                    if ((((temp & noAMask) << 9n) & this.lightPieces) != 0n) {
                        pawnMove |= (temp << 9n)
                    }
                }

                pawnMove = this.checksAndPins(color, pinningRays, temp, pawnMove)

                //Push pawn moves and reset
                pawnMoves.push(pawnMove)
                pawnMove = 0n;
            }
            mask >>= 1n;
        }

        return pawnMoves;
    }

    calcPawnAttacks(pawnBitmap) {
        //Variables
        let mask = initMask;
        let pawnAttacks = 0n;
        let color;
        if (pawnBitmap == this.lightPawns) color = true;
        else if (pawnBitmap == this.darkPawns) color = false;

        //Loop through board
        for (let i = 0; i < 64; i++) {
            if (pawnBitmap & mask) {
                // * Pawn Found
                if (color) { // White
                    //Add right attack
                    if ((mask & noAMask) && (mask & no8Mask)) {
                        pawnAttacks |= (mask >> 7n)
                    }
                    //Add left attack
                    if ((mask & noHMask) && (mask & no8Mask)) {
                        pawnAttacks |= (mask >> 9n)
                    }
                } else { // Black
                    if ((mask & noAMask) && (mask & no1Mask)) {
                        pawnAttacks |= (mask << 9n)
                    }
                    //Add right attack
                    if ((mask & noHMask) && (mask & no1Mask)) {
                        pawnAttacks |= (mask << 7n)
                    }
                }
            }
            mask >>= 1n;
        }
        return pawnAttacks;
    }

    calcRookMoveBitBoard(rookBitmap, currentPieces, otherPieces) {
        //Variables
        let rookMoves = 0n;
        let rookMovesArr = [];
        let mask = initMask;
        let masked;
        let temp;
        let color;
        if (this.lightPieces == currentPieces) color = true;
        else color = false;
        let pinningRays = this.getPinningRays(color);

        //Main Loop
        for (let i = 0; i < 64; i++) {
            masked = rookBitmap & mask;
            if (masked) {
                // * Rook Found
                temp = mask;
                //N
                for (let j = 0; j < 8; j++) {
                    //Rook on 8th rank
                    if ((temp & no8Mask) == 0n) break;

                    //Shift
                    temp >>= 8n;
                    //Check collision
                    if ((temp & currentPieces) != 0n) {
                        break
                    };
                    //Check Capture
                    if ((temp & otherPieces) != 0n) {
                        rookMoves |= temp;
                        break;
                    }
                    //Push
                    rookMoves |= temp;
                }

                //S
                temp = mask;
                for (let j = 0; j < 8; j++) {
                    //Rook on first rank
                    if ((temp & no1Mask) == 0n) break;

                    //Shift
                    temp <<= 8n;
                    //Check collision
                    if ((temp & currentPieces) != 0n) {
                        break
                    };
                    //Check capture
                    if ((temp & otherPieces) != 0n) {
                        rookMoves |= temp;
                        break;
                    }
                    //Push
                    rookMoves |= temp;
                }

                //E
                temp = mask;
                for (let j = 0; j < 8; j++) {
                    //Rook on H file
                    if ((temp & noHMask) == 0n) break;

                    //Shift
                    temp >>= 1n;
                    //Check collision
                    if ((temp & currentPieces) != 0n) {
                        break
                    };
                    //Check capture
                    if ((temp & otherPieces) != 0n) {
                        rookMoves |= temp;
                        break;
                    }
                    //Push
                    rookMoves |= temp;
                }

                //W
                temp = mask;
                for (let j = 0; j < 8; j++) {
                    //Rook on A file
                    if ((temp & noAMask) == 0n) break;

                    //Shift
                    temp <<= 1n;
                    //Chech collision
                    if ((temp & currentPieces) != 0n) {
                        break
                    };
                    //Check Capture
                    if ((temp & otherPieces) != 0n) {
                        rookMoves |= temp;
                        break;
                    }
                    //Push
                    rookMoves |= temp;
                }

                //Checks and pins
                temp = mask;
                rookMoves = this.checksAndPins(color, pinningRays, temp, rookMoves)

                //Push moves and reset
                rookMovesArr.push(rookMoves)
                rookMoves = 0n;
            }
            mask >>= 1n;
        }

        return rookMovesArr;
    }

    calcKnightMoveBitBoard(knightBitmap, currentPieces) {
        //Variables
        let mask = initMask;
        let temp = 0n;
        let knightMoves = 0n;
        let knightMovesArr = [];
        let color;
        if (currentPieces == this.lightPieces) color = true;
        else color = false;
        let pinningRays = this.getPinningRays(color)

        //Main Loop
        for (let i = 0; i < 64; i++) {
            if ((mask & knightBitmap) != 0n) {
                // * Knight found
                //NNE
                temp = mask;
                temp &= no8Mask;
                temp >>= 8n;
                temp &= no8Mask;
                temp &= noHMask;
                temp >>= 9n;
                if ((temp & currentPieces) == 0n)
                    knightMoves |= temp;

                //NNW
                temp = mask;
                temp &= no8Mask;
                temp >>= 8n;
                temp &= no8Mask;
                temp &= noAMask;
                temp >>= 7n;
                if ((temp & currentPieces) == 0n)
                    knightMoves |= temp;

                //ENE
                temp = mask;
                temp &= noHMask;
                temp >>= 1n;
                temp &= no8Mask;
                temp &= noHMask;
                temp >>= 9n;
                if ((temp & currentPieces) == 0n)
                    knightMoves |= temp;

                //WNW
                temp = mask;
                temp &= noAMask;
                temp <<= 1n;
                temp &= no8Mask;
                temp &= noAMask;
                temp >>= 7n;
                if ((temp & currentPieces) == 0n)
                    knightMoves |= temp;

                //SSE
                temp = mask;
                temp &= no1Mask;
                temp <<= 8n;
                temp &= no1Mask;
                temp &= noHMask;
                temp <<= 7n;
                if ((temp & currentPieces) == 0n)
                    knightMoves |= temp;

                //SSW
                temp = mask;
                temp &= no1Mask;
                temp <<= 8n;
                temp &= no1Mask;
                temp &= noAMask;
                temp <<= 9n;
                if ((temp & currentPieces) == 0n)
                    knightMoves |= temp;

                //ESE
                temp = mask;
                temp &= noHMask;
                temp >>= 1n;
                temp &= no1Mask;
                temp &= noHMask;
                temp <<= 7n;
                if ((temp & currentPieces) == 0n)
                    knightMoves |= temp;

                //WSW
                temp = mask;
                temp &= noAMask;
                temp <<= 1n;
                temp &= no1Mask;
                temp &= noAMask;
                temp <<= 9n;
                if ((temp & currentPieces) == 0n)
                    knightMoves |= temp;

                //Checks and Pins
                temp = mask;
                knightMoves = this.checksAndPins(color, pinningRays, temp, knightMoves)

                //Push moves and reset
                knightMovesArr.push(knightMoves)
                knightMoves = 0n;
            }
            mask >>= 1n;
        }

        return knightMovesArr;
    }

    calcBishopMoveBitBoard(bishopBitmap, currentPieces, otherPieces) {
        //Variables
        let mask = initMask;
        let temp;
        let bishopMoves = 0n;
        let bishopMovesArr = [];
        let color;
        if (currentPieces == this.lightPieces) color = true;
        else color = false;
        let pinningRays = this.getPinningRays(color)

        //Main Loop
        for (let i = 0; i < 64; i++ ) {
            if ((mask & bishopBitmap) != 0n) {
                // * Bishop found
                //NE
                temp = mask;
                //Sub-loop - until collision or board edge
                for (let j = 0; j < 8; j++) {
                    //Edges
                    if ((temp & no8Mask) == 0n) break;
                    if ((temp & noHMask) == 0n) break;

                    //Shift
                    temp >>= 9n;
                    //Collision
                    if ((temp & currentPieces) != 0n) break;

                    //Captures
                    if ((temp & otherPieces) != 0n) {
                        bishopMoves |= temp;
                        break;
                    }

                    //Push
                    bishopMoves |= temp;
                }

                //NW
                temp = mask;
                 //Sub-loop - until collision or board edge
                for (let j = 0; j < 8; j++) {
                    //Edges
                    if ((temp & no8Mask) == 0n) break;
                    if ((temp & noAMask) == 0n) break;

                    temp >>= 7n;
                    //Collision
                    if ((temp & currentPieces) != 0n) break;

                    //Capture
                    if ((temp & otherPieces) != 0n) {
                        bishopMoves |= temp;
                        break;
                    }
                    //Push
                    bishopMoves |= temp;
                }

                //SE
                //Sub-loop - until collision or board edge
                temp = mask;
                for (let j = 0; j < 8; j++) {
                    //Edges
                    if ((temp & no1Mask) == 0n) break;
                    if ((temp & noHMask) == 0n) break;

                    temp <<= 7n;
                    //Collision
                    if ((temp & currentPieces) != 0n) break;

                    //Capture
                    if ((temp & otherPieces) != 0n) {
                        bishopMoves |= temp;
                        break;
                    }

                    //Push
                    bishopMoves |= temp;
                }

                //SW
                temp = mask;
                //Sub-loop - until collision or board edge0
                for (let j = 0; j < 8; j++) {
                    //Edges
                    if ((temp & no1Mask) == 0n) break;
                    if ((temp & noAMask) == 0n) break;

                    temp <<= 9n;
                    //Collision
                    if ((temp & currentPieces) != 0n) break;

                    //Capture
                    if ((temp & otherPieces) != 0n) {
                        bishopMoves |= temp;
                        break;
                    }

                    //Push
                    bishopMoves |= temp;
                }

                //Checks and Pins
                temp = mask;
                bishopMoves = this.checksAndPins(color, pinningRays, temp, bishopMoves);

                //Push moves and reset
                bishopMovesArr.push(bishopMoves);
                bishopMoves = 0n;
            }
            mask >>= 1n;
        }

        //Checks
        if (currentPieces == this.lightPieces) {
             if (this.lightInCheck[0]) {
                for (let i = 0; i < bishopMovesArr.length; i++)
                    for (let j = 0; j < this.lightInCheck[1].length; j++)
                        bishopMovesArr[i] &= (this.lightInCheck[1][j] & (~(this.darkEnPassant >> 8n)));
            }
        } else {
            if (this.darkInCheck[0]) {
                for (let i = 0; i < bishopMovesArr.length; i++)
                    for (let j = 0; j < this.darkInCheck[1].length; j++)
                        bishopMovesArr[i] &= (this.darkInCheck[1][j] & (~(this.lightEnPassant << 8n)));
            }
        }

        return bishopMovesArr
    }

    calcKingMoveBitBoard(kingBitmap, currentPieces, otherPieces, castleRights, color) {
        //Variables
        let mask = initMask;
        let kingMoves = 0n;
        let temp = 0n;
        let otherPawnAttacks;
        let otherRookAttacks;
        let otherKnightAttacks;
        let otherBishopAttacks;
        let otherQueenAttacks;

        //Get other piece attacks
        if (color) {
            otherPawnAttacks = this.calcPawnAttacks(this.darkPawns);
            otherRookAttacks = this.calcRookMoveBitBoard(this.darkRooks, this.darkPieces, (this.lightPieces & ~this.lightKing));
            otherKnightAttacks = this.calcKnightMoveBitBoard(this.darkKnights, otherPieces);
            otherBishopAttacks = this.calcBishopMoveBitBoard(this.darkBishops, this.darkPieces, (this.lightPieces & ~this.lightKing));
            otherQueenAttacks = this.calcQueenMoveBitboard(this.darkQueen, this.darkPieces, (this.lightPieces & ~this.lightKing));
        } else {
            otherPawnAttacks = this.calcPawnAttacks(this.lightPawns);
            otherRookAttacks = this.calcRookMoveBitBoard(this.lightRooks, this.lightPieces, (this.darkPieces & ~this.darkKing));
            otherKnightAttacks = this.calcKnightMoveBitBoard(this.lightKnights, this.lightPieces);
            otherBishopAttacks = this.calcBishopMoveBitBoard(this.lightBishops, this.lightPieces, (this.darkPieces & ~this.darkKing));
            otherQueenAttacks = this.calcQueenMoveBitboard(this.lightQueen, this.lightPieces, (this.darkPieces & ~this.darkKing));
        }
        
        //Combine other piece attacks
        let otherAttacks = otherPawnAttacks | this.getSumOfAttacks(otherRookAttacks, otherKnightAttacks, otherBishopAttacks, otherQueenAttacks);

        //Main Loop
        for (let i = 0; i < 64; i++) {
            if ((kingBitmap & mask) != 0n) {
                //NE
                temp = mask;
                temp &= noHMask;
                temp &= no8Mask;
                temp >>= 9n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        if (!this.isDefended(temp, color))
                            kingMoves |= temp;

                //E
                temp = mask;                         
                temp &= noHMask;
                temp >>= 1n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        if (!this.isDefended(temp, color))
                            kingMoves |= temp;

                //SE
                temp = mask;
                temp &= noHMask;
                temp &= no1Mask;
                temp <<= 7n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        if (!this.isDefended(temp, color))
                            kingMoves |= temp;

                //S
                temp = mask;
                temp &= no1Mask;
                temp <<= 8n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        if (!this.isDefended(temp, color))
                            kingMoves |= temp;

                //SW
                temp = mask;
                temp &= no1Mask;
                temp &= noAMask;
                temp <<= 9n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        if (!this.isDefended(temp, color))
                            kingMoves |= temp;

                //W
                temp = mask;
                temp &= noAMask;
                temp <<= 1n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        if (!this.isDefended(temp, color))
                            kingMoves |= temp;

                //NW
                temp = mask;
                temp &= noAMask;
                temp &= no8Mask;
                temp >>= 7n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        if (!this.isDefended(temp, color))
                            kingMoves |= temp;
                
                //N
                temp = mask;
                temp &= no8Mask;
                temp >>= 8n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        if (!this.isDefended(temp, color))
                            kingMoves |= temp;

                //Short Castles
                if (castleRights[0]) {
                    temp = mask;
                    temp >>= 1n;
                    if (((temp & currentPieces) == 0n) && ((temp & otherAttacks) == 0n)){
                        temp >>= 1n;
                        if (((temp & currentPieces) == 0n) && ((temp & otherAttacks) == 0n))
                            kingMoves |= temp;
                    }
                }

                //Long Castles
                if (castleRights[1]) {
                    temp = mask;
                    if (((temp << 1n) & currentPieces) == 0n && ((temp << 2n) & currentPieces) == 0n && ((temp << 3n) & currentPieces) == 0n)
                        if (((temp << 1n) & otherAttacks) == 0n && ((temp << 2n) & otherAttacks) == 0n && ((temp << 3n) & otherAttacks) == 0n)
                            kingMoves |= (temp << 2n)
                }
            }

            mask >>= 1n;
        }

        return kingMoves;
    }

    calcQueenMoveBitboard(queenBitmap, currentPieces, otherPieces) {
        //Combines rook and bishop boards
        let bishopMoves = this.calcBishopMoveBitBoard(queenBitmap, currentPieces, otherPieces)
        let rookMoves = this.calcRookMoveBitBoard(queenBitmap, currentPieces, otherPieces);
        let queenMoves = [];
        for (let i = 0; i < bishopMoves.length; i++ ) {
            queenMoves.push(bishopMoves[i] | rookMoves[i])
        }
        return queenMoves;
    }

    isDefended(sq, color) {
        let rookDefends;
        let bishopDefends;
        let knightDefends;
        let queenDefends;
        if (color) {
            rookDefends = this.calcRookMoveBitBoard(this.darkRooks, this.lightPieces, this.darkPieces)
            for (let i = 0; i < rookDefends.length; i++)
                if (rookDefends[i] & sq)
                    return true;
            
            bishopDefends = this.calcBishopMoveBitBoard(this.darkBishops, this.lightPieces, this.darkPieces);
            for (let i = 0; i < bishopDefends.length; i++)
                if (bishopDefends[i] & sq)
                    return true;

            knightDefends = this.calcKnightMoveBitBoard(this.darkKnights, this.lightPieces)
            for (let i = 0; i < knightDefends.length; i++)
                if (knightDefends[i] & sq)
                    return true;
            
            queenDefends = this.calcQueenMoveBitboard(this.darkQueen, this.lightPieces, this.darkPieces);
            for (let i = 0; i < queenDefends.length; i++)
                if (queenDefends[i] & sq)
                    return true;
            
            //Pawns (Manual Check)
            if (((sq & noAMask & no1Mask) << 9n) & this.darkPawns)
                return true;
            if (((sq & noHMask & no1Mask) << 7n) & this.darkPawns)
                return true;

            //King (Manual Check)
            if (((sq & noAMask & no1Mask) << 9n) & this.darkKing)
                return true;
            if (((sq & noHMask & no1Mask) << 7n) & this.darkKing)
                return true;
            if (((sq & no1Mask) << 8n) & this.darkKing)
                return true;
            if (((sq & noAMask) << 1n) & this.darkKing)
                return true;
            if (((sq & noHMask) >> 1n) & this.darkKing)
                return true;
            if (((sq & no8Mask) >> 8n) & this.darkKing)
                return true;
            if (((sq & no8Mask & noAMask) >> 7n) & this.darkKing)
                return true;
            if (((sq & no8Mask & noHMask) >> 9n) & this.darkKing)
                return true;
            
        } else {
            rookDefends = this.calcRookMoveBitBoard(this.lightRooks, this.darkPieces, this.lightPieces)
            for (let i = 0; i < rookDefends.length; i++)
                if (rookDefends[i] & sq)
                    return true;
            
            bishopDefends = this.calcBishopMoveBitBoard(this.lightBishops, this.darkPieces, this.lightPieces);
            for (let i = 0; i < bishopDefends.length; i++)
                if (bishopDefends[i] & sq)
                    return true;

            knightDefends = this.calcKnightMoveBitBoard(this.lightKnights, this.darkPieces)
            for (let i = 0; i < knightDefends.length; i++)
                if (knightDefends[i] & sq)
                    return true;
            
            queenDefends = this.calcQueenMoveBitboard(this.lightQueen, this.darkPieces, this.lightPieces);
            for (let i = 0; i < queenDefends.length; i++)
                if (queenDefends[i] & sq)
                    return true;
            
            //Pawns (Manual Check)
            if (((sq & noAMask & no1Mask) << 9n) & this.lightPawns)
                return true;
            if (((sq & noHMask & no1Mask) << 7n) & this.lightPawns)
                return true;

            //King (Manual Check)
            if (((sq & noAMask & no1Mask) << 9n) & this.lightKing)
                return true;
            if (((sq & noHMask & no1Mask) << 7n) & this.lightKing)
                return true;
            if (((sq & no1Mask) << 8n) & this.lightKing)
                return true;
            if (((sq & noAMask) << 1n) & this.lightKing)
                return true;
            if (((sq & noHMask) >> 1n) & this.lightKing)
                return true;
            if (((sq & no8Mask) >> 8n) & this.lightKing)
                return true;
            if (((sq & no8Mask & noAMask) >> 7n) & this.lightKing)
                return true;
            if (((sq & no8Mask & noHMask) >> 9n) & this.lightKing)
                return true;
        }
        return false;
    }

    checksAndPins(color, pinningRays, temp, move) {
        //Returns moves adjusted for checks and pins
        if (color) {
            if (this.lightInCheck[0]) {
                    for (let j = 0; j < this.lightInCheck[1].length; j++)
                        move &= this.lightInCheck[1][j];
            }
        } else {
            if (this.darkInCheck[0]) {
                    for (let j = 0; j < this.darkInCheck[1].length; j++)
                        move &= this.darkInCheck[1][j];
            }
        }

        //Pins
        let raysFromKing;
        if (pinningRays & temp) {
            console.log("Pin\n", this.printPieceStatus(pinningRays))
            if (color) {
                raysFromKing = this.castRays(this.lightKing)
                for (let i = 0; i < raysFromKing.length; i++) {
                    if ((raysFromKing[i] & ~this.lightKing) & pinningRays) {
                        if (!((raysFromKing[i] & pinningRays) & ~temp & ~this.lightKing & this.lightPieces)) {
                            if (countBits((raysFromKing[i] & pinningRays) & this.darkPieces) == 1)
                                move &= (raysFromKing[i] & pinningRays);
                        }
                    }
                }
            }
            if (!color) {
                raysFromKing = this.castRays(this.darkKing)
                for (let i = 0; i < raysFromKing.length; i++) {
                    if ((raysFromKing[i] & ~this.darkKing) & pinningRays) { // Checks if more than 1 piece in ray
                        if (!((raysFromKing[i] & pinningRays) & ~temp & ~this.darkKing & this.darkPieces)) {
                            if (countBits((raysFromKing[i] & pinningRays) & this.lightPieces) == 1)
                                move &= (raysFromKing[i] & pinningRays);
                        }
                    }
                }
            }
        }

        return move;
    }

    getLegalFromSquare(initialSquare) {

        // ! FLOW FROM BOARD STARTS HERE
        //Function to convert from square to binary
        //Helper for getLegal function
        let mask = initMask;
        let sq = 0n;

        //Converts text square to binary square
        for (let i = 1; i <= 8; i++) {
            for (let j = 65; j <= 72; j++) {
                if ((String.fromCharCode(j) + i) == initialSquare)
                    sq = mask;
                mask >>= 1n;
            }
        }

        return this.bitboardToArray(this.getLegal(sq))
    }

    castRays(sq) {
        //Returns array of rays from a square
        let rayArr = [];
        let ray = sq;
        let temp = sq;

        for (let i = 0; i < 8; i++) {
            //N
            if (!(temp & no8Mask)) break;
            ray |= (temp >>= 8n);
        }
        rayArr.push(ray)

        ray = sq;
        temp = sq;
        for (let i = 0; i < 8; i++) {
            //NW
            if (!(temp & no8Mask)) break;
            if (!(temp & noHMask)) break;
            ray |= (temp >>= 9n);
        }
        rayArr.push(ray);

        ray = sq;
        temp = sq;
        for (let i = 0; i < 8; i++) {
            //W
            if (!(temp & noHMask)) break;
            ray |= (temp >>= 1n);
        }
        rayArr.push(ray);
        
        ray = sq;
        temp = sq;
        for (let i = 0; i < 8; i++) {
            //SW
            if (!(temp & noHMask)) break;
            if (!(temp & no1Mask)) break;
            ray |= (temp <<= 7n);
        }
        rayArr.push(ray);

        ray = sq;
        temp = sq;
        for (let i = 0; i < 8; i++) {
            //S
            if (!(temp & no1Mask)) break;
            ray |= (temp <<= 8n);
        }
        rayArr.push(ray);

        ray = sq;
        temp = sq;
        for (let i = 0; i < 8; i++) {
            //SE
            if (!(temp & noAMask)) break;
            if (!(temp & no1Mask)) break;
            ray |= (temp <<= 9n);
        }
        rayArr.push(ray);

        ray = sq;
        temp = sq;
        for (let i = 0; i < 8; i++) {
            //E
            if (!(temp & noAMask)) break;
            ray |= (temp <<= 1n);
        }
        rayArr.push(ray);

        ray = sq;
        temp = sq;
        for (let i = 0; i < 8; i++) {
            //NE
            if (!(temp & noAMask)) break;
            if (!(temp & no8Mask)) break;
            ray |= (temp >>= 7n);
        }
        rayArr.push(ray);
    
        return rayArr;
    }

    getPinningRays(color) {
        //Returns ray from piece to king, through friendly pieces

        let sumOfRays = 0n;
        let mask = initMask;
        let rookMovesArr = []
        let bishopMovesArr = []
        let queenMovesArr = [];

        if (color) {
            let raysFromKing = this.castRays(this.lightKing);
            for (let i = 0; i < 64; i++) {
                if (mask & this.darkRooks)
                    rookMovesArr = rookMovesArr.concat(this.castRays(mask));
                if (mask & this.darkBishops)
                    bishopMovesArr = bishopMovesArr.concat(this.castRays(mask));
                if (mask & this.darkQueen) {
                    queenMovesArr = queenMovesArr.concat(this.castRays(mask));
                }
                mask >>= 1n;
            }

            for (let i = 0; i < rookMovesArr.length; i+=2) {
                for (let j = 0; j < raysFromKing.length; j++) {
                    if ((rookMovesArr[i] & this.lightKing) && ((raysFromKing[j] & ~this.lightKing) & rookMovesArr[i])) {
                        if ((rookMovesArr[i] & raysFromKing[j]) & (this.lightPieces & ~this.lightKing))
                            sumOfRays |= (rookMovesArr[i] & raysFromKing[j])
                    }
                }
            }
            
            for (let i = 1; i < bishopMovesArr.length; i+=2) {
                for (let j = 0; j < raysFromKing.length; j++) {
                    if ((bishopMovesArr[i] & this.lightKing) && ((raysFromKing[j] & ~this.lightKing) & bishopMovesArr[i])) {
                        if ((bishopMovesArr[i] & raysFromKing[j]) & (this.lightPieces & ~this.lightKing))
                            sumOfRays |= (bishopMovesArr[i] & raysFromKing[j])
                    }
                }
            }
            
            for (let i = 0; i < queenMovesArr.length; i++) {
                for (let j = 0; j < raysFromKing.length; j++) {
                    if ((queenMovesArr[i] & this.lightKing) && ((raysFromKing[j] & ~this.lightKing) & queenMovesArr[i])) {
                        if ((queenMovesArr[i] & raysFromKing[j]) & (this.lightPieces & ~this.lightKing))
                            sumOfRays |= (queenMovesArr[i] & raysFromKing[j])
                    }
                }
            }
        } else {
            let raysFromKing = this.castRays(this.darkKing);
            for (let i = 0; i < 64; i++) {
                if (mask & this.lightRooks)
                    rookMovesArr = rookMovesArr.concat(this.castRays(mask));
                if (mask & this.lightBishops)
                    bishopMovesArr = bishopMovesArr.concat(this.castRays(mask));
                if (mask & this.lightQueen) {
                    queenMovesArr = queenMovesArr.concat(this.castRays(mask));
                }
                mask >>= 1n;
            }

            for (let i = 0; i < rookMovesArr.length; i+=2) {
                for (let j = 0; j < raysFromKing.length; j++) {
                    if ((rookMovesArr[i] & this.darkKing) && ((raysFromKing[j] & ~this.darkKing) & rookMovesArr[i])) {
                        if ((rookMovesArr[i] & raysFromKing[j]) & (this.darkPieces & ~this.darkKing))
                            sumOfRays |= (rookMovesArr[i] & raysFromKing[j])
                    }
                }
            }
            
            for (let i = 1; i < bishopMovesArr.length; i+=2) {
                for (let j = 0; j < raysFromKing.length; j++) {
                    if ((bishopMovesArr[i] & this.darkKing) && ((raysFromKing[j] & ~this.darkKing) & bishopMovesArr[i])) {
                        if ((bishopMovesArr[i] & raysFromKing[j]) & (this.darkPieces & ~this.darkKing))
                            sumOfRays |= (bishopMovesArr[i] & raysFromKing[j])
                    }
                }
            }
            
            for (let i = 0; i < queenMovesArr.length; i++) {
                for (let j = 0; j < raysFromKing.length; j++) {
                    if ((queenMovesArr[i] & this.darkKing) && ((raysFromKing[j] & ~this.darkKing) & queenMovesArr[i])) {
                        if ((queenMovesArr[i] & raysFromKing[j]) & (this.darkPieces & ~this.darkKing))
                            sumOfRays |= (queenMovesArr[i] & raysFromKing[j])
                    }
                }
            }
        }

        return sumOfRays;
    }

    getSingleVector(bitboardArr, king, i, j) {
        if (i == 0) { // Pawns
            if (king == this.lightKing) {
                if (((king >> 9n) & noHMask) & this.darkPawns) {
                    if (this.darkEnPassant)
                        return ((king & bitboardArr[i][j]) | (king >> 9n)) | (this.darkEnPassant >> 8n)
                    return ((king & bitboardArr[i][j]) | (king >> 9n))
                }
                if (((king >> 7n) & noAMask) & this.darkPawns){
                    if (this.darkEnPassant)
                        return ((king & bitboardArr[i][j]) | (king >> 7n)) | (this.darkEnPassant >> 8n);
                    return ((king & bitboardArr[i][j]) | (king >> 7n))
                }
            } else {
                if (((king << 7n) & noHMask) & this.lightPawns) {
                    if (this.lightEnPassant) 
                        return ((king & bitboardArr[i][j]) | (king << 7n)) | (this.lightEnPassant << 8n)
                    return ((king & bitboardArr[i][j]) | (king << 7n))
                }
                if (((king << 9n) & noAMask) & this.lightPawns) {
                    if (this.lightEnPassant) {
                        return ((king & bitboardArr[i][j]) | (king << 7n)) | (this.lightEnPassant << 8n)
                    }
                    return((king & bitboardArr[i][j]) | (king << 7n))
                }
            }
        }
        if (i == 1) { //Rooks
            let rookAttacks;
            if (king == this.lightKing) {
                rookAttacks = this.calcRookMoveBitBoard(king, this.lightPieces, this.darkPieces);
                return ((king & bitboardArr[i][j]) | (this.getSumOfSinglePieceAttacks(rookAttacks) & bitboardArr[i][j]) | (this.getSumOfSinglePieceAttacks(rookAttacks) & this.darkRooks))
            } else {
                rookAttacks = this.calcRookMoveBitBoard(king, this.darkPieces, this.lightPieces);
                return ((king & bitboardArr[i][j]) | (this.getSumOfSinglePieceAttacks(rookAttacks) & bitboardArr[i][j]) | (this.getSumOfSinglePieceAttacks(rookAttacks) & this.lightRooks))
            }
        }
        if (i == 2) { //Knights
            let knightAttacks;
            if (king == this.lightKing) {
                knightAttacks = this.calcKnightMoveBitBoard(king, this.lightPieces, this.darkPieces);
                return ((king & bitboardArr[i][j]) | (this.getSumOfSinglePieceAttacks(knightAttacks) & this.darkKnights))
            } else {
                knightAttacks = this.calcKnightMoveBitBoard(king, this.darkPieces, this.lightPieces);
                return ((king & bitboardArr[i][j]) | (this.getSumOfSinglePieceAttacks(knightAttacks) & this.lightKnights))
            }
        }
        if (i == 3) { // Bishops
            let bishopAttacks;
            if (king == this.lightKing) {
                bishopAttacks = this.calcBishopMoveBitBoard(king, this.lightPieces, this.darkPieces);
                return ((king & bitboardArr[i][j]) | (this.getSumOfSinglePieceAttacks(bishopAttacks) & bitboardArr[i][j]) | (this.getSumOfSinglePieceAttacks(bishopAttacks) & this.darkBishops))
            } else {
                bishopAttacks = this.calcBishopMoveBitBoard(king, this.darkPieces, this.lightPieces);
                return ((king & bitboardArr[i][j]) | (this.getSumOfSinglePieceAttacks(bishopAttacks) & bitboardArr[i][j]) | (this.getSumOfSinglePieceAttacks(bishopAttacks) & this.lightBishops))
            }
        }
        if (i == 4) { // Queen
            let queenAttacks = this.castRays(king)
            if (king == this.lightKing) {
                for (let k = 0; k < queenAttacks.length; k++) {
                    if (queenAttacks[k] & this.darkQueen) {
                        return (queenAttacks[k] & bitboardArr[i][j] | this.darkQueen);
                    }
                }
            } else {
                for (let k = 0; k < queenAttacks.length; k++) {
                    if (queenAttacks[k] & this.lightQueen) {
                        return (queenAttacks[k] & bitboardArr[i][j] | this.lightQueen);
                    }
                }
            }
        }
    }

    calcChecks(sq) {
        //Calc Checks
        let whiteMoves
        let blackMoves;
        if (sq & this.lightPieces) {
            blackMoves = this.getBlackMoves();
            for (let i = 0; i < blackMoves.length; i++) 
                for (let j = 0; j < blackMoves[i].length; j++) 
                    if (blackMoves[i][j] & this.lightKing) {
                        this.lightInCheck[0] = true
                        this.lightInCheck[1].push(this.getSingleVector(blackMoves, this.lightKing, i, j))
                    }
            whiteMoves = this.getWhiteMoves();
        }
        if (sq & this.darkPieces) {
            whiteMoves = this.getWhiteMoves();
            for (let i = 0; i < whiteMoves.length; i++) 
                for (let j = 0; j < whiteMoves[i].length; j++) 
                    if (whiteMoves[i][j] & this.darkKing) {
                        this.darkInCheck[0] = true
                        this.darkInCheck[1].push(this.getSingleVector(whiteMoves, this.darkKing, i, j))
                    }
            blackMoves = this.getBlackMoves();
        }

        return [whiteMoves, blackMoves]
    }

    getLegal(sq) {
        // * Calculate legal moves 
        //Calc Checks
        let [whiteMoves, blackMoves] = this.calcChecks(sq);

        //Check player booleans
        if ((sq & this.lightPieces) && (!this.playerBoolean)) return null;
        if ((sq & this.darkPieces) && (this.playerBoolean)) return null;

        if ((sq & this.lightPieces) != 0n) {
            //Light Piece Found, return light moves
            if (sq & this.lightPawns)
                return whiteMoves[0][this.getMoveArrIndex(sq, this.lightPawns)]
            if (sq & this.lightRooks)
                return whiteMoves[1][this.getMoveArrIndex(sq, this.lightRooks)]
            if (sq & this.lightKnights)
                return whiteMoves[2][this.getMoveArrIndex(sq, this.lightKnights)]
            if (sq & this.lightBishops)
                return whiteMoves[3][this.getMoveArrIndex(sq, this.lightBishops)]
            if (sq & this.lightQueen)
                return whiteMoves[4][this.getMoveArrIndex(sq, this.lightQueen)]
            if (sq & this.lightKing)
                return whiteMoves[5]
        }

        if (sq & this.darkPieces) {
            //Dark piece found, return dark moves
            if (sq & this.darkPawns)
                return blackMoves[0][this.getMoveArrIndex(sq, this.darkPawns)]
            if (sq & this.darkRooks)
                return blackMoves[1][this.getMoveArrIndex(sq, this.darkRooks)]
            if (sq & this.darkKnights)
                return blackMoves[2][this.getMoveArrIndex(sq, this.darkKnights)]
            if (sq & this.darkBishops)
                return blackMoves[3][this.getMoveArrIndex(sq, this.darkBishops)]
            if (sq & this.darkQueen)
                return blackMoves[4][this.getMoveArrIndex(sq, this.darkQueen)]
            if (sq & this.darkKing)
                return blackMoves[5]
        }

        //Piece not recognized, return null
        return null;
    }

    getMoveArrIndex (sq, pieceArr) {
        //Returns index of piece in given array based on square
        let mask = initMask;
        let index = 0;
        for (let i = 0; i < 64; i++) {
            if ((mask & pieceArr) != 0n) {
                if ((sq & mask) != 0n)
                    return index;
                index++;
            }
            mask >>= 1n;
        }
    }

    bitboardToArray(bitboard) {
        if (!bitboard) return null;

        //Converts bitboard to array of squares
        let mask = initMask;
        let squareArray = [];
        for (let i = 1; i <= 8; i++) {
            for(let j = 65; j <= 72; j++) {
                if (mask & bitboard)
                    squareArray.push(String.fromCharCode(j) + i);
                mask >>= 1n;
            }
        }

        return squareArray
    }

    getSumOfAttacks(rookMoves, knightMoves, bishopMoves, queenMoves) {
        //Returns all moves OR'd together
        let sumOfMoves = 0n;
        for (let i = 0; i < rookMoves.length; i++) {
            sumOfMoves |= rookMoves[i];
        }
        for (let i = 0; i < knightMoves.length; i++) {
            sumOfMoves |= knightMoves[i];
        }
        for (let i = 0; i < bishopMoves.length; i++) {
            sumOfMoves |= bishopMoves[i]
        }
        for (let i = 0; i < queenMoves.length; i++) { 
            sumOfMoves |= queenMoves[i];
        }

        return sumOfMoves;
    }

    getSumOfSinglePieceAttacks(bitmapArr) {
        let attacks = 0n;
        for (let i = 0; i < bitmapArr.length; i++)
            attacks |= bitmapArr[i];

        return attacks;
    }

    doPromotion(sq, piece, color) {
        if (color) {
            this.lightPawns &= ~sq;
            if (piece == '1') {
                this.lightQueen |= sq;
                console.log(this.printPieceStatus(this.lightQueen))
            }
            if (piece == 2)
                this.lightRooks |= sq;
            if (piece == 3)
                this.lightKnights |= sq;
            if (piece == 4)
                this.lightBishops |= sq;
        } else {
            this.darkPawns &= ~sq;
            if (piece == 1)
                this.darkQueen |= sq;
            if (piece == 2)
                this.darkRooks |= sq;
            if (piece == 3)
                this.darkKnights |= sq;
            if (piece == 4)
                this.darkBishops |= sq;
        }
    }

    getPromoPiece() {
        let piece = window.prompt("Enter Piece: ");
        return piece
    }

    makeMoveFromText(start, target) {
        //Takes in start and end square in text
        //Converts to binary, passes to make move function
        let mask = initMask;
        let startBin = 0n;
        let targetBin = 0n;
        for (let i = 1; i <= 8; i++) {
            for (let j = 65; j <= 72; j++){
                if ((String.fromCharCode(j) + i) == start)
                    startBin |= mask;
                if ((String.fromCharCode(j) + i) == target)
                    targetBin |= mask;
                mask >>= 1n;
            }
        }

        this.makeMove(startBin, targetBin)
    }

    makeMove(start, target) {
        //Reset En-Passant variables
        this.lightEnPassant = 0n;
        this.darkEnPassant = 0n;

        //Reset Check Variables
        this.lightInCheck = [false, []];
        this.darkInCheck = [false, []];

        //Check light castling rights
        if (target & this.lightRooks) {
            if (target & h1)
                this.lightCastleRights[0] = false;
            if (target & a1)
                this.lightCastleRights[1] = false;
        }

        //Check dark castling rights
        if (target & this.darkRooks) {
            if (target & h8)
                this.lightCastleRights[0] = false;
            if (target & a8)
                this.lightCastleRights[1] = false;
        }

        //If capture, remove piece from target square
        if (target & this.darkPieces) {
            this.darkPawns &= ~target;
            this.darkRooks &= ~target;
            this.darkBishops &= ~target;
            this.darkKnights &= ~target;
            this.darkQueen &= ~target;
            this.darkKing &= ~target;
        }
        if (target & this.lightPieces){
            this.lightPawns &= ~target;
            this.lightRooks &= ~target;
            this.lightBishops &= ~target;
            this.lightKnights &= ~target;
            this.lightQueen &= ~target;
            this.lightKing &= ~target;
        }

        //Check light pawns moves
        if (start & this.lightPawns) {
            this.lightPawns &= ~start;
            this.lightPawns |= target;
            //Initialize en-passant variable for double pawn jump
            if ((start & rowTwo) && (target & rowFour)) {
                this.lightEnPassant = target;
            }

            //Check if move is en-passent, if so remove captured pawn
            if (start & rowFive) {
                if (((start & noAMask) << 1n) & this.darkPawns) {
                    if (target & (start >> 7n)) {
                        if (!(target & this.darkPieces))
                            this.darkPawns &= ~(start << 1n);
                    }
                }
                if (((start & noHMask) >> 1n) & this.darkPawns) {
                    if (target & (start >> 9n)) {
                        if (!(target & this.darkPieces))
                            this.darkPawns &= ~(start >> 1n);
                    }
                }
            }

            //Check Promotion
            if (target & ~no8Mask) {
                this.doPromotion(target, this.getPromoPiece(), true);
            }
        }

        //Check light rooks
        if (start & this.lightRooks) {
            this.lightRooks &= ~start;
            this.lightRooks |= target;
            //Update castling rights
            if (start & h1) {
                this.lightCastleRights[0] = false;
            }
            if (start & a1) {
                this.lightCastleRights[1] = false;
            }
        }

        //Check light knights
        if (start & this.lightKnights) {
            this.lightKnights &= ~start
            this.lightKnights |= target;
        }

        //Check light bishops
        if (start & this.lightBishops) {
            this.lightBishops &= ~start
            this.lightBishops |= target;
        }

        //Check light queen
        if (start & this.lightQueen) {
            this.lightQueen &= ~start
            this.lightQueen |= target;
        }

        //Check light king
        if (start & this.lightKing) {
            this.lightKing &= ~start
            this.lightKing |= target;
            if (start & e1) {
                if ((target & g1) && this.lightCastleRights[0]) {
                    //Short Castles
                    this.lightRooks &= ~h1;
                    this.lightRooks |= f1;
                } else if ((target & c1) && this.lightCastleRights[1]) {
                    //Long Castles
                    this.lightRooks &= ~a1;
                    this.lightRooks |= d1;
                } else {
                    this.lightCastleRights[0] = false;
                    this.lightCastleRights[1] = false;
                }
            }
        }

        //Check dark pawns
        if (start & this.darkPawns) {
            this.darkPawns &= ~start
            this.darkPawns |= target;
            //Initialize en-passant on double pawn jump
            if ((start & rowSeven) && (target & rowFive)) {
                this.darkEnPassant = target;
            }
            //If en-passant, remove pawn
            if (start & rowFour) {
                if (((start & noAMask) << 1n) & this.lightPawns) {
                    if (target & (start << 9n)) {
                        if (!(target & this.lightPieces))
                            this.lightPawns &= ~(start << 1n);
                    }
                }
                if (((start & noHMask) >> 1n) & this.lightPawns) {
                    if (target & (start << 7n)) {
                        if (!(target & this.lightPieces))
                            this.lightPawns &= ~(start >> 1n);
                    }
                }
            }
            //Check Promotion
            if (target & ~no1Mask) {
                this.doPromotion(target, this.getPromoPiece(), false);
            }
        }

        //Check dark rooks
        if (start & this.darkRooks) {
            this.darkRooks &= ~start
            this.darkRooks |= target;
            if (start & h8) {
                this.darkCastleRights[0] = false;
            }
            if (start & a8) {
                this.darkCastleRights[1] = false;
            }
        }

        //Check dark knights
        if (start & this.darkKnights) {
            this.darkKnights &= ~start
            this.darkKnights |= target;
        }
        
        //Check dark bishops
        if (start & this.darkBishops) {
            this.darkBishops &= ~start
            this.darkBishops |= target;
        }

        //Check dark queen
        if (start & this.darkQueen) {
            this.darkQueen &= ~start
            this.darkQueen |= target;
        }

        //Check dark king
        if (start & this.darkKing) {
            this.darkKing &= ~start
            this.darkKing |= target;
            if (start & e8) {
                if ((target & g8) && this.darkCastleRights[0]) {
                    //Short Castles
                    this.darkRooks &= ~h8;
                    this.darkRooks |= f8;
                } else if ((target & c8) && this.darkCastleRights[1]) {
                    //Long Castles
                    this.darkRooks &= ~a8;
                    this.darkRooks |= d8;
                } else {
                    this.darkCastleRights[0] = false;
                    this.darkCastleRights[1] = false;
                }
            }
        }

        //Update piece boards
        this.lightPieces = this.lightPawns | this.lightRooks | this.lightKnights | this.lightBishops | this.lightQueen | this.lightKing;
        this.darkPieces = this.darkPawns | this.darkRooks | this.darkKnights | this.darkBishops | this.darkQueen | this.darkKing;

        //this.print();
    }
}

// * INITIALIZE GLOBAL BOARD * //
var myBoard = new Board();
myBoard.bitBoardFromArray();
// * ----------------------- * //

// * IS LEGAL MOVE * //
function isLegalMove(oldSquare, newSquare, element) {
    //Get DOM elements
    let target = document.querySelector('.' + newSquare);
    let container = document.querySelector('.PieceContainer');

    //Get moves from board
    let moves = window.myBoard.getLegalFromSquare(oldSquare);
    if (!moves) return false; // No legal moves

    //Legal moves found, loop through and check target square
    for (let i = 0; i < moves.length; i++) {
        if (moves[i] == newSquare) {
            //Target square found. Make move on board
            window.myBoard.makeMoveFromText(oldSquare, newSquare);

            //Update classes of target square, remove piece if occupied
            if (target.classList.contains('Occupied')) {
                target.classList.remove(target.classList[3], target.classList[4]);
                target.classList.add("Occupied");
                container.appendChild(target.children[0])
            }
            //Update player boolean
            window.myBoard.playerBoolean = !window.myBoard.playerBoolean;

            //Check special moves
            checkCastles(oldSquare, newSquare);
            checkEnPassants(oldSquare, newSquare, element);

            //Return
            return true;
        };  
    }

    //Move not in legal moves. Exit
    return false;
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
function checkEnPassants(oldSquare, newSquare, element) {
    //Eliminates everything but pawns
    if (!element.id.includes("Pawn")) return;

    //Eliminates pawns on all other squares
    if (oldSquare[1] != "4" && oldSquare[1] != "5") return;

    //Get elements from DOM
    let newSquareDiv = document.querySelector('.' + newSquare)
    let container = document.querySelector(".PieceContainer")

    if (oldSquare[1] == "5" && newSquare[1] == "6") {
        if (!newSquareDiv.classList.contains("Occupied") && oldSquare[0] != newSquare[0]) {
            //En Passant Requested and approved
            let clearSquare = document.querySelector('.' + newSquare[0] + oldSquare[1]);
            container.append(clearSquare.children[0]);
            clearSquare.classList.remove(clearSquare.classList[3], clearSquare.classList[4])
        }
        return;
    }

    if (oldSquare[1] == "4" && newSquare[1] == "3") {
        if (!newSquareDiv.classList.contains("Occupied") && oldSquare[0] != newSquare[0]) {
            //En Passant Requested and approved
            let clearSquare = document.querySelector('.' + newSquare[0] + oldSquare[1]);
            container.append(clearSquare.children[0]);
            clearSquare.classList.remove(clearSquare.classList[3], clearSquare.classList[4])
        }
    }
}

function countBits(number) {
    let count = 0;
    while (number != 0) {
        number &= (number - 1n)
        count++;
    }

    return count;
}