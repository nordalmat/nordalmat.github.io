window.onload = () => {
    let alert = document.querySelector('.toast');
    let bsAlert = new bootstrap.Toast(alert);
    bsAlert.show()
};