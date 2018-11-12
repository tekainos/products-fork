function exportToDXF(objects) {
    var verts = [];
    objects.forEach(function (ob) {
        console.log(ob);
        var line = {
            type: 'line',
            origin: [],
            end: []
        };
        for (var i = 0; i < ob.length; i++) {
            if (ob.y < 0.2) {
                if (line.origin.length > 0) {
                    line.end = [ob.x, ob.z];
                    verts.push(line.slice());
                    line.end = [];
                }
                line.origin = [ob.x, ob.z];
            }
        }
    });
    if (verts.length > 0) {
        var svg = makerjs.exporter.toSVG(verts);
        console.log(svg);
    }
}