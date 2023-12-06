export function getImagePath(imageName) {
    let scriptSrc = import.meta.url;     // Get current script path
    let dirUrl = new URL(scriptSrc);                // Convert to URL object
    dirUrl = new URL('..', dirUrl);                 // Go up a directory
    let imagePath = dirUrl + "images/" + imageName; // Set image path
    console.log(imagePath);
    return imagePath;                               // Return image path
}