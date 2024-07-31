require(["esri/views/SceneView", "esri/widgets/LayerList", "esri/WebScene"],
    (
        SceneView,
        LayerList,
        WebScene
    ) => {

        const scene = new WebScene({
            portalItem: {
                // autocasts as new PortalItem()
                id: "adfad6ee6c6043238ea64e121bb6429a"
            },
        });


        const view = new SceneView({
            container: "viewDiv",
            map: scene
        });

        view.when(() => {
            const layerList = new LayerList({
                view: view,
                dragEnabled: true,
                container: document.getElementById("layerList"),
                listItemCreatedFunction: (event) => {
                    console.log(event)

                    event.item.actionsSections = [
                        [
                            {
                                title: "Increase opacity",
                                icon: "chevron-up",
                                id: "increase-opacity"
                            },
                        ],
                    ];
                }

            });

            console.log(view);
            // Add widget to the top right corner of the view
            view.ui.add(layerList, "top-right");


            layerList.on("trigger-action", (event) => {

                // Capture the action id.
                const id = event.action.id;

                if (id === "increase-opacity") {
                    console.log('increase-opacity')

                }
            });
        });
    });