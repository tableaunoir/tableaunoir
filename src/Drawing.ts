class Drawing {

    /**
     * 
     * @param points 
     * @description clear (erase) the inside of the polygon
     */
    static clearPolygon(points) {
        const context = getCanvas().getContext("2d");
        context.save();
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let point of points) {
            context.lineTo(point.x, point.y);
        }
        context.clip();
        context.clearRect(0, 0, Layout.getWindowWidth(), Layout.getWindowHeight());
        context.restore();
        context.globalCompositeOperation = "source-over";

    }


    /**
     * 
     * @param points 
     * @description erase the contour of the polygon
     */
    static removeContour(points) {
        const canvas = getCanvas();
        const context = canvas.getContext("2d");
        context.globalCompositeOperation = "destination-out";
        context.strokeStyle = "rgba(255, 255, 255, 1)";
        context.lineWidth = 6;
        context.globalAlpha = 1.0;

        context.moveTo(points[0].x, points[0].y);
        for (let point of points) {
            context.lineTo(point.x, point.y);
        }
        context.stroke();
    }
}