// Function to fetch toggleAnimation route
function toggleAnimation() {
  fetch('/toggleAnimation')
    .then(response => response.text())
    .then(message => console.log(message))
    .catch(err => console.error('Error toggling animation:', err));
}
