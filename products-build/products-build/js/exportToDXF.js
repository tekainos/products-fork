function exportToDXF(objects) {
    var verts = { 'paths': [] };
    objects.forEach(function (ob) {
        console.log(ob);
        var ln = [];
        /*var line = {
            type: 'line',
            origin: [],
            end: []
        };*/
        var rmverts = [];
        for (var i = 0; i < ob.length; i++) {
            var ln0 = [[ob[i][0].x, ob[i][0].z], [ob[i][1].x, ob[i][1].z]];
            var ln1 = [[ob[i][1].x, ob[i][1].z], [ob[i][2].x, ob[i][2].z]];
            var ln2 = [[ob[i][2].x, ob[i][2].z], [ob[i][3].x, ob[i][3].z]];
            var ln3 = [[ob[i][3].x, ob[i][3].z], [ob[i][0].x, ob[i][0].z]];
            rmverts.push(new makerjs.paths.Line(ln0));
            rmverts.push(new makerjs.paths.Line(ln1));
            rmverts.push(new makerjs.paths.Line(ln2));
            rmverts.push(new makerjs.paths.Line(ln3));
        }
        console.log(rmverts);
        verts = { 'paths': rmverts.concat(verts.paths), 'layer' : 'Walls' };
        console.log(verts);
    });
    if (verts.paths.length > 0) {
        var svg = makerjs.exporter.toSVG(verts);
        var dxf = makerjs.exporter.toDXF(verts);
        console.log(svg);
        writeBlobToFile(dxf, 'test');
    }
}