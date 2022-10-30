export type Id<T extends string> = number & { readonly __brand?: T }
