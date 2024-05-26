require(["esri/views/SceneView", "esri/WebScene", "esri/layers/GroupLayer", "esri/analysis/DimensionAnalysis", "esri/analysis/LengthDimension", "esri/layers/DimensionLayer", "esri/widgets/Expand", "esri/widgets/LayerList", "esri/widgets/Slider"], function (SceneView, WebScene, GroupLayer, DimensionAnalysis, LengthDimension, DimensionLayer, Expand, LayerList, Slider) {

    const view = new SceneView({
        container: "viewDiv",
        map: new WebScene({
            portalItem: {
                id: "313c4a9ea86546b3a445a3d159e90350"
            }
        }),
        environment: {
            lighting: {
                directShadowsEnabled: true
            }
        },
        qualityProfile: "high",
        popup: null
    });
    view.when(async () => {
        const programmaticDimensionLayer = new DimensionLayer({
            title: "Programmatic dimensions",
            source: new DimensionAnalysis({
                style: {
                    type: "simple",
                    textBackgroundColor: [0, 0, 0, 0.6],
                    textColor: "white",
                    fontSize: 12
                }
            })
        });
        view.map.add(programmaticDimensionLayer);
        const interactiveDimensionAnalysis = new DimensionAnalysis({
            style: {
                type: "simple",
                color: [19, 70, 148],
                textBackgroundColor: [19, 70, 148, 0.8],
                textColor: "white"
            }
        });
        const interactiveDimensionLayer = new DimensionLayer({
            title: "Interactive dimensions",
            source: interactiveDimensionAnalysis
        });
        view.map.add(interactiveDimensionLayer);
        const interactiveDimensionLayerView = await view.whenLayerView(interactiveDimensionLayer);
        console.log(interactiveDimensionLayerView);
        const apartmentsLayer = view.map.layers.find((layer) => layer.title === "Stadskantoor");
        apartmentsLayer.outFields = ["*"];

        // add the building and dimensioning into a grouplayer
        const groupLayer = new GroupLayer({
            layers: [apartmentsLayer, programmaticDimensionLayer],
            title: "Building with dimensions"
        });
        view.map.add(groupLayer);

        const apartmentsLayerView = await view.whenLayerView(apartmentsLayer);

        function filterByFloorNr(selectedFloor) {
            apartmentsLayerView.filter = {
                where: "Level_ <= '" + selectedFloor + "'"
            };
        }
        // Get all the aparments polygon features to use for dimensioning
        const apartmentFeatures = (await apartmentsLayer.queryFeatures()).features;
        // Function to show the dimensions on a specific floor
        function showDimensionsFloor(selectedFloor) {
            programmaticDimensionLayer.source.dimensions.removeAll();
            const polygonsForDimensioning = apartmentFeatures.filter((item) => {
                return item.attributes.Level_ === selectedFloor;
            });
            showElevationDimensions(polygonsForDimensioning[0]);
            polygonsForDimensioning.forEach((polygon) => {
                showEdgeDimensions(polygon);
            });
        }
        const groundPoint = {
            spatialReference: {
                latestWkid: 3857,
                wkid: 102100
            },
            x: 568631.997756,
            y: 6816415.661521,
            z: 3.526520
        };
        function createDimension(input) {
            const dimension = new LengthDimension({
                orientation: input.orientation,
                startPoint: input.startPoint,
                endPoint: input.endPoint,
                offset: 4
            });
            return dimension;
        }
        // Function to show the dimensioning on the elevation
        function showElevationDimensions(feature) {
            programmaticDimensionLayer.source.dimensions.push(createDimension({
                orientation: -30,
                startPoint: groundPoint,
                endPoint: {
                    spatialReference: {
                        wkid: 102100
                    },
                    x: groundPoint.x,
                    y: groundPoint.y,
                    z: feature.attributes["Elevation"] + feature.attributes["FloorHeight"]
                }
            }));
        }
        // Function to show the dimensioning of the polygon edges
        function showEdgeDimensions(feature) {
            const rings = feature.geometry.rings[0];
            for (let i = 0; i < rings.length - 1; i++) {
                // only show the dimensions on 2 sides of the polygon
                if (feature.attributes.Level_ > 14) {
                    if (i < 2 || i > 3) {
                        continue;
                    }
                } else if (feature.attributes["Level_"] > 8) {
                    if (i < 4 || i > 5) {
                        continue;
                    }
                } else {
                    if (i < 3 || i > 4) {
                        continue;
                    }
                }
                programmaticDimensionLayer.source.dimensions.push(createDimension({
                    orientation: -90,
                    startPoint: {
                        spatialReference: {
                            wkid: 102100
                        },
                        x: rings[i][0],
                        y: rings[i][1],
                        z: feature.attributes["Elevation"] + feature.attributes["FloorHeight"]
                    },
                    endPoint: {
                        spatialReference: {
                            wkid: 102100
                        },
                        x: rings[i + 1][0],
                        y: rings[i + 1][1],
                        z: feature.attributes["Elevation"] + feature.attributes["FloorHeight"]
                    }
                }));
            }
        }
        // Show the dimnsioning on floor 24
        showDimensionsFloor(24);

        // UI: Floor Slider
        const floorSlider = new Slider({
            container: "floorSlider",
            min: 1,
            max: 24,
            values: [24],
            steps: 1,
            layout: "vertical",
            visibleElements: {
                rangeLabels: false,
                labels: true
            }
        });
        floorSlider.on("thumb-drag", (event) => {
            const selectedFloor = event.value;
            showDimensionsFloor(selectedFloor);
            filterByFloorNr(selectedFloor);
        });

        // UI: Start interactive dimensioning
        const dimensioningStartBtn = document.getElementById("dimensioningStartBtn");
        const onComplete = () => {
            interactiveDimensionLayerView.interactive = false;
            dimensioningStartBtn.appearance = "solid";
            dimensioningStartBtn.innerHTML = "Add your own";
           console.log(interactiveDimensionLayerView);
        };
        dimensioningStartBtn.addEventListener("click", () => {
            if (!interactiveDimensionLayerView.interactive) {
                interactiveDimensionLayerView.createLengthDimensions().then(onComplete, onComplete);
                dimensioningStartBtn.appearance = "outline";
                dimensioningStartBtn.innerHTML = "Cancel"
            }
            else {
                onComplete();
            }
        });
        view.ui.add("dimensioningDiv", "top-right");

        // UI: LayerList
        const layerList = new LayerList({
            view: view
        });
        const layerListExpand = new Expand({
            view: view,
            content: layerList,
        });
        view.ui.add(layerListExpand, "bottom-right");
    });
});