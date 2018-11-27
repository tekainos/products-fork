function exportToDXF(objects) {
    var verts = { 
        'models':
        {
            'walls': {
                'paths': []
            },
            'doors': {
                'paths': []
            }
        }
    };
    objects.forEach(function (objset) {
        console.log(objset);
        ob = objset.room;
        dr = objset.door;
        var ln = [];
        /*var line = {
            type: 'line',
            origin: [],
            end: []
        };*/
        var rmverts = [];
        var doorverts = [];
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
        for (var c = 0; c < dr.length; c++) {
            for (var z = 0; z < dr[c].length; z++) {
                var dl0 = z == dr[c].length - 1 ? [[dr[c][z].x, dr[c][z].y], [dr[c][0].x, dr[c][0].y]] : [[dr[c][z].x, dr[c][z].y], [dr[c][z + 1].x, dr[c][z + 1].y]];
                doorverts.push(new makerjs.paths.Line(dl0));
            }
        }
        verts = {
            'models': {
                'walls': {
                    'paths': rmverts.concat(verts.models.walls.paths), 'layer': 'Walls'
                },
                'doors': {
                    'paths': doorverts.concat(verts.models.doors.paths), 'layer': 'Doors'
                }
            }
        };
        console.log(verts);
    });
    if (verts.models.walls.paths.length > 0) {
        var svg = makerjs.exporter.toSVG(verts);
        var dxf = makerjs.exporter.toDXF(verts);
        console.log(svg);
        writeBlobToFile(dxf, 'test');
    }
}

function exportModel(objects, filetype) {
    var combined = new THREE.Geometry();
    objects.forEach(function (objset) {
        var walls = objset.walls;
        var floor = objset.floor;
        var feats = objset.features;

        var wallMat = new THREE.MeshToonMaterial({ color: 0x1D6DA0, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
        
        for (var i = 0; i < walls.length; i++) {
            var msh = walls[i];
            msh.updateMatrix();
            combined.merge(msh.geometry, msh.matrix);
        }

        floor.updateMatrix();
        combined.merge(floor.geometry, floor.matrix);

        for (var c = 0; c < feats.length; c++) {
            var feat = feats[c];
            feat.updateMatrix();
            combined.merge(feat.geometry, feat.matrix);
        }

        combined = new THREE.Mesh(combined, wallMat);
    });

    var exporter = filetype == 'OBJ' ? new THREE.OBJExporter() : new THREE.STLExporter();

    var filename = "test";
    var type = filetype == 'OBJ' ? [{ 'description': 'OBJ File', 'suffix': '.obj' }] : [{ 'description': 'STL File', 'suffix': '.stl' }];
    save(exporter.parse(combined), filename, type);
    return combined;
}