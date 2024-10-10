require([
    "esri/Map",
    "esri/layers/FeatureLayer",
    "esri/widgets/Editor",
    "esri/views/MapView",
    "esri/popup/content/AttachmentsContent",
    "esri/popup/content/TextContent",
    "esri/widgets/Expand",
    "esri/core/reactiveUtils"
], (Map, FeatureLayer, Editor, MapView, AttachmentsContent, TextContent, Expand, reactiveUtils) => {
    // Create the Map
    const map = new Map({
        basemap: "topo-vector"
    });
    let editor, features;
    /*************************************************************
     * The PopupTemplate content is the text that appears inside the
     * popup. Bracketed {fieldName} can be used to reference the value
     * of an attribute of the selected feature. HTML elements can be
     * used to provide structure and styles within the content.
     **************************************************************/
    const editThisAction = {
        title: "Edit feature",
        id: "edit-this",
        className: "esri-icon-edit"
    };

    // Create a popupTemplate for the featurelayer and pass in a function to set its content and specify an action to handle editing the selected feature
    const template = {
        title: "Trail name: {trailName}",
        content: difficultyLevel,
        fieldInfos: [
            {
                fieldName: "trailName"
            },
            {
                fieldName: "difficulty"
            }
        ],
        actions: [editThisAction]
    };

    // Function that creates two popup elements for the template: attachments and text
    function difficultyLevel(feature) {
        // 1. Set how the attachments should display within the popup
        const attachmentsElement = new AttachmentsContent({
            displayType: "list"
        });

        const textElement = new TextContent();

        const level = feature.graphic.attributes.difficulty;
        const green = "<b><span style='color:green'>" + level + "</span></b>.";
        const purple = "<b><span style='color:purple'>" + level + "</span></b>.";
        const red = "<b><span style='color:red'>" + level + "</span></b>.";

        // If the feature's "difficulty" attribute is a specific value, set it a certain color
        // "easy" = green
        // "medium" = purple
        // "hard" = red
        switch (level) {
            case "easy":
                textElement.text = "The {trailName} trail has a difficulty level of " + green;
                return [textElement, attachmentsElement];
                break;
            case "medium":
                textElement.text = "The {trailName} trail has a difficulty level of " + purple;
                return [textElement, attachmentsElement];
                break;
            case "hard":
                textElement.text = "The {trailName} trail has a difficulty level of " + red;
                return [textElement, attachmentsElement];
        }
    }

    const featureLayer = new FeatureLayer({
        url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/El_Paso_Recreation_AttributeEditsOnly/FeatureServer/1",
        outFields: ["*"],
        popupTemplate: template
    });
    map.add(featureLayer);

    // Create the MapView
    const view = new MapView({
        container: "viewDiv",
        map: map,
        zoom: 15,
        center: [-106.49, 31.8]
    });

    view.when(() => {
        // Create the Editor with the specified layer and a list of field configurations
        editor = new Editor({
            view: view,
            // Hide the snapping controls as it is not needed for this specific workflow
            visibleElements: { snappingControls: false },
            container: document.createElement("div"),
            layerInfos: [
                {
                    layer: featureLayer,
                    formTemplate: {
                        // autocasts to FormTemplate
                        elements: [
                            // autocasts to FieldElement
                            {
                                type: "field",
                                fieldName: "trailName",
                                label: "Trail name",
                                editableExpression: false
                            },
                            {
                                type: "field",
                                fieldName: "condition",
                                label: "Condition",
                                hint: "The overall condition for running/biking?"
                            },
                            {
                                type: "field",
                                fieldName: "difficulty",
                                label: "Difficulty",
                                hint: "How difficult was this trail to run/bike?"
                            },
                            {
                                type: "field",
                                fieldName: "trckType",
                                label: "Track type",
                                hint: "Running or biking?"
                            },
                            {
                                type: "field",
                                fieldName: "notes",
                                label: "Additional comments"
                            }
                        ]
                    }
                }
            ]
        });

        // Execute each time the "Edit feature" action is clicked
        function editThis() {
            // If the Editor's activeWorkflow is null, make the popup not visible
            if (!editor.activeWorkFlow) {
                view.popup.visible = false;
                // Call the Editor update feature edit workflow

                editor.startUpdateWorkflowAtFeatureEdit(view.popup.selectedFeature);
                view.ui.add(editor, "top-right");
            }

            // Remove the editor widget from the display when the state of the editor's viewModel is "ready" and re-add the popup. Ready state indicates that the initial editor panel displays and is ready for editing.

            // The editor displays a panel to select a feature to update if the user "backs" out of the current edit workflow. This is not needed in this specific workflow as the feature is already selected from the popup. The "ready" state indicates that this initial editor panel is active and was activated via the "back" button. In this example, we remove the editor from the view and replace it with the popup.

            reactiveUtils.when(
                () => editor.viewModel.state === "ready",
                () => {
                    // Remove the editor and open the popup again
                    view.ui.remove(editor);
                    view.openPopup({
                        fetchFeatures: true,
                        shouldFocus: true
                    });
                }
            );
        }

        // Event handler that fires each time an action is clicked
        reactiveUtils.on(
            () => view.popup,
            "trigger-action",
            (event) => {
                if (event.action.id === "edit-this") {
                    editThis();
                }
            }
        );
    });

    // Watch when the popup is visible
    reactiveUtils.watch(
        () => view.popup?.visible,
        (event) => {
            console.log(view)
            // Check the Editor's viewModel state, if it is currently open and editing existing features, disable popups
            if (editor.viewModel.state === "editing-existing-feature") {
                view.closePopup();
            } else {
                // Grab the features of the popup
                features = view.popup.features;
            }
        }
    );

    featureLayer.on("apply-edits", () => {
        // Once edits are applied to the layer, remove the Editor from the UI
        view.ui.remove(editor);

        // Iterate through the features
        features.forEach((feature) => {
            // Reset the template for the feature if it was edited
            feature.popupTemplate = template;
        });

        // Open the popup again and reset its content after updates were made on the feature
        if (features) {
            view.openPopup({
                features: features
            });
        }

        // Cancel the workflow so that once edits are applied, a new popup can be displayed
        editor.viewModel.cancelWorkflow();
    });

    const expandInfo = new Expand({
        expandTooltip: "Open for info",
        collapseTooltip: "Close info",
        expanded: true,
        view: view,
        content: document.getElementById("info")
    });

    view.ui.add(expandInfo, {
        position: "top-left",
        index: 1
    });
});