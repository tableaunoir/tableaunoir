export type ActionSerialized =
    { type: "init", userid: string, pause?: boolean, canvasDataURL: string } |
    { type: "clearzone", userid: string, pause?: boolean, points: any, cut: boolean, removeContour: boolean } |
    { type: "ellipse", userid: string, pause?: boolean, cx: number, cy: number, rx: number, ry: number, color: string } |
    { type: "rectangle", userid: string, pause?: boolean, x1: number, y1: number, x2: number, y2: number, color: string } |
    { type: "line", userid: string, pause?: boolean, x1: number, y1: number, x2: number, y2: number, color: string } |
    { type: "freedraw", userid: string, pause?: boolean, points: any } |
    { type: "erase",  userid: string, pause?: boolean, points: any } |
    { type: "printmagnet", userid: string, pause?: boolean, magnet: string, x: number, y: number };