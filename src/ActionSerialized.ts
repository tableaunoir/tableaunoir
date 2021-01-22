export type ActionSerialized =
    { type: "init", userid: string, canvasDataURL: string } |
    { type: "clearzone", userid: string, points: any, cut: boolean, removeContour: boolean } |
    { type: "ellipse", userid: string, cx: number, cy: number, rx: number, ry: number, color: string } |
    { type: "rectangle", userid: string, x1: number, y1: number, x2: number, y2: number, color: string } |
    { type: "line", userid: string, x1: number, y1: number, x2: number, y2: number, color: string } |
    { type: "freedraw", userid: string, points: any } |
    { type: "erase",  userid: string, points: any } |
    { type: "printmagnet", userid: string, magnet: string, x: number, y: number };