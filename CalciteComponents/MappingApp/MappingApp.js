require([
    "esri/WebMap",
    "esri/views/MapView",
    "esri/widgets/Bookmarks",
    "esri/widgets/BasemapGallery",
    "esri/widgets/LayerList",
    "esri/widgets/Legend",
    "esri/widgets/Print", "esri/config", "esri/intl"
], function(WebMap, MapView, Bookmarks, BasemapGallery, LayerList, Legend, Print, esriConfig, intl) {
    // intl.setLocale("fr");

    // esriConfig.locale = "fr-FR";
    // const webmapId = new URLSearchParams(window.location.search).get("webmap") ?? "210c5b77056846808c7a5ce93920be81";

    const arcgisMap = document.querySelector("arcgis-map");
    // const map = new WebMap({
    //     portalItem: {
    //         id: webmapId
    //     }
    // });

    arcgisMap.addEventListener("arcgisViewReadyChange", (event) => {
        console.log(event)
        const {view, map} = event.target;


        // const view = new MapView({
        //     map,
        //     container: "viewDiv",
        //     padding: {
        //         left: 45
        //     }
        // });

        view.ui.move("zoom", "top-left");

        const basemaps = new BasemapGallery({
            view,
            container: "basemaps-container"
        });

        const bookmarks = new Bookmarks({
            view,
            container: "bookmarks-container"
        });

        const layerList = new LayerList({
            view,
            dragEnabled: true,
            visibilityAppearance: "checkbox",
            container: "layers-container"
        });
        //
        // const legend = new Legend({
        //     view,
        //     container: "legend-container"
        // });

        const print = new Print({
            view,
            container: "print-container"
        });
        map.when(() => {
            const { title, description, thumbnailUrl, avgRating } = map.portalItem;
            document.querySelector("#header-title").heading = title;
            document.querySelector("#item-description").innerHTML = description;
            document.querySelector("#item-thumbnail").src = thumbnailUrl;
            document.querySelector("#item-rating").value = avgRating;

            let activeWidget;

            const handleActionBarClick = ({ target }) => {
                if (target.tagName !== "CALCITE-ACTION") {
                    return;
                }

                if (activeWidget) {
                    document.querySelector(`[data-action-id=${activeWidget}]`).active = false;
                    document.querySelector(`[data-panel-id=${activeWidget}]`).hidden = true;
                }

                const nextWidget = target.dataset.actionId;
                if (nextWidget !== activeWidget) {
                    document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
                    document.querySelector(`[data-panel-id=${nextWidget}]`).hidden = false;
                    activeWidget = nextWidget;
                } else {
                    activeWidget = null;
                }
            };

            document.querySelector("calcite-action-bar").addEventListener("click", handleActionBarClick);

            let actionBarExpanded = false;

            document.addEventListener("calciteActionBarToggle", event => {
                actionBarExpanded = !actionBarExpanded;
                view.padding = {
                    left: actionBarExpanded ? 150 : 45
                };
            });
            //
            // document.querySelector("calcite-shell").hidden = false;
            // document.querySelector("calcite-loader").hidden = true;

            const updateDarkMode = () => {
                // Calcite mode
                document.body.classList.toggle("calcite-mode-dark");
                // ArcGIS Maps SDK theme
                const dark = document.querySelector("#arcgis-maps-sdk-theme-dark");
                const light = document.querySelector("#arcgis-maps-sdk-theme-light");
                dark.disabled = !dark.disabled;
                light.disabled = !light.disabled;
                // ArcGIS Maps SDK basemap
                map.basemap = dark.disabled ? "gray-vector" : "dark-gray-vector";
                // Toggle ArcGIS Maps SDK widgets mode
                const widgets = document.getElementsByClassName("esri-ui");
                for (let i = 0; i < widgets.length; i++) {
                    widgets.item(i).classList.toggle("calcite-mode-dark");
                }
            };

            document.querySelector("calcite-switch").addEventListener("calciteSwitchChange", updateDarkMode);

        });
    });




});