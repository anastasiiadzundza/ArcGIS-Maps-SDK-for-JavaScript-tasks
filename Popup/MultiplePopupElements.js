require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/Color",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/core/reactiveUtils"
], (Map, MapView, FeatureLayer, Color, Legend, Expand, reactiveUtils) => {
    // setup the map
    const map = new Map({
        basemap: "topo-vector"
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-102.95646, 38.4961],
        zoom: 4,
        constraints: {
            minScale: 30000000,
            maxScale: 2000001
        },
        // Since there are many elements, it is best to dock the popup so
        // the elements display all at once rather than have to scroll through them all.
        popup: {
            dockEnabled: true,
            dockOptions: {
                buttonEnabled: false,
                breakpoint: {
                    width: 1200,
                    height: 900
                }
            },
            // visibleElements: {
            //     closeButton: false,
            //     featureNavigation: false,
            // },
        }
    });
    // Add the Legend widget to better visualize the data.
    view.ui.add(new Expand({content: new Legend({view}), view}), "top-left");

    const featureLayer = new FeatureLayer({
        portalItem: {
            id: "59b201fc69a24fe69cda4fd47490d553"
        },
        outFields: ["*"],
        popupTemplate: {
            // autocasts as new PopupTemplate()
            title: "{NAME} in {State}",
            outFields: ["*"],
            // Set the fieldInfos at the PopupTemplate level so all the
            // popup elements have the desired field formatting.
            fieldInfos: [
                {
                    fieldName: "B19049_001E",
                    visible: true,
                    label: "Median Household Income",
                    format: {
                        places: 2,
                        digitSeparator: true
                    }
                },
                {
                    fieldName: "B19049_001M",
                    label: "Median Household Income - Margin of error",
                    visible: true,
                    format: {
                        places: 2,
                        digitSeparator: true
                    }
                },
                {
                    fieldName: "B19049_002E",
                    label: "Householder under 25 years",
                    visible: true,
                    format: {
                        digitSeparator: true
                    }
                },
                {
                    fieldName: "B19049_003E",
                    label: "Householder 25 to 44 years",
                    visible: true,
                    format: {
                        digitSeparator: true
                    }
                },
                {
                    fieldName: "B19049_004E",
                    label: "Householder 45 to 64 years",
                    visible: true,
                    format: {
                        digitSeparator: true
                    }
                },
                {
                    fieldName: "B19049_005E",
                    label: "Householder 65 years and over",
                    visible: true,
                    format: {
                        digitSeparator: true
                    }
                },
                {
                    fieldName: "B19053_calc_pctSelfempE",
                    label: "Percentage of households with any self employment-income"
                },
                {
                    fieldName: "B19053_002E",
                    label: "Households with any self employment-income",
                    visible: true
                },
                {
                    fieldName: "B19053_003E",
                    label: "Households with no self employment-income",
                    visible: true
                },
                {
                    fieldName: "ALAND",
                    label: "Land area (square meters)",
                    format: {
                        digitSeparator: true
                    }
                }
            ],
            // Set content elements in the order to display.
            // The first element displayed is fields.
            content: [

                {
                    // Displays a table of fields configured in the fieldInfos.
                    // If no fieldInfos is specifically set in the content,
                    // it defaults to whatever may be set within the popupTemplate.
                    type: "fields" // Autocasts to FieldsContent
                },


                {
                    // A descriptive text element. This element uses an attribute
                    // from the feature layer which displays a
                    // sentence giving the median household income of the area.
                    // Text elements can only be set within the content and HTML formatting is supported.
                    type: "text", // Autocasts to TextContent
                    text: "The median household income in this area is estimated to be <b>${B19049_001E}</b> (±${B19049_001M})."
                },


                {
                    // A media element. This can be either an image or a chart.
                    // You specify these within the mediaInfos. The following creates bar
                    // and pie chart along with an image.
                    // Similar to text elements, media can only be set within the content.
                    type: "media", // Autocasts to MediaContent
                    title: "Median income details for {Name}",
                    mediaInfos: [
                        // Column chart that uses custom chart colors to represent specified fields.
                        {
                            title: "<b>Income by householder age</b>",
                            type: "column-chart",
                            caption: "Median household income by householder age.",
                            value: {
                                fields: ["B19049_002E", "B19049_003E", "B19049_004E", "B19049_005E"],
                                // Set the colors array to various shades of green since the chart represents income.
                                colors: [new Color("#598c58"), new Color("#dde8b2"), new Color("#637349"), new Color("#becc97")]
                            }
                        },
                        // Pie chart that uses the default chart colors to represent specified fields.
                        {
                            title: "<b>Self employment income</b>",
                            type: "pie-chart",
                            caption: "Households with or without self employment-income.",
                            value: {
                                fields: ["B19053_002E", "B19053_003E"]
                            }
                        },
                        // Image from the US Census website regarding the national social and economic well-being.
                        {
                            type: "image",
                            caption: "Image showing data measuring the nation's social and economic well-being.",
                            value: {
                                sourceURL:
                                    "https://www.census.gov/library/visualizations/2023/comm/well-being/_jcr_content/root/responsivegrid/embeddableimage.coreimg.jpeg/1694484822013/measuring-social-economic-well-being.jpeg"
                            }
                        }
                    ]
                }

            ]
        }
    });

    // Defines an action to zoom out from the selected feature
    let zoomOutAction = {
        // This text is displayed as a tooltip
        title: "Zoom out",
        // The ID by which to reference the action in the event handler
        id: "zoom-out",
        // Sets the icon font used to style the action button
        className: "esri-icon-zoom-out-magnifying-glass"
    };
    // Adds the custom action to the PopupTemplate.
    featureLayer.popupTemplate.actions = [zoomOutAction];

    // This action will only appear in the popup for features in that layer

    // The function to execute when the zoom-out action is clicked
        function zoomOut() {
            // In this case the view zooms out two LODs on each click
            view.goTo({
                center: view.center,
                zoom: view.zoom - 2
            });
        }

    // This event fires for each click on any action
    // Notice this event is handled on the default popup of the View
    // NOT on an instance of PopupTemplate

    reactiveUtils.on(
        () => view.popup.viewModel,
        "trigger-action",
        (event) => {
            if (event.action.id === "zoom-out") {
                zoomOut();
            }
        });
    map.add(featureLayer);
});