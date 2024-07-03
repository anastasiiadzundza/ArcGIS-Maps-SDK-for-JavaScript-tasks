require(["esri/Map", "esri/views/SceneView", "esri/layers/ElevationLayer", "esri/core/reactiveUtils"],
    (Map, SceneView, ElevationLayer, reactiveUtils) => {
        // Create elevation layer and add to the map
        const elevationLayer = new ElevationLayer({
            url:
                "https://sampleserver6.arcgisonline.com/arcgis/rest/services/OsoLandslide/OsoLandslide_After_3DTerrain/ImageServer",
            visible: false,
        });

        // Create the Map
        const map = new Map({
            basemap: "topo-vector",
            ground: "world-elevation"
            // ground: {layers: [elevationLayer]}
        });

        // Create the MapView
        const view = new SceneView({
            container: "viewDiv",
            map: map,
            camera: {
                position: [-121.83, 48.279, 1346],
                heading: 300,
                tilt: 60
            }
        });


        console.log(elevationLayer);
        // console.log(view);
            elevationLayer.load().then((elevation) => {
                let handler;
                reactiveUtils.when(() => view.stationary === true, () => {

                        console.log(elevation);

                        elevation.createElevationSampler(view.extent).then((sampler) => {
                            console.log("new sampler");
                            console.log(sampler);
                            handler = view.on("pointer-move", (e) => {
                                const pt = view.toMap(e);
                                const result = sampler.queryElevation(pt);
                                // console.log(result);
                                console.log("lat", result.latitude);
                                console.log("lon", result.longitude);
                                console.log("elev", result.z);

                            });
                        })
                    })
                reactiveUtils.when(() => view.stationary === false, () => {
                    handler?.remove();
                })
        });


        // add the elevationlayer after the ground instance got created
        // map.ground.when(() => {
        //     map.ground.layers.add(elevationLayer);
        // });

        // Place the element with title, additional information and checkbox
        view.ui.add(infoDiv, "top-right");
        // Register events on the checkbox and create the callback function
        document.getElementById("landslideInput").addEventListener("change", () => {
            // If checkbox is checked, use after landslide elevation data
            elevationLayer.visible = document.getElementById("landslideInput").checked;
        });
    });