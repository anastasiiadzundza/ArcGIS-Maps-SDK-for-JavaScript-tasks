require(["esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/widgets/Legend"], (Map, MapView, FeatureLayer, Legend) => {
    // Create an arrow symbol using an SVG path
    // Since the arrow points downward, we set
    // the angle to 180 degrees to point to
    // 0 geographic degrees north

    const symbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        path: "M14.5,29 23.5,0 14.5,9 5.5,0z",
        color: "#ffff00",
        outline: {
            color: [0, 0, 0, 0.7],
            width: 0.5
        },
        angle: 180,
        size: 15
    };

    /******************************************************
     *
     * Create a SimpleRenderer where each feature will be
     * rendered with the same symbol (in this case, an arrow).
     * Set the symbol on the renderer and a "rotation"
     * visual variable that points to a field in the stream service
     * that contains heading information for each feature.
     * The "geographic" rotation type assumes 0 degrees is due north.
     *
     * The size visual variable resizes each symbol
     * based on the feature's wind speed.
     *
     *******************************************************/

    const rotationRenderer = {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: symbol,
        legendOptions: {showLegend: true, title: 'Rotation'},
        visualVariables: [
            {
                type: "rotation",
                field: "WIND_DIRECT",
                rotationType: "geographic",
                // axis:'tilt', // Only applicable when working in a SceneView.
            },
            {
                type: "size",
                field: "WIND_SPEED",
                minDataValue: 0,
                maxDataValue: 60,
                minSize: 8,
                maxSize: 40
            }
        ]
    };

    // Construct the layer and add it to the map

    const layer = new FeatureLayer({
        url:
            "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/weather_stations_010417/FeatureServer/0",
        renderer: rotationRenderer
    });

    const map = new Map({
        basemap: "satellite",
        layers: [layer]
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        extent: {
            spatialReference: { wkid: 3857 },
            xmin: -41525513,
            ymin: 4969181,
            xmax: -36687355,
            ymax: 9024624
        }
    });

    const legend = new Legend({
        view: view
    });

    view.ui.add(legend, "bottom-left");
});