declare type Callback = (buttonState: number, x: number, y: number, mods: {
    shift: boolean;
    alt: boolean;
    control: boolean;
    meta: boolean;
}) => void;
export default function mouseListen(callback?: Callback): any;
export default function mouseListen(element?: HTMLElement | Window, callback?: Callback): any;
export {};
