declare function mouseButtons(ev: any): any;
declare function mouseElement(ev: any): any;
declare function mouseRelativeX(ev: any): any;
declare function mouseRelativeY(ev: any): any;
declare const _default: {
    buttons: typeof mouseButtons;
    element: typeof mouseElement;
    x: typeof mouseRelativeX;
    y: typeof mouseRelativeY;
};
export default _default;
