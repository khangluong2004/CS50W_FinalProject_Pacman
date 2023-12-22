document.addEventListener("DOMContentLoaded", function(){
    let challengeButton = document.querySelector("#challengeButton");
    let challengeForm = document.querySelector("#challengeForm");

    challengeButton.onclick = (event) => submitChallenge(event, challengeForm)
})

function submitChallenge(event, challengeForm){
    let score = challengeForm.querySelector("#score").value;
    let receiver = challengeForm.querySelector("#receiverText").value;

    console.log("Send request!");

    fetch('/challenges/services/send', {
        method: "POST",
        body: JSON.stringify({
            "receiver": receiver,
            "score": score
        })
    }).then(response => response.json())
    .then(response => console.log(response))

    // Prevent default submission
    return false;
}