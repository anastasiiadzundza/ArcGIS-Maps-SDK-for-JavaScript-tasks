require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/BaseDynamicLayer",
    "esri/widgets/LayerList",
    "esri/core/reactiveUtils"
], (Map, MapView, BaseDynamicLayer, LayerList, reactiveUtils) => {
    // *******************************************************
    // Create a subclass of BaseDynamicLayer
    // *******************************************************
    const CustomWMSLayer = BaseDynamicLayer.createSubclass({
        properties: {
            mapUrl: null,
            mapParameters: null
        },

        // Override the getImageUrl() method to generate URL
        // to an image for a given extent, width, and height.
        getImageUrl: function (extent, width, height){
            const urlVariables = this._prepareQuery(this.mapParameters, extent, width, height);
            const queryString = this._joinUrlVariables(urlVariables);
            return this.mapUrl + "?" + queryString;
        },

        // Prepare query parameters for the URL to an image to be generated
        _prepareQuery: function (queryParameters, extent, width, height) {
            const wkid = extent.spatialReference.isWebMercator ? 3857 : extent.spatialReference.wkid;
            const replacers = {
                width: width,
                height: height,
                wkid: wkid,
                xmin: extent.xmin,
                xmax: extent.xmax,
                ymin: extent.ymin,
                ymax: extent.ymax
            };

            const urlVariables = this._replace({}, queryParameters, replacers);
            return urlVariables;
        },

        // replace the url variables with the application provided values
        _replace: (urlVariables, queryParameters, replacers) => {
            Object.keys(queryParameters).forEach((key) => {
                urlVariables[key] = Object.keys(replacers).reduce((previous, replacerKey) => {
                    return previous.replace("{" + replacerKey + "}", replacers[replacerKey]);
                }, queryParameters[key]);
            });

            return urlVariables;
        },

        // join the url parameters
        _joinUrlVariables: (urlVariables) => {
            return Object.keys(urlVariables).reduce((previous, key) => {
                return previous + (previous ? "&" : "") + key + "=" + urlVariables[key];
            }, "");
        }
    });
    // *******************************************************
    // end of custom dynamic layer
    // *******************************************************

    // create the custom WMS layer with
    // url parameters
    const wmsLayer = new CustomWMSLayer({
        mapUrl: "https://geobretagne.fr/geoserver/cadastre/ows",
        mapParameters: {
            SERVICE: "WMS",
            REQUEST: "GetMap",
            FORMAT: "image/png",
            TRANSPARENT: "TRUE",
            STYLES: "",
            VERSION: "1.3.0",
            LAYERS: "CP.CadastralParcel",
            WIDTH: "{width}",
            HEIGHT: "{height}",
            CRS: "EPSG:{wkid}",
            BBOX: "{xmin},{ymin},{xmax},{ymax}"
        },

        minScale: 20000,
        maxScale: 5000,
        title: "Cadastral Parcel",
    });
    reactiveUtils.when(() => wmsLayer.loaded, () => {
        console.log('loaded')
    })

    // effect will be applied to the layer at all scales
    wmsLayer.effect ="drop-shadow(2px, 2px, 3px)"; // bloom, blur, brightness, contrast, drop-shadow, grayscale, hue-rotate, invert, opacity, saturate and sepia
    // wmsLayer.effect ="blur(10px)";
    // wmsLayer.effect ="brightness(20%)";

    // create a new instance of a map
    // add the wms layer to the map

    const map = new Map({
        basemap: "topo-vector",
        layers: [wmsLayer]
    });

    // create a new instance of the view
    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-4.487534, 48.388673],
        zoom: 16
    });

    // create a new layer list
    const layerList = new LayerList({
        view: view
    });
    view.ui.add(layerList, "top-right");
});