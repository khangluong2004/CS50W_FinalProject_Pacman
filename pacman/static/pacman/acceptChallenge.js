document.addEventListener("DOMContentLoaded", function(){
    let acceptForm = document.querySelector("#challengeForm");
    
    // Turn the form into Accept challenge form
    let receiverField = acceptForm.querySelector("#receiverDiv");
    receiverField.remove();

    let acceptButton = acceptForm.querySelector("#challengeButton");
    acceptButton.innerHTML = " Accept ";
    acceptButton.onclick = (event) => acceptSubmit(event, acceptForm);
})



function acceptSubmit(event, acceptForm){
    let score = acceptForm.querySelector("#score").value;
    let id = acceptForm.querySelector("#challengeId").value;

    fetch("/challenges/services/update", {
        method: "PUT",
        body: JSON.stringify({
            "id": id,
            "score": score
        })
    }).then(response => response.json())
    .then(response => console.log(response));

    return false;
}