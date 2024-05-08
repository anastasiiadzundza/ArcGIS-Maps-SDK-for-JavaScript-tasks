require([
    "esri/Map",
    "esri/views/SceneView",
    "esri/layers/ElevationLayer",
    "esri/layers/BaseElevationLayer",
    "esri/Basemap",
    "esri/layers/TileLayer"
], (Map, SceneView, ElevationLayer, BaseElevationLayer, Basemap, TileLayer) => {
    //////////////////////////////////////////////
    //
    //   Create a subclass of BaseElevationLayer
    //
    /////////////////////////////////////////////

    const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
        // Add an exaggeration property whose value will be used
        // to multiply the elevations at each tile by a specified
        // factor. In this case terrain will render 100x the actual elevation.

        properties: {
            exaggeration: 70
        },

        // The load() method is called when the layer is added to the map
        // prior to it being rendered in the view.
        load: function () {

            // TopoBathy3D contains elevation values for both land and ocean ground
            this._elevation = new ElevationLayer({
                url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/TopoBathy3D/ImageServer"
            });

            // wait for the elevation layer to load before resolving load()
            this.addResolvingPromise(
                this._elevation.load().then(() => {
                    // get tileInfo, spatialReference and fullExtent from the elevation service
                    // this is required for elevation services with a custom spatialReference
                    this.tileInfo = this._elevation.tileInfo;
                    this.spatialReference = this._elevation.spatialReference;
                    this.fullExtent = this._elevation.fullExtent;
                })
            );

            return this;
        },

        // Fetches the tile(s) visible in the view
        fetchTile: function (level, row, col, options) {
            // calls fetchTile() on the elevationlayer for the tiles
            // visible in the view
            return this._elevation.fetchTile(level, row, col, options).then(
                function (data) {
                    console.log(data);
                    const exaggeration = this.exaggeration;
                    // `data` is an object that contains
                    // the width and the height of the tile in pixels,
                    // and the values of each pixel
                    for (let i = 0; i < data.values.length; i++) {
                        // Multiply the given pixel value
                        // by the exaggeration value
                        data.values[i] = data.values[i] * exaggeration;
                    }

                    return data;
                }.bind(this)
            );
        }
    });

    const basemap = new Basemap({
        baseLayers: [
            new TileLayer({
                url:
                    "https://tiles.arcgis.com/tiles/nGt4QxSblgDfeJn9/arcgis/rest/services/terrain_with_heavy_bathymetry/MapServer",
                copyright:
                    'Bathymetry, topography and satellite imagery from <a href="https://visibleearth.nasa.gov/view_cat.php?categoryID=1484" target="_blank">NASA Visible Earth</a> | <a href="http://www.aag.org/global_ecosystems" target="_blank">World Ecological Land Units, AAG</a> | Oceans, glaciers and water bodies from <a href="https://www.naturalearthdata.com/" target="_blank">Natural Earth</a>'
            })
        ]
    });

    const elevationLayer = new ExaggeratedElevationLayer();

    // Add the exaggerated elevation layer to the map's ground
    // in place of the default world elevation service
    const map = new Map({
        basemap: basemap,
        ground: {
            layers: [elevationLayer]
        }
    });

    const view = new SceneView({
        container: "viewDiv",
        map: map,
        camera: {
            position: [50, 40, 1921223.3],
            heading: 300,
            tilt: 50,
        },
    });
    let exaggerated = true;

    document.getElementById("exaggerate").addEventListener("click", (event) => {
        console.log(view);

        if (exaggerated) {
            map.ground = "world-elevation";
            event.target.innerHTML = "Enable exaggeration";
            exaggerated = false;
        } else {
            map.ground = {
                layers: [elevationLayer]
            };
            event.target.innerHTML = "Disable exaggeration";
            exaggerated = true;
        }
    });
});