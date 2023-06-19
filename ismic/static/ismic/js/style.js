document.addEventListener('DOMContentLoaded', () => {
    const change = document.getElementById('change');
    const arrow = document.getElementById('arrow');
    if(parseFloat(change.innerHTML) <= 0) {
        change.style.color = 'red';
        arrow.innerHTML = '<ion-icon id="down" name="arrow-down-circle-outline"></ion-icon>'
    } else {
        change.style.color = 'green';
        arrow.innerHTML = '<ion-icon id="up" name="arrow-up-circle-outline"></ion-icon>'
    }
});