// Get a reference to the map component
const arcgisMap = document.querySelector("arcgis-map");
console.log(arcgisMap);
const outputMessages
    = document.getElementById("outputMessages");

// Listen for when the view first loads
arcgisMap.addEventListener("arcgisViewReadyChange", (event) => {
    const {zoom} = event.target;
    let message = `<br><span>arcgisViewReadyChange:</span> initial zoom is ${zoom}`;
    displayMessage(message);

    const {portalItem} = event.target.map;
    message = `<br><span>arcgisViewReadyChange:</span> WebMap title is ${portalItem?.title}`;
    displayMessage(message);
});

// Listen for property changes on the view after it has been loaded.
arcgisMap.addEventListener("arcgisViewChange", async (event) => {
    const {zoom, basemap} = event.target;
    console.log(event)
    const message = `<br><span>arcgisViewChange:</span>
        zoom has changed to ${zoom} and basemap is ${basemap?.title}`;
    displayMessage(message);
});

arcgisMap.addEventListener("arcgisViewClick", async (event) => {
    console.log(event);// event.detail.mapPoint.latitude longitude
    const message = `<br><span>arcgisViewClick:</span>
       latitude: ${event.detail.mapPoint.latitude} longitude: ${event.detail.mapPoint.longitude}`;
    displayMessage(message);
});

/**
 * The mutation observer is useful for observing map **attributes** that
 * are reflected on a DOM element.
 * For example, when you zoom in and out on the map,
 * the mutation observer will report changes to the zoom property.
 * Objects and arrays can't be watched with a mutation observer.
 *
 * More information: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
 */
const observer = new MutationObserver((mutations, observer) => {
    console.log(mutations)
    for (let mutation of mutations) {
        const message = `<br><span>MutationObserver:</span> ${mutation.attributeName} has changed to
          ${mutation.target[mutation.attributeName]}`;
        displayMessage(message);
    }
});

// Start observing the map's attributes
observer.observe(arcgisMap, {
    attributeFilter: ["updating", "suspended"],
});

const displayMessage = (info) => {
    outputMessages.innerHTML += info;
    outputMessages.scrollTop = outputMessages.scrollHeight;
}