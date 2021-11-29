export function ensureDecimalDot(val) {
    val = val.toString();
    if (val.indexOf('.') < 0) {
        val += '.';
    }
    return val;
}
