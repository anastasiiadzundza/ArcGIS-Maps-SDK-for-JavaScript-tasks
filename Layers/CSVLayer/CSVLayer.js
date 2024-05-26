require(["esri/WebScene", "esri/layers/CSVLayer", "esri/views/SceneView"], (
    WebScene,
    CSVLayer,
    SceneView
) => {


    // Paste the url into a browser's address bar to download and view the attributes
    // in the CSV file. These attributes include:
    // * mag - magnitude
    // * type - earthquake or other event such as nuclear test
    // * place - location of the event
    // * time - the time of the event

    const template = {
        title: "Earthquake Info",
        content: "Magnitude {mag} {type} hit {place} on {time}."
    };


//     // Pass data by a blob url to create a CSV layer.
//     const csv = `name|year|latitude|Longitude
// aspen|2020|40.418|20.553
// birch|2018|-118.123|35.888`;

    // delimiter = '|';
//
//
//     const blob = new Blob([csv], {
//         type: "plain/text"
//     });
//     let url = URL.createObjectURL(blob);
//
//
//
//     const csvLayer = new CSVLayer({
//         url: url,
//         copyright: "USGS Earthquakes",
//         popupTemplate: template,
//         // featureReduction: {
//         //     type: "selection"
//         // },
//     });

    // If CSV files are not on the same domain as your website, a CORS enabled server
    // or a proxy is required.
    const url = "https://developers.arcgis.com/javascript/latest/sample-code/layers-csv/live/earthquakes.csv";

    const csvLayer = new CSVLayer({
        url: url,
        copyright: "USGS Earthquakes",
        popupTemplate: template,
        featureReduction: {
            type: "selection"
        },
    });

    csvLayer.renderer = {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
            type: "point-3d", // autocasts as new PointSymbol3D()
            // for this symbol we use 2 symbol layers, one for the outer circle
            // and one for the inner circle
            symbolLayers: [{
                type: "icon", // autocasts as new IconSymbol3DLayer()
                resource: { primitive: "circle"},
                material: { color: [255, 84, 54, 1] },
                size: 5
            }, {
                type: "icon", // autocasts as new IconSymbol3DLayer()
                resource: { primitive: "circle"},
                material: { color: [255, 84, 54, 0] },
                outline: {color: [255, 84, 54, 0.6], size: 1},
                size: 25
            }]
        }
    };

    const map = new WebScene({
        portalItem: {
            id: "a467ef1140de4e88acf34d38df9fb869"
        }
    });

    map.add(csvLayer);

    const view = new SceneView({
        container: "viewDiv",
        qualityProfile: "high",
        map: map,
        alphaCompositingEnabled: true,
        highlightOptions: {
            fillOpacity: 0,
            color: "#ffffff"
        },
        constraints: {
            altitude: {
                min: 700000
            }
        },
        environment: {
            background: {
                type: "color",
                color: [0, 0, 0, 0]
            },
            lighting: {
                type: "virtual"
            }
        }
    });
});