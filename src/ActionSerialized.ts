/**
 * @description the action (all the classes deriving from the class Action) serialized
 * The serialized version is used to be stored in a .tableaunoir file, or to be transmitted via the Internet
 */
export type ActionSerialized =
    { type: "init", userid: string, canvasDataURL: string } |
    { type: "clear", userid: string } |
    { type: "clearzone", userid: string, points: any } |
    { type: "ellipse", userid: string, cx: number, cy: number, rx: number, ry: number, color: string } |
    { type: "rectangle", userid: string, x1: number, y1: number, x2: number, y2: number, color: string } |
    { type: "line", userid: string, x1: number, y1: number, x2: number, y2: number, color: string } |
    { type: "freedraw", userid: string, points: any } |
    { type: "fill", userid: string, points: any, color: string } |
    { type: "freedrawinteractivegraph", userid: string, points: any, magnet1id: string, magnet2id: string, magnet1point: { x: number, y: number }, magnet2point: { x: number, y: number } } |
    { type: "erase", userid: string, points: any } |
    { type: "printmagnet", userid: string, magnet: string, x: number, y: number } |
    { type: "magnetnew", userid: string, magnet: string } |
    { type: "magnetdelete", userid: string, magnetid: string } |
    { type: "magnetmove", userid: string, magnetid: string, points: { x: number; y: number; }[] } |
    { type: "magnetswitchbackgroundforeground", userid: string, magnetid: string, destination: number } |
    { type: "magnetchangesizeratio", userid: string, magnetid: string, ratio: number } |
    { type: "slidestart", userid: string } |
    { type: "wait", userid: string, delay: number };