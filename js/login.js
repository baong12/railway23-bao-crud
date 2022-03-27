function login() {
    hideNameErrorMessage();
    // Get username & password
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username) {
        showNameErrorMessage("Please input username!");
        return;
    }
    if (!password) {
        showNameErrorMessage("Please input password!");
        return;
    }

    // Call API
    $.ajax({
        url: 'https://railway23-bao-springboot.herokuapp.com/api/v1/auth/login',
        type: 'GET',
        contentType: "application/json",
        dataType: 'json', // datatype return
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
        },
        success: function (data, textStatus, xhr) {
            // save data to storage
            // https://www.w3schools.com/html/html5_webstorage.asp
            localStorage.setItem("ID", data.id);
            localStorage.setItem("FULL_NAME", data.fullName);
            localStorage.setItem("ROLE", data.role);
            localStorage.setItem("USERNAME", username);
            localStorage.setItem("PASSWORD", password);

            // redirect to home page
            // https://www.w3schools.com/howto/howto_js_redirect_webpage.asp
            window.location.replace("/");
        },
        error(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 401) {
                showNameErrorMessage("Login fail! Username or password incorrect!");
            } else {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
            }
        }
    });
}

function showNameErrorMessage(message) {
    // document.getElementById("nameErrorMessage").style.display = "block";
    document.getElementById("nameErrorMessage").innerHTML = message;
}

function hideNameErrorMessage() {
    // document.getElementById("nameErrorMessage").style.display = "none";
    document.getElementById("nameErrorMessage").innerHTML = "";
}