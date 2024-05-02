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
        console.log(view)

        view.ui.add(legend, "bottom-left");

        view.when(() => {
            view.map.layers.items[1].renderer.visualVariables = [{
                type: "color",
                field: "Deaths",
                stops: [
                    {value: 10000, color: '#d19d9f', label: "< 10000"},
                    {value: 12000, color: '#d17175', label: "12000"},
                    {value: 17000, color: '#c94046', label: "17000"},
                    {value: 25000, color: '#cb2027', label: "25000"},
                    {value: 30000, color: '#7a0003', label: "30000"},
                    {value: 100000, color: '#0e0101', label: "> 100000"}
                ],
            }];
        });

         const fillSymbol1 = {
            type: "simple-fill",
            color: "#FDEDDF",
            style: "solid",
            outline: {
                width: 1,
                color: "#de710b"
            }
        };
        const fillSymbol2 = {
            type: "simple-fill",
            color: "#f6c9a6",
            style: "solid",
            outline: {
                width: 1,
                color: "#de710b"
            }
        };
        const fillSymbol3 = {
            type: "simple-fill",
            color: "#faad70",
            style: "solid",
            outline: {
                width: 1,
                color: "#de710b"
            }
        };
        const fillSymbol4 = {
            type: "simple-fill",
            color: "#f38c44",
            style: "solid",
            outline: {
                width: 1,
                color: "#de710b"
            }
        };

        const classBreakInfos = [
            {maxValue: 30, minValue: 0, symbol:fillSymbol1, label: '< 30'},
            {maxValue: 60, minValue: 31, symbol:fillSymbol2, label: '31 - 60'},
            {maxValue: 100, minValue: 61, symbol:fillSymbol3, label: '61 - 100'},
            {maxValue: 180, minValue: 101, symbol:fillSymbol4, label: '61 - 100'},
        ];


        const classBreaksRenderer = new ClassBreaksRenderer({
            field: "AREA_LO6",
            classBreakInfos,
        });

        const pieChart ={
            type: "pie-chart",  // autocasts as new DotDensityRenderer()

            attributes: [{
                field: "A21TNOWN",
                label: "2021 Owner (Census)",
                color: "red"
            }, {
                field: "A21TNRENT",
                label: "2021 Renter (Census)",
                color: "blue"
            }, {
                field: "ECYPTAPOP",
                label: "2023 Total Population",
                color: "green"
            }],
            visualVariables: [{
                type: "size",
                field: "A21TNRENT",
                stops: [
                    {value: 1000, size: 7, label: "< 1000"},
                    {value: 2000, size: 15, label: "  2000"},
                    {value: 4000, size: 30, label: "> 4000"}
                ],
            }],
        }


        view?.watch('scale', (newValue) => {
            featureLayer.renderer =
                newValue <= 200000
                    ? pieChart
                    : classBreaksRenderer;
        });
    });