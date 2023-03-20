export class ClipPathManager {
    static isInsidePolygon(p: { x: number; y: number }, polygon: { x: number; y: number; }[]): unknown {
        // ray-casting algorithm based on
        // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

        const x = p.x, y = p.y;

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;

            const intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }

    /**
     * 
     * @param clipPathString 
     * @returns an array of the points in the clippath expression
     */
    static clipPathToPoints(clipPathString: string): { x: number, y: number }[] {
        const A = [];
        const strPointsInClipPath = clipPathString.substr("polygon(".length, clipPathString.length - "polygon(".length - ")".length);
        for (const pointStr of strPointsInClipPath.split(",")) {
            const point = pointStr.trim().split(" ");
            A.push({ x: parseInt(point[0]), y: parseInt(point[1]) });
        }
        return A;
    }


    /**
     * 
     * @param clipPathString 
     * @param ratio 
     * @returns the clippath expression with the points resized with the ratio
     */
    static clipPathChangeSize(clipPathString: string, ratio: number): string {
        if (clipPathString == "")
            return "";

        return ClipPathManager.pointsToClipPath(ClipPathManager.clipPathToPoints(clipPathString)
            .map((p) => ({ x: Math.round(p.x * ratio), y: Math.round(p.y * ratio) })));

    }

    /**
     * 
     * @param points 
     * @returns the clip path expression containing exactly the points
     */
    static pointsToClipPath(points: { x: number, y: number }[]): string {
        return "polygon(" + points.map(point => `${point.x}px ${point.y}px`).join(", ") + ")";
    }


    /**
     * 
     * @param a 
     * @param b 
     * @returns true if a and b are the same list of points
     */
    static almostSameListOfPoints(a: { x: number, y: number }[], b: { x: number, y: number }[]) {
        console.log("sameListOfPoints")
        console.log(a)
        console.log(b)
        return a.length === b.length &&
            a.every((val, index) => Math.abs(val.x - b[index].x) < 2 && Math.abs(val.y - b[index].y) < 2);
    }
}