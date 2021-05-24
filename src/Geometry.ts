export class Geometry {
    static distance(p1: { x: number, y: number }, p2: { x: number, y: number }): number {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    static norm(vector: { x: number, y: number }): number {
        return Math.sqrt(vector.x ** 2 + vector.y ** 2);
    }

    static normalize(vector: { x: number, y: number }): { x: number, y: number } {
        const norm = Geometry.norm(vector);
        return { x: vector.x / norm, y: vector.y / norm };
    }

    static angle(u: { x: number, y: number }, v: { x: number, y: number }): number {
       /* u = Geometry.normalize(u);
        v = Geometry.normalize(v);
        const scalarProduct = u.x * v.x + u.y * v.y;
        return Math.acos(scalarProduct);*/
        return Math.atan2(u.y, u.x) - Math.atan2(v.y, v.x);
    }

    static polar(center: { x: number, y: number }, distance: number, angle: number): { x: number, y: number } {
        return { x: center.x + distance * Math.cos(angle), y: center.y + distance * Math.sin(angle) };
    }

    static middle(p1: { x: number, y: number }, p2: { x: number, y: number }): { x: number, y: number } {
        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    }

    static numberRound(x: number): number {
        return Math.round(10 * x) / 10;
    }

    /**
     * 
     * @param point 
     * @param origin 
     * @param direction 
     * @returns the coordinates "x" along the vector origin->direction, and "y" along the vector orthogonal to origin->direction 
     */
    static getNewCoordinates(point: { x: number, y: number }, origin: { x: number, y: number }, direction: { x: number, y: number }): { x: number, y: number } {
        const directionVector = { x: direction.x - origin.x, y: direction.y - origin.y };
        const distance = Geometry.distance(origin, point);
        const OP = { x: point.x - origin.x, y: point.y - origin.y };
        const angle = Geometry.angle(OP, directionVector);
        return {
            x: distance * Math.cos(angle),
            y: distance * Math.sin(angle)
        };
    }
}