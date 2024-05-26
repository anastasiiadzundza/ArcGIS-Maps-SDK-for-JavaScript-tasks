require([
    "esri/WebScene",
    "esri/views/SceneView",
    "esri/layers/BuildingSceneLayer",
    "esri/widgets/Slice",
    "esri/analysis/SlicePlane",
    "esri/widgets/LayerList",
    "esri/core/Collection",
    "esri/core/reactiveUtils"
], (WebScene, SceneView, BuildingSceneLayer, Slice, SlicePlane, LayerList, Collection, reactiveUtils) => {
    // Load webscene and display it in a SceneView
    const webscene = new WebScene({
        portalItem: {
            id: "c7470b0e4e4c44288cf287d658155300"
        }
    });

    const view = new SceneView({
        container: "viewDiv",
        map: webscene
    });

    // Create the BuildingSceneLayer and add it to the webscene
    const buildingLayer = new BuildingSceneLayer({
        url: "https://tiles.arcgis.com/tiles/V6ZHFr6zdgNZuVG0/arcgis/rest/services/BSL__4326__US_Redlands__EsriAdminBldg_PublicDemo/SceneServer",
        title: "Administration Building, Redlands - Building Scene Layer"
    });
    webscene.layers.add(buildingLayer);

    const excludedLayers = [];
    // const sliceButton = document.getElementById("slice");
    const resetPlaneBtn = document.getElementById("resetPlaneBtn");
    const clearPlaneBtn = document.getElementById("clearPlaneBtn");
    // const sliceOptions = document.getElementById("sliceOptions");
    const plane = new SlicePlane({
        position: {
            latitude: 34.0600460070941,
            longitude: -117.18669237418565,
            z: 417.75
        },
        tilt: 32.62,
        width: 29,
        height: 29,
        heading: 0.46
    });
    let sliceWidget = null;
    let doorsLayer = null;
    let sliceTiltEnabled = true;

    view.ui.add("menu", "top-right");

    console.log(buildingLayer);
    buildingLayer.when(() => {
        // Iterate through the flat array of sublayers and extract the ones
        // that should be excluded from the slice widget
        buildingLayer.allSublayers.forEach((layer) => { // building components and groups
            // modelName is standard accross all BuildingSceneLayer,
            // use it to identify a certain layer
            switch (layer.modelName) {
                // Because of performance reasons, the Full Model view is
                // by default set to false. In this scene the Full Model should be visible.
                case "FullModel":
                    layer.visible = true;
                    break;
                case "Overview":
                case "Rooms":
                    layer.visible = true;
                    break;
                // Extract the layers that should not be hidden by the slice widget
                case "Doors":
                    doorsLayer = layer;
                    excludedLayers.push(layer);
                    break;
                default:
                    layer.visible = true;
            }
        });

        setSliceWidget();
    });

    function setSliceWidget() {
        sliceWidget = new Slice({
            view: view,
            container: "sliceContainer"
        });
        sliceWidget.viewModel.excludedLayers.addMany(excludedLayers);
        sliceTiltEnabled = true;
        sliceWidget.viewModel.tiltEnabled = sliceTiltEnabled;
        sliceWidget.viewModel.shape = plane;
        reactiveUtils.watch(
            () => sliceWidget.viewModel.state,
            (state) => {
                if (state === "ready") {
                    clearPlaneBtn.style.display = "none";
                } else {
                    clearPlaneBtn.style.display = "inherit";
                }
            }
        );
    }

    resetPlaneBtn.addEventListener("click", () => {
        document.getElementById("tiltEnabled").checked = true;
        sliceTiltEnabled = true;
        sliceWidget.viewModel.tiltEnabled = sliceTiltEnabled;
        sliceWidget.viewModel.shape = plane;
    });

    clearPlaneBtn.addEventListener("click", () => {
        sliceWidget.viewModel.clear();
    });

    document.getElementById("tiltEnabled").addEventListener("change", (event) => {
        sliceTiltEnabled = event.target.checked;
        sliceWidget.viewModel.tiltEnabled = sliceTiltEnabled;
    });

    document.getElementById("color").addEventListener("change", (event) => {
        if (event.target.checked) {
            // A renderer can be set on a BuildingComponentSublayer
            doorsLayer.renderer = {
                type: "simple", // autocasts as new SimpleRenderer()
                symbol: {
                    type: "mesh-3d", // autocasts as new MeshSymbol3D()
                    symbolLayers: [
                        {
                            type: "fill", // autocasts as new FillSymbol3DLayer()
                            material: {
                                color: "red"
                            }
                        }
                    ]
                }
            };
        } else {
            doorsLayer.renderer = null;
        }
    });

    // Add a layer list widget
    const layerList = new LayerList({
        view: view
    });
    view.ui.empty("top-left");
    view.ui.add(layerList, "top-left");
});