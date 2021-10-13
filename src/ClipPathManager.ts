export class ClipPathManager {

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

}