import { Mapper } from "../../Mappers/types/Mapper";

type ChainedMappers<T extends [Mapper<any, any>, ...Mapper<any, any>[]]> =
    T extends [Mapper<infer A, infer B>, ...infer Rest]
        ? Rest extends [Mapper<any, any>, ...Mapper<any, any>[]]
            ? Rest extends [Mapper<B, infer C>, ...infer Tail]
                ? [Mapper<A, B>, ...ChainedMappers<Rest>]
                : never
            : [Mapper<A, B>]
        : never;

export type StringChainedMappers<T extends [Mapper<any, any>, ...Array<Mapper<any, any>>]> =
    T extends [Mapper<string, infer B>, ...infer Rest]
        ? ChainedMappers<T>
        : never;
