export type ActionSerialized =
    { type: "init", userid: string, pause?: boolean, canvasDataURL: string } |
    { type: "clear", userid: string, pause?: boolean } |
    { type: "clearzone", userid: string, pause?: boolean, points: any, cut: boolean, removeContour: boolean } |
    { type: "ellipse", userid: string, pause?: boolean, cx: number, cy: number, rx: number, ry: number, color: string } |
    { type: "rectangle", userid: string, pause?: boolean, x1: number, y1: number, x2: number, y2: number, color: string } |
    { type: "line", userid: string, pause?: boolean, x1: number, y1: number, x2: number, y2: number, color: string } |
    { type: "freedraw", userid: string, pause?: boolean, points: any } |
    { type: "fill", userid: string, pause?: boolean, points: any, color: string } |
    { type: "freedrawinteractivegraph", userid: string, pause?: boolean, points: any, magnet1id: string, magnet2id: string, magnet1point: {x:number, y:number}, magnet2point: {x:number, y:number} } |
    { type: "erase", userid: string, pause?: boolean, points: any } |
    { type: "printmagnet", userid: string, pause?: boolean, magnet: string, x: number, y: number } |
    { type: "magnetnew", userid: string, pause?: boolean, magnet: string } |
    { type: "magnetdelete", userid: string, pause?: boolean, magnetid: string } |
    { type: "magnetmove", userid: string, pause?: boolean, magnetid: string, points: { x: number; y: number; }[]} |
    { type: "magnetswitchbackgroundforeground", userid: string, pause?: boolean, magnetid: string} |
    { type: "magnetchangesizeratio", userid: string, pause?: boolean, magnetid: string, ratio: number}
    ;