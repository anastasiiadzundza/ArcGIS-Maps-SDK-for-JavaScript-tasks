require(["esri/views/SceneView", "esri/widgets/LayerList", "esri/WebScene", "esri/widgets/BasemapGallery"],
    (
        SceneView,
        LayerList,
        WebScene,
        BasemapGallery,
    ) => {

        //
        // const basemap = new Basemap({
        //     portalItem: {
        //         id: "8dda0e7b5e2d4fafa80132d59122268c"  // WGS84 Streets Vector webmap
        //     },
        // });

        const scene = new WebScene({
            portalItem: {
                // autocasts as new PortalItem()
                id: "adfad6ee6c6043238ea64e121bb6429a"
            },
            // baseMap: basemap,
        });


        const view = new SceneView({
            container: "viewDiv",
            map: scene
        });



        const baseMap = new BasemapGallery({
            view,
        });

        view.when(() => {
            console.log(view);
            // Add widget to the top right corner of the view
            view.ui.add(baseMap, "top-right");

        });
    });