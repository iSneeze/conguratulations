
function initModal() {
    // Get the modal
    var modal = document.getElementById("modal");

    // Get the image and insert it inside the modal - use its "alt" text as a caption
    var img = document.getElementsByClassName("modalImg");
    var modalImg = document.getElementById("imgModal");
    var captionText = document.getElementById("caption");

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

//canvasConfetti = createCanvas("confetti");

const countdown = document.getElementById("countdown");

const birthdayDate = new Date(Date.UTC(2022, 5, 20, 4));

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;



let timeSpan = birthdayDate - new Date();

let secretCounter = 5;

function showSite() {
    document.getElementById("countdown").style.display = "none";
    document.getElementById("visibilityContainer").style.display = "block";
    initModal();
}

function secretaccess() {
    secretCounter--;
    if (secretCounter <= 0) {
        showSite();
    }
}

function timer() {
    let now = new Date();
    let diff = birthdayDate - now;

    if (diff > 0) {
        let days = Math.floor(diff / day);
        let hours = Math.floor((diff % day) / hour);
        let minutes = Math.floor((diff % hour) / minute);
        let seconds = Math.floor((diff % minute) / second);

        document.getElementById("d").innerText = days;
        document.getElementById("h").innerText = hours;
        document.getElementById("m").innerText = minutes;
        document.getElementById("s").innerText = seconds;

        setTimeout(() => {
            timer();
        }, 1000);
    }
    else {
        showSite();
    }
}
timer();

