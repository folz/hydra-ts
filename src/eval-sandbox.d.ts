import { Sandbox } from './lib/sandbox';
export declare class EvalSandbox {
    makeGlobal: boolean;
    parent: Record<string, any>;
    sandbox: ReturnType<typeof Sandbox>;
    userProps: string[];
    constructor(parent: Record<string, any>, makeGlobal: boolean, userProps?: string[]);
    add(name: string): void;
    set(property: string, value: number): void;
    tick(): void;
    eval(code: string): void;
}
