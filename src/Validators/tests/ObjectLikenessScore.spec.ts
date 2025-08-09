import { ObjectLikenessScore } from "../utils/ObjectLikenessScore";

describe("Using ObjectLikenessScore", () => {

    describe("given two of the same object", () => {
        let objectA: Record<any, any>;
        let objectB: Record<any, any>;

        beforeEach(() => {
            objectA = {
                a: "hello",
                b: {
                    hello: "world",
                    whatever: {
                        a: 1,
                        b: 2,
                        c: 3
                    }
                },
                c: {
                    another: "one",
                    just: "to",
                    test: {
                        things: ", so",
                        i: "am",
                        sure: "this works"
                    }
                }
            };

            objectB = structuredClone(objectA);
        })

        test("then it should provide a full score with no mismatches", () => {
            expect(ObjectLikenessScore(objectA, objectB)).toEqual({
                score: 100,
                totalProperties: 14,
                missingProperties: [],
                valueMismatches: []
            });
        });
    });

    describe("given one empty object and one non-empty object", () => {
        let objectA: Record<any, any>;
        let objectB: Record<any, any>;

        beforeEach(() => {
            objectA = {
                a: "hello",
                b: {
                    hello: "world",
                    whatever: {
                        a: 1,
                        b: 2,
                        c: 3
                    }
                },
                c: {
                    another: "one",
                    just: "to",
                    test: {
                        things: ", so",
                        i: "am",
                        sure: "this works"
                    }
                }
            };

            objectB = {};
        });

        test("then it should provide a score of 0 with all property misses caught", () => {
            expect(ObjectLikenessScore(objectA, objectB)).toEqual({
                score: 0,
                totalProperties: 14,
                missingProperties: [
                    "root.a",
                    "root.b",
                    "root.b.hello",
                    "root.b.whatever",
                    "root.b.whatever.a",
                    "root.b.whatever.b",
                    "root.b.whatever.c",
                    "root.c",
                    "root.c.another",
                    "root.c.just",
                    "root.c.test",
                    "root.c.test.things",
                    "root.c.test.i",
                    "root.c.test.sure"
                ],
                valueMismatches: []
            });
        });
    })

    describe("given two objects with the same properties, but with different values", () => {
        let objectA: Record<any, any>;
        let objectB: Record<any, any>;

        beforeEach(() => {
            objectA = {
                a: "hello",
                b: {
                    hello: "world",
                    whatever: {
                        a: 1,
                        b: 2,
                        c: 3
                    }
                },
                c: {
                    another: "one",
                    just: "to",
                    test: {
                        things: ", so",
                        i: "am",
                        sure: "this works"
                    }
                }
            };

            objectB = {
                a: "2",
                b: {
                    hello: "2",
                    whatever: {
                        a: 9,
                        b: 9,
                        c: 9
                    }
                },
                c: {
                    another: "2",
                    just: "2",
                    test: {
                        things: "2",
                        i: "2",
                        sure: "2"
                    }
                }
            };
        });

        test("then it should provide a score of 0 with all value misses caught", () => {
            expect(ObjectLikenessScore(objectA, objectB)).toEqual({
                score: 0,
                totalProperties: 14,
                missingProperties: [],
                valueMismatches: [
                    ["root.a", "hello"],
                    ["root.b.hello", "world"],
                    ["root.b.whatever.a", 1],
                    ["root.b.whatever.b", 2],
                    ["root.b.whatever.c", 3],
                    ["root.b.whatever", objectA.b.whatever],
                    ["root.b", objectA.b],
                    ["root.c.another", "one"],
                    ["root.c.just", "to"],
                    ["root.c.test.things", ", so"],
                    ["root.c.test.i", "am"],
                    ["root.c.test.sure", "this works"],
                    ["root.c.test", objectA.c.test],
                    ["root.c", objectA.c]
                ]
            });
        });
    })
});
