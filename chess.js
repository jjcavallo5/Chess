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

//TODO -->  Implement En-Passant ----------------------- DONE
//TODO -->  Fix error with king after castling --------- DONE
//TODO -->  Fix Castling ------------------------------- DONE
//TODO -->  Implement "Check" -------------------------- 
//TODO -->  Implement Pins, discovered check, etc
//TODO -->  En Passant Discovered Check

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
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
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
        let lightKingMoves = this.calcKingMoveBitBoard(this.lightKing, this.lightPieces, this.darkPieces, this.lightCastleRights, 'white');

        return [lightPawnMoves, lightRookMoves, lightKnightMoves, lightBishopMoves, lightQueenMoves, lightKingMoves];
    }

    getBlackMoves() {
        let darkPawnMoves = this.calcDarkPawnMoveBitBoard(this.darkPawns);
        let darkRookMoves = this.calcRookMoveBitBoard(this.darkRooks, this.darkPieces, this.lightPieces);
        let darkKnightMoves = this.calcKnightMoveBitBoard(this.darkKnights, this.darkPieces)
        let darkBishopMoves = this.calcBishopMoveBitBoard(this.darkBishops, this.darkPieces, this.lightPieces);
        let darkQueenMoves = this.calcQueenMoveBitboard(this.darkQueen, this.darkPieces, this.lightPieces);
        let darkKingMoves = this.calcKingMoveBitBoard(this.darkKing, this.darkPieces, this.lightPieces, this.darkCastleRights, 'black');
        return [darkPawnMoves, darkRookMoves, darkKnightMoves, darkBishopMoves, darkQueenMoves, darkKingMoves];
    }

    printPieceStatus(bitboard) {
        //Prints board from 64 bit number
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
        let string = "";
        for(let i = 63; i >= 0; i--) {
            if ((mask & bitboard) != 0n)
                string += '1'
            else
                string += '0'
            if (i % 8 == 0)
                string += '\n'
            
            mask >>= 1n;
        }
        return ReverseString(string);
    }

    calcLightPawnMoveBitBoard(pawnBitmap) {
        // Variables
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
        let noAMask = 0b0111111101111111011111110111111101111111011111110111111101111111n;
        let noHMask = 0b1111111011111110111111101111111011111110111111101111111011111110n;
        let masked;
        let temp;
        let pawnMove = 0n;
        let pawnMoves = [];

        //Loop Through Board
        for (let i = 0; i < 64; i++) {
            masked = pawnBitmap & mask;
            temp = masked;
            if (masked != 0n) {
                // * Pawns Found
                //Check for En Passant
                if (this.darkEnPassant) {
                    //Left
                    if (((this.darkEnPassant & noAMask) << 1n) & masked) {
                        pawnMove |= (this.darkEnPassant >> 8n)
                    }
                    //Right
                    if (((this.darkEnPassant & noHMask) >> 1n) & masked) {
                        pawnMove |= (this.darkEnPassant >> 8n)
                    }
                }
                //Shift Masked
                masked >>= 8n;

                //Standard forward moves
                if ((masked & this.lightPieces) == 0n && (masked & this.darkPieces) == 0n) {
                    pawnMove |= masked;
                    if (i < 16) {
                        //Pawn on initial Square
                        masked >>= 8n
                        if ((masked & this.lightPieces) == 0n && (masked & this.darkPieces) == 0n)
                            pawnMove |= masked;
                    }
                }

                //Check Capture Right
                if ((((temp & noHMask) >> 9n) & this.darkPieces) != 0n) {
                    pawnMove |= (temp >> 9n)
                }

                //Check Capture Left
                if ((((temp & noAMask) >> 7n) & this.darkPieces) != 0n) {
                    pawnMove |= (temp >> 7n)
                }

                //Push pawn moves and reset
                pawnMoves.push(pawnMove)
                pawnMove = 0n;
            }
            mask >>= 1n;
        }

        return pawnMoves;
    }

    calcDarkPawnMoveBitBoard(pawnBitmap) {
        //Vars
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
        let noAMask = 0b0111111101111111011111110111111101111111011111110111111101111111n;
        let noHMask = 0b1111111011111110111111101111111011111110111111101111111011111110n;
        let masked;
        let temp;
        let pawnMoves = [];
        let pawnMove = 0n;
        //Main Loop
        for (let i = 0; i < 64; i++) {
            masked = pawnBitmap & mask;
            temp = masked;
            if (masked != 0n) {
                // * Pawn Found
                //Check En-Passant
                if (this.lightEnPassant) {
                    if (((this.lightEnPassant & noAMask) << 1n) & masked) {
                        console.log("in if")
                        pawnMove |= (this.lightEnPassant << 8n)
                    }
                    if (((this.lightEnPassant & noHMask) >> 1n) & masked) {
                        pawnMove |= (this.lightEnPassant << 8n)
                    }
                }

                //Shift Masked
                masked <<= 8n;

                //Standard forward moves
                if ((masked & this.lightPieces) == 0n && (masked & this.darkPieces) == 0n) {
                    pawnMove |= masked;
                    if (i >= 48) {
                        //Pawn on initial Square
                        masked <<= 8n
                        if ((masked & this.lightPieces) == 0n && (masked & this.darkPieces) == 0n)
                            pawnMove |= masked;
                    }
                }

                //Check right capture
                if ((((temp & noHMask) << 7n) & this.lightPieces) != 0n) {
                    pawnMove |= (temp << 7n)
                }

                //Check left capture
                if ((((temp & noAMask) << 9n) & this.lightPieces) != 0n) {
                    pawnMove |= (temp << 9n)
                }

                //Push moves and reset
                pawnMoves.push(pawnMove)
                pawnMove = 0n;
            }
            mask >>= 1n;
        }

        return pawnMoves;
    }

    calcLightPawnAttacks(pawnBitmap) {
        //Variables
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
        let noAMask = 0b0111111101111111011111110111111101111111011111110111111101111111n;
        let noHMask = 0b1111111011111110111111101111111011111110111111101111111011111110n;
        let no8Mask = 0b1111111111111111111111111111111111111111111111111111111100000000n;
        let pawnAttacks = 0n;

        //Loop through board
        for (let i = 0; i < 64; i++) {
            if (pawnBitmap & mask) {
                // * Pawn Found
                //Add right attack
                if ((mask & noAMask) && (mask & no8Mask)) {
                    pawnAttacks |= (mask >> 7n)
                }
                //Add left attack
                if ((mask & noHMask) && (mask & no8Mask)) {
                    pawnAttacks |= (mask >> 9n)
                }
            }
            mask >>= 1n;
        }
        return pawnAttacks;
    }

    calcDarkPawnAttacks(pawnBitmap) {
        //Variables
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
        let noAMask = 0b0111111101111111011111110111111101111111011111110111111101111111n;
        let noHMask = 0b1111111011111110111111101111111011111110111111101111111011111110n;
        let no1Mask = 0b0000000011111111111111111111111111111111111111111111111111111111n;
        let pawnAttacks = 0n;

        //Loop through board
        for (let i = 0; i < 64; i++) {
            if (pawnBitmap & mask) {
                // * Pawn Found
                //Add left attack
                if ((mask & noAMask) && (mask & no1Mask)) {
                    pawnAttacks |= (mask << 9n)
                }
                //Add right attack
                if ((mask & noHMask) && (mask & no1Mask)) {
                    pawnAttacks |= (mask << 7n)
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
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
        let noHMask = 0b1111111011111110111111101111111011111110111111101111111011111110n;
        let noAMask = 0b0111111101111111011111110111111101111111011111110111111101111111n;
        let no8Mask = 0b1111111111111111111111111111111111111111111111111111111100000000n;
        let no1Mask = 0b0000000011111111111111111111111111111111111111111111111111111111n;
        let masked;
        let temp;

        //Main Loop
        for (let i = 0; i < 64; i++) {
            masked = rookBitmap & mask;
            if (masked != 0n) {
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
        let noHMask = 0b1111111011111110111111101111111011111110111111101111111011111110n;
        let noAMask = 0b0111111101111111011111110111111101111111011111110111111101111111n;
        let no8Mask = 0b1111111111111111111111111111111111111111111111111111111100000000n;
        let no1Mask = 0b0000000011111111111111111111111111111111111111111111111111111111n;
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n
        let temp = 0n;
        let knightMoves = 0n;
        let knightMovesArr = [];

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
        let noHMask = 0b1111111011111110111111101111111011111110111111101111111011111110n;
        let noAMask = 0b0111111101111111011111110111111101111111011111110111111101111111n;
        let no8Mask = 0b1111111111111111111111111111111111111111111111111111111100000000n;
        let no1Mask = 0b0000000011111111111111111111111111111111111111111111111111111111n;
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
        let temp;
        let bishopMoves = 0n;
        let bishopMovesArr = [];

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

                //Push moves and reset
                bishopMovesArr.push(bishopMoves);
                bishopMoves = 0n;
            }
            mask >>= 1n;
        }

        return bishopMovesArr
    }

    calcKingMoveBitBoard(kingBitmap, currentPieces, otherPieces, castleRights, color) {
        //Variables
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
        let noAMask = 0b0111111101111111011111110111111101111111011111110111111101111111n;
        let noHMask = 0b1111111011111110111111101111111011111110111111101111111011111110n;
        let no8Mask = 0b1111111111111111111111111111111111111111111111111111111100000000n;
        let no1Mask = 0b0000000011111111111111111111111111111111111111111111111111111111n;
        let kingMoves = 0n;
        let temp = 0n;
        let otherPawnAttacks;
        let otherRookAttacks;
        let otherKnightAttacks;
        let otherBishopAttacks;
        let otherQueenAttacks;

        //Get other piece attacks
        if (color == 'white') {
            otherPawnAttacks = this.calcDarkPawnAttacks(this.darkPawns);
            otherRookAttacks = this.calcRookMoveBitBoard(this.darkRooks, this.darkPieces, (this.lightPieces & ~this.lightKnights));
            otherKnightAttacks = this.calcKnightMoveBitBoard(this.darkKnights, otherPieces);
            otherBishopAttacks = this.calcBishopMoveBitBoard(this.darkBishops, this.darkPieces, (this.lightPieces & ~this.lightKing));
            otherQueenAttacks = this.calcQueenMoveBitboard(this.darkQueen, this.darkQueen, (this.lightPieces & ~this.lightKing));
        } else {
            otherPawnAttacks = this.calcLightPawnAttacks(this.lightPawns);
            otherRookAttacks = this.calcRookMoveBitBoard(this.lightRooks, otherPieces, (this.darkPieces & ~this.darkKing));
            otherKnightAttacks = this.calcKnightMoveBitBoard(this.lightKnights, otherPieces);
            otherBishopAttacks = this.calcBishopMoveBitBoard(this.lightBishops, otherPieces, (this.darkPieces & ~this.darkKing));
            otherQueenAttacks = this.calcQueenMoveBitboard(this.lightQueen, otherPieces, (this.darkPieces & ~this.darkKing));
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
                        kingMoves |= temp;

                //E
                temp = mask;                         
                temp &= noHMask;
                temp >>= 1n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        kingMoves |= temp;

                //SE
                temp = mask;
                temp &= noHMask;
                temp &= no1Mask;
                temp <<= 7n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        kingMoves |= temp;

                //S
                temp = mask;
                temp &= no1Mask;
                temp <<= 8n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        kingMoves |= temp;

                //SW
                temp = mask;
                temp &= no1Mask;
                temp &= noAMask;
                temp <<= 9n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        kingMoves |= temp;

                //W
                temp = mask;
                temp &= noAMask;
                temp <<= 1n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        kingMoves |= temp;

                //NW
                temp = mask;
                temp &= noAMask;
                temp &= no8Mask;
                temp >>= 7n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
                        kingMoves |= temp;
                
                //N
                temp = mask;
                temp &= no8Mask;
                temp >>= 8n;
                if ((temp & currentPieces) == 0n)
                    if ((temp & otherAttacks) == 0n)
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

    getLegalFromSquare(initialSquare) {
        //Function to convert from square to binary
        //Helper for getLegal function
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
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

    getLegal(sq) {
        //Calculate legal moves
        let whiteMoves = this.getWhiteMoves();
        let blackMoves = this.getBlackMoves();

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
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
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
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
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

    makeMoveFromText(start, target) {
        //Takes in start and end square in text
        //Converts to binary, passes to make move function
        let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
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
        //Variables
        let noAMask = 0b0111111101111111011111110111111101111111011111110111111101111111n;
        let noHMask = 0b1111111011111110111111101111111011111110111111101111111011111110n;

        //Reset En-Passant variables
        this.lightEnPassant = 0n;
        this.darkEnPassant = 0n;

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

function ReverseString(str) {
    //Helper for printing binary boards
    return str.split('').reverse().join('')
 }