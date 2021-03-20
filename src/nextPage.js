document.getElementById('button').addEventListener("click", function() {

    if (document.URL.includes("login.html")) {
        window.location = "index.html";
    } else if (document.URL.includes("register-page.html")) {
        alert("move to login")
        window.location.href = "login.html";
    }
})