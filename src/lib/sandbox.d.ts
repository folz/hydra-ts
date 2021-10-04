export declare const Sandbox: (parent: Record<string, any>) => {
    addToContext: (name: string, object: string) => void;
    eval: (code: string) => void;
};
