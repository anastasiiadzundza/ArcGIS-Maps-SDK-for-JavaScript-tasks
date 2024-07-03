require(["esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/core/reactiveUtils"], (Map, MapView, FeatureLayer, reactiveUtils) => {
    const map = new Map({
        basemap: "hybrid"
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        extent: {
            // autocasts as new Extent()
            xmin: -9177811,
            ymin: 4247000,
            xmax: -9176791,
            ymax: 4247784,
            spatialReference: 102100
        }
    });

    /********************
     * Add feature layer
     ********************/

        // Carbon storage of trees in Warren Wilson College.
    const featureLayer = new FeatureLayer({
            url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0"
        });

    map.add(featureLayer);

    console.log(view);

    featureLayer.queryFeatures({where: "Condition <> 'Excellent'", outFields: '*'}).then((result) => {
        console.log(result)
    })


    reactiveUtils.when(
        () => view.stationary === true, () => {
            featureLayer.queryFeatures({
                where: "Condition <> 'Excellent'",
                outFields: '*',
                geometry: view.extent
            }).then((result) => {
                console.log(result)
            });
        });

});

// {geometry: evt.mapPoint, outFields: '*', spatialRelationship: 'intersects', returnGeometry: true}
//