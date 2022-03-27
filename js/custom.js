$(function () {
  redirect();
  $(".header").load("templates/header.html");
  $(".footer").load("templates/footer.html");
  viewHome();
});

function redirect() {
  if (loginUser.username == undefined || loginUser.password == undefined) {
    window.location.replace("http://127.0.0.1:5500/login.html");
  }
}

// đi đến trang chủ
function viewHome() {
  $(".main").load("templates/main.html", function () {
    $("#navbar a").removeClass("bg-primary active");
    $("#navHome").addClass("bg-primary active");
    loadUserInfo(loginUser);
  });
}

function viewDeparment() {
  $(".main").load("department/main.html", function () {
    $("#navbar a").removeClass("bg-primary active");
    $("#navDepartment").addClass("bg-primary active");
    initDepartmentPage();
  });
}

function viewAccount() {
  $(".main").load("account/main.html", function () {
    $("#navbar a").removeClass("bg-primary active");
    $("#navAccount").addClass("bg-primary active");
    initAccountPage();
  });
}

// Common functions

function loadUserInfo(user) {
  $(".login-username").html(user.fullName);
  console.log(user.role);
  if (user.role != "ADMIN") {
    $("#navbar a[id='navDepartment']").remove();
    $("#navbar a[id='navAccount']").remove();
  }
}

function logOut() {
  loginUser.reset();
  redirect();
}

function resetFilterInput() {
  $(".filter > input").val("");
  $(".filter > select").val("");
}

function resetModal() {
  $(".modal-body > input").val("");
  $(".modal-body > select").val("");
}

function showAlertSuccess(message) {
  $(".alert-success:first").clone().appendTo(".alert-queue");
  const alert = $(".alert-success:last");
  $(alert).find("span").html(message);
  $(alert).fadeTo(5000, 10).fadeIn(1000, function () {
      $(alert).fadeOut(1000);
  });
}

function showAlertError(message) {
  $(".alert-danger:first").clone().appendTo(".alert-queue");
  const alert = $(".alert-danger:last");
  $(alert).find("span").html(message);
  $(alert).fadeTo(5000, 10).fadeIn(1000, function () {
      $(alert).fadeOut(1000);
  });
}

function showErrorMessage(xhr) {
  const response = xhr.responseJSON;
  let message = response.message;
  for (const key in response.error) {
    if (response.error.hasOwnProperty(key)) {
      message += "<br>    " + response.error[key];
    }
  }
  $("#errorMessageModal").modal("show");
  $("#errorMessageModal .modal-body").html(message);
}

function hideErrorMessageModal() {
  $("#errorMessageModal").modal("hide");
}

var loginUser = {
  id: localStorage.getItem("ID"),
  fullName: localStorage.getItem("FULL_NAME"),
  role: localStorage.getItem("ROLE"),
  username: localStorage.getItem("USERNAME"),
  password: localStorage.getItem("PASSWORD"),
  reset() {
    localStorage.clear();
    for (const key in this) {
      if (Object.hasOwnProperty.call(this, key)) {
        if (key != "reset") {
          this[key] = undefined;
        }
      }
    }
  }
}