function nextStep(step) {
    document.getElementById('step' + step).classList.remove('active');
    document.getElementById('step' + (step + 1)).classList.add('active');
}

function prevStep(step) {
    document.getElementById('step' + step).classList.remove('active');
    document.getElementById('step' + (step - 1)).classList.add('active');
}