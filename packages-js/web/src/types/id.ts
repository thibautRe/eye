export type Id<T extends string> = number & { __brand?: T }
