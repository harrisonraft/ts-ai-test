import { isObject } from "./IsObject";

type ObjectLikeness = {
    score: number;
    totalProperties: number;
    missingProperties: Array<string>;
    valueMismatches: Array<[string, any]>;
}


export function ObjectLikenessScore(a: Record<any, any>, b: Record<any, any>, prevPath: string = "", score: ObjectLikeness = { score: 0, totalProperties: 0, missingProperties: [], valueMismatches: [] }) {
    const keys = Object.keys(a);

    for (const key of keys) {
        score.totalProperties++;
        const path = prevPath ? `${prevPath}.${key}` : `root.${key}`;

        if (!(key in b)) {
            score.missingProperties.push(`${path}`);

            if (isObject(a[key])) {
                ObjectLikenessScore(a[key], {}, `${path}`, score)
            }

            continue;
        }

        if (typeof a[key] !== typeof b[key]) {
            score.valueMismatches.push([`${path}`, a[key]]);

            if (isObject(a[key])) {
                ObjectLikenessScore(a[key], {}, `${path}`, score)
            }

            continue;
        }

        if (isObject(a[key])) {
            ObjectLikenessScore(a[key], b[key], `${path}`, score);
            continue;
        }

        // TODO - fix scoring issue, could result in negative scores because we're counting value mismatches for array items
        //  which are not counted in totalProperties

        if (Array.isArray(a[key])) {
            if ((Array.isArray(b[key]) && a[key].length !== b[key].length) || !Array.isArray(b[key])) {
                score.valueMismatches.push([`${path}`, a[key]]);
            }

            for (let i = 0; i < a[key].length; i++) {
                const itemPath = `${path}[${i}]`;

                if (typeof a[key][i] !== typeof b[key][i]) {
                    score.valueMismatches.push([itemPath, a[key][i]]);
                    continue;
                }

                if (isObject(a[key][i])) {
                    if (!isObject(b[key][i])) {
                        ObjectLikenessScore(a[key][i], {}, itemPath, score);
                    } else {
                        ObjectLikenessScore(a[key][i], b[key][i], itemPath, score);
                    }
                    continue;
                } else if (a[key][i] !== b[key][i]) {
                    score.valueMismatches.push([itemPath, a[key][i]]);
                }
            }

            continue;
        }

        if (a[key] !== b[key]) {
            score.valueMismatches.push([`${path}`, a[key]]);
        }
    }

    if (prevPath !== "") {
        let noValues = true;
        for (const key of keys) {
            const path = prevPath ? `${prevPath}.${key}` : `root.${key}`;

            if (score.valueMismatches.findIndex(v => v[0] === path) === -1) {
                noValues = false;
                break;
            }
        }

        if (noValues) {
            score.valueMismatches.push([prevPath, a]);
        }
    }

    const scoreValue = score.totalProperties > 0 ? Math.floor(((score.totalProperties - score.missingProperties.length - score.valueMismatches.length) / score.totalProperties) * 100) : 100;
    score.score = scoreValue;

    return score;
}
