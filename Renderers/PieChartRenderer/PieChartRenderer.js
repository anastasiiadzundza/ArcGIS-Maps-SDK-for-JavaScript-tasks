require(["esri/views/MapView", "esri/WebMap", "esri/layers/FeatureLayer", "esri/core/reactiveUtils", "esri/renderers/ClassBreaksRenderer", "esri/widgets/Legend"],
    (MapView, WebMap, FeatureLayer, reactiveUtils, ClassBreaksRenderer, Legend) => {
        /************************************************************
         * Creates a new WebMap instance. A WebMap must reference
         * a PortalItem ID that represents a WebMap saved to
         * arcgis.com or an on-premise portal.
         *
         * To load a WebMap from an on-premise portal, set the portal
         * url with esriConfig.portalUrl.
         ************************************************************/
        const webmap = new WebMap({
            portalItem: {
                // autocasts as new PortalItem()
                id: "f2e9b762544945f390ca4ac3671cfa72"
            }
        });

        /************************************************************
         * Set the WebMap instance to the map property in a MapView.
         ************************************************************/
        const view = new MapView({
            map: webmap,
            container: "viewDiv"
        });

        const featureLayer = new FeatureLayer({
            url: "https://services6.arcgis.com/sou6t7Iycrrc14MR/arcgis/rest/services/Toronto_Neighbourhoods_Demographic___MH/FeatureServer/0"
        });
        webmap.add(featureLayer);

        const legend = new Legend({
            view: view
        });

        view.ui.add(legend, "bottom-left");





        featureLayer.renderer = {
            type: "pie-chart",  // autocasts as new DotDensityRenderer()

            attributes: [{
                field: "A21TNOWN",
                label: "2021 Owner (Census)",
                color: "red"
            },{
                field: "A21TNRENT",
                label: "2021 Renter (Census)",
                color: "blue"
            }, {
                field: "ECYPTAPOP",
                label: "2023 Total Population",
                color: "green"
            }],
        }
    });