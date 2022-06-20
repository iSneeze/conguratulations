
function initModal() {
    // Get the modal
    var modal = document.getElementById("modal");

    // Get the image and insert it inside the modal - use its "alt" text as a caption
    var img = document.getElementsByClassName("modalImg");
    var modalImg = document.getElementById("imgModal");
    var captionText = document.getElementById("caption");

    if (img.length == 0) {
        setTimeout(() => {
            initModal();
        }, 1000);
    }

    for (let i = 0; i < img.length; i++) {
        const element = img[i];
        element.onclick = function () {
            modal.style.display = "block";
            modalImg.src = this.src;
            captionText.innerHTML = this.alt;
        }
    }

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }
}

initModal();


