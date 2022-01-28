const noHMask = 0b1111111011111110111111101111111011111110111111101111111011111110n;
const noAMask = 0b0111111101111111011111110111111101111111011111110111111101111111n;
const maskInit = 0b1000000000000000000000000000000000000000000000000000000000000000n;

var rayAttacksFromSquare = [];
var lightPawnAttacksFromSquare = [];
var darkPawnAttacksFromSquare = [];
var kingAttacksFromSquare = [];
var binarySquares = [];
var binaryDict = {
    0: 0,
};

//Generate Tables on Launch
function generateRays() {
    let mask = maskInit;
    for (let i = 0; i < 64; i++) {
        binaryDict[mask] = i;
        mask >>= 1n;
    }

    //N
    let north = 0b0000000010000000100000001000000010000000100000001000000010000000n;
    for (let i = 0; i < 64; i++) {
        rayAttacksFromSquare[i] = [north];
        north >>= 1n;
    }

    //NE
    mask = maskInit;
    let temp;
    let ray;
    for (let i = 0; i < 64; i++) {
        temp = mask;
        ray = 0n;
        for (let j = 0; j < 8; j++) {
            temp &= noHMask;
            temp >>= 9n;
            ray |= temp;
        }
        rayAttacksFromSquare[i][1] = ray;
        mask >>= 1n;
    }

    //E
    mask = maskInit;
    temp = mask;
    ray = 0n;
    for (let i = 0; i < 64; i++) {
        temp = mask;
        ray = 0n;
        for (let j = 0; j < 8; j++) {
            temp &= noHMask;
            temp >>= 1n;
            ray |= temp;
        }
        mask >>= 1n;
        rayAttacksFromSquare[i][2] = ray;
    }

    //SE
    mask = maskInit;
    temp = mask;
    ray = 0n;
    for (let i = 0; i < 64; i++) {
        temp = mask;
        ray = 0n;
        for (let j = 0; j < 8; j++) {
            temp &= noHMask;
            temp <<= 7n;
            ray |= temp;
        }
        mask >>= 1n;
        rayAttacksFromSquare[i][3] = ray;
    }

    //S
    mask = maskInit;
    temp = mask;
    ray = 0n;
    for (let i = 0; i < 64; i++) {
        temp = mask;
        ray = 0n;
        for (let j = 0; j < 8; j++) {
            temp <<= 8n;
            ray |= temp;
        }
        mask >>= 1n;
        rayAttacksFromSquare[i][4] = ray;
    }

    //SW
    mask = maskInit;
    temp = mask;
    ray = 0n;
    for (let i = 0; i < 64; i++) {
        temp = mask;
        ray = 0n;
        for (let j = 0; j < 8; j++) {
            temp &= noAMask;
            temp <<= 9n;
            ray |= temp;
        }
        mask >>= 1n;
        rayAttacksFromSquare[i][5] = ray;
    }

    //W
    mask = maskInit;
    temp = mask;
    ray = 0n;
    for (let i = 0; i < 64; i++) {
        temp = mask;
        ray = 0n;
        for (let j = 0; j < 8; j++) {
            temp &= noAMask;
            temp <<= 1n;
            ray |= temp;
        }
        mask >>= 1n;
        rayAttacksFromSquare[i][6] = ray;
    }

    //NW
    mask = maskInit;
    temp = mask;
    ray = 0n;
    for (let i = 0; i < 64; i++) {
        temp = mask;
        ray = 0n;
        for (let j = 0; j < 8; j++) {
            temp &= noAMask;
            temp >>= 7n;
            ray |= temp;
        }
        mask >>= 1n;
        rayAttacksFromSquare[i][7] = ray;
    }

    // generateRookAttacks();
    // generateBishopAttacks();
    // generateQueenAttacks();
    // generateKnightAttacks();
    generateKingAttacks();
    generatePawnAttacks();
    generateSquares();

    return rayAttacksFromSquare;
}

function generateKingAttacks() {
    let mask = maskInit;
    let kingMoves;
    for (let i = 0; i < 64; i++) {
        kingMoves = 0n;
        //N
        kingMoves |= mask >> 8n;

        //NE
        kingMoves |= (mask >> 9n) & noAMask;

        //E
        kingMoves |= (mask >> 1n) & noAMask;

        //SE
        kingMoves |= (mask << 7n) & noAMask;

        //S
        kingMoves |= mask << 8n;

        //SW
        kingMoves |= (mask << 9n) & noHMask;

        //W
        kingMoves |= (mask << 1n) & noHMask;

        //NW
        kingMoves |= (mask >> 7n) & noHMask;

        kingAttacksFromSquare[i] = kingMoves;
        mask >>= 1n;
    }
}

