export class Geometry {
    static distance(p1: { x: number, y: number }, p2: { x: number, y: number }): number {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    static angle(p1: { x: number, y: number }, p2: { x: number, y: number }): number {
        return Math.atan2(p2.y - p1.y, p2.x - p1.x);
    }

    static polar(center: { x: number, y: number }, distance: number, angle: number): { x: number, y: number } {
        return { x: center.x + distance * Math.cos(angle), y: center.y + distance * Math.sin(angle) };
    }

    static middle(p1: { x: number, y: number }, p2: { x: number, y: number }): { x: number, y: number } {
        return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    }
}