function generatePawnAttacks() {
    let mask = maskInit;
    let pawnAttacks;
    for (let i = 0; i < 64; i++) {
        temp = mask;
        pawnAttacks = 0n;
        //NE
        pawnAttacks |= (mask >> 9n) & noHMask;

        //NW
        pawnAttacks |= (mask >> 7n) & noAMask;

        lightPawnAttacksFromSquare[i] = pawnAttacks;

        //SE
        pawnAttacks = 0n;
        pawnAttacks |= (mask << 7n) & noHMask;
        //SW
        pawnAttacks |= (mask << 9n) & noAMask;

        darkPawnAttacksFromSquare[i] = pawnAttacks;

        mask >>= 1n;
    }
}

function generateSquares() {
    let mask = maskInit;
    for (let i = 0; i < 64; i++) {
        binarySquares.push(mask);
        mask >>= 1n;
    }
}

//General Helper Functions
function NOne(bin) {
    return bin >> 8n;
}
function NEOne(bin) {
    return (bin >> 9n) & noAMask;
}
function EOne(bin) {
    return (bin >> 1n) & noAMask;
}
function SEOne(bin) {
    return (bin << 7n) & noAMask;
}
function SOne(bin) {
    return (bin & 0b0000000011111111111111111111111111111111111111111111111111111111n) << 8n;
}
function SWOne(bin) {
    return (bin << 9n) & noHMask;
}
function WOne(bin) {
    return (bin << 1n) & noHMask;
}
function NWOne(bin) {
    return (bin >> 7n) & noHMask;
}
function LSB1(bin) {
    return bin & -bin;
}
function MSB1(bin) {
    bin |= bin >> 32n;
    bin |= bin >> 16n;
    bin |= bin >> 8n;
    bin |= bin >> 4n;
    bin |= bin >> 2n;
    bin |= bin >> 1n;
    return (bin >> 1n) + 1n;
}
function print(bin) {
    let str = ["", "", "", "", "", "", "", ""];
    let mask = 0b1000000000000000000000000000000000000000000000000000000000000000n;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (mask & bin) str[i] += "1";
            else str[i] += "0";
            mask >>= 1n;
        }
    }

    let final = "";
    for (let i = 7; i >= 0; i--) {
        final += str[i] + "\n";
    }

    console.log(final);
}
function getBinFromSquare(sq) {
    return binarySquares[sq];
}
function slidingNorthRay(bin, occ, dict, rays) {
    let sq = dict[bin];
    let intersect = rays[sq][0] & occ;
    return rays[sq][0] ^ rays[dict[MSB1(intersect)]][0];
}
function slidingNorthEastRay(bin, occ, dict, rays) {
    let sq = dict[bin];
    let intersect = rays[sq][1] & occ;
    return rays[sq][1] ^ rays[dict[MSB1(intersect)]][1];
}
function slidingEastRay(bin, occ, dict, rays) {
    let sq = dict[bin];
    let intersect = rays[sq][2] & occ;
    return rays[sq][2] ^ rays[dict[MSB1(intersect)]][2];
}
function slidingNorthWestRay(bin, occ, dict, rays) {
    let sq = dict[bin];
    let intersect = rays[sq][7] & occ;
    return rays[sq][7] ^ rays[dict[MSB1(intersect)]][7];
}
function slidingSouthEastRay(bin, occ, dict, rays) {
    let sq = dict[bin];
    let intersect = rays[sq][3] & occ;
    return rays[sq][3] ^ rays[dict[LSB1(intersect)]][3];
}
function slidingSouthRay(bin, occ, dict, rays) {
    let sq = dict[bin];
    let intersect = rays[sq][4] & occ;
    return rays[sq][4] ^ rays[dict[LSB1(intersect)]][4];
}
function slidingSouthWestRay(bin, occ, dict, rays) {
    let sq = dict[bin];
    let intersect = rays[sq][5] & occ;
    return rays[sq][5] ^ rays[dict[LSB1(intersect)]][5];
}
function slidingWestRay(bin, occ, dict, rays) {
    let sq = dict[bin];
    let intersect = rays[sq][6] & occ;
    return rays[sq][6] ^ rays[dict[LSB1(intersect)]][6];
}
function northAttacks(bin, empty) {
    let flood = bin;
    flood |= bin = (bin >> 8n) & empty;
    flood |= bin = (bin >> 8n) & empty;
    flood |= bin = (bin >> 8n) & empty;
    flood |= bin = (bin >> 8n) & empty;
    flood |= bin = (bin >> 8n) & empty;
    flood |= (bin >> 8n) & empty;
    return flood >> 8n;
}
function northEastAttacks(bin, empty) {
    empty &= noAMask;
    let flood = bin;
    flood |= bin = (bin >> 9n) & empty;
    flood |= bin = (bin >> 9n) & empty;
    flood |= bin = (bin >> 9n) & empty;
    flood |= bin = (bin >> 9n) & empty;
    flood |= bin = (bin >> 9n) & empty;
    flood |= (bin >> 9n) & empty;
    return (flood >> 9n) & noAMask;
}
function eastAttacks(bin, empty) {
    let flood = bin;
    empty &= noAMask;
    flood |= bin = (bin >> 1n) & empty;
    flood |= bin = (bin >> 1n) & empty;
    flood |= bin = (bin >> 1n) & empty;
    flood |= bin = (bin >> 1n) & empty;
    flood |= bin = (bin >> 1n) & empty;
    flood |= (bin >> 1n) & empty;
    return (flood >> 1n) & noAMask;
}
function southEastAttacks(bin, empty) {
    let flood = bin;
    empty &= noAMask;
    flood |= bin = (bin << 7n) & empty;
    flood |= bin = (bin << 7n) & empty;
    flood |= bin = (bin << 7n) & empty;
    flood |= bin = (bin << 7n) & empty;
    flood |= bin = (bin << 7n) & empty;
    flood |= (bin << 7n) & empty;
    return (flood << 7n) & noAMask;
}
function southAttacks(bin, empty) {
    let flood = bin;
    flood |= bin = (bin << 8n) & empty;
    flood |= bin = (bin << 8n) & empty;
    flood |= bin = (bin << 8n) & empty;
    flood |= bin = (bin << 8n) & empty;
    flood |= bin = (bin << 8n) & empty;
    flood |= (bin << 8n) & empty;
    return flood << 8n;
}
function southWestAttacks(bin, empty) {
    let flood = bin;
    empty &= noHMask;
    flood |= bin = (bin << 9n) & empty;
    flood |= bin = (bin << 9n) & empty;
    flood |= bin = (bin << 9n) & empty;
    flood |= bin = (bin << 9n) & empty;
    flood |= bin = (bin << 9n) & empty;
    flood |= (bin << 9n) & empty;
    return (flood << 9n) & noHMask;
}
function westAttacks(bin, empty) {
    let flood = bin;
    empty &= noHMask;
    flood |= bin = (bin << 1n) & empty;
    flood |= bin = (bin << 1n) & empty;
    flood |= bin = (bin << 1n) & empty;
    flood |= bin = (bin << 1n) & empty;
    flood |= bin = (bin << 1n) & empty;
    flood |= (bin << 1n) & empty;
    return (flood << 1n) & noHMask;
}
function northWestAttacks(bin, empty) {
    let flood = bin;
    empty &= noHMask;
    flood |= bin = (bin >> 7n) & empty;
    flood |= bin = (bin >> 7n) & empty;
    flood |= bin = (bin >> 7n) & empty;
    flood |= bin = (bin >> 7n) & empty;
    flood |= bin = (bin >> 7n) & empty;
    flood |= (bin >> 7n) & empty;
    return (flood >> 7n) & noHMask;
}
function knightAttacks(bin) {
    let west, east, attacks;
    east = EOne(bin);
    west = WOne(bin);
    attacks = (east | west) << 16n;
    attacks |= (east | west) >> 16n;
    east = EOne(east);
    west = WOne(west);
    attacks |= (east | west) << 8n;
    attacks |= (east | west) >> 8n;
    return attacks;
}
function blackPawnEastAttacks(bin) {
    return SEOne(bin);
}
function blackPawnWestAttacks(bin) {
    return SWOne(bin);
}
function whitePawnEastAttacks(bin) {
    return NEOne(bin);
}
function whitePawnWestAttacks(bin) {
    return NWOne(bin);
}
function getArrayDiff(arr) {
    let newArr = [arr[0]];
    for (let i = 1; i < arr.length; i++) newArr.push(arr[i] - arr[i - 1]);

    return newArr;
}

generateRays();
