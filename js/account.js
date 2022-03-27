const ACCOUNT_API_URL = 'https://railway23-bao-springboot.herokuapp.com/api/v1/accounts';
const DEFAULT_PASSWORD = "123456";

var tempAccount;

var getAccountApiParam = {
    lang: "vi",
    pageNumber: 0,
    search: "",
    role: "",
    departmentName: "",
    getParamString() {
        return "?pageNumber=" + this.pageNumber
            + "&search=" + this.search
            + "&role=" + this.role
            + "&departmentName=" + this.departmentName
            + "&lang=" + this.lang;
    },
    reset() {
        this.pageNumber = 0;
        this.search = "";
        this.role = "";
        this.departmentName = "";
    }
};

function initAccountPage() {
    getAccountApiParam.reset();
    initAccountTable();
    initRoleList();
    initDepartmentList();
    document.getElementById("filter-submit").onclick = filterAccount;
    $("#searchBox").keydown(function (event) {
        const keyCode = event.which;
        if (keyCode == 13) {
            getAccountApiParam.search = $("#searchBox").val();
            initAccountTable();
        }
    });
}

function initRoleList() {
    $(".role-list").html(`<option value="">-- Chọn role --</option>`);
    $.ajax({
        url: ACCOUNT_API_URL + "/roles",
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result) => {
            result.forEach(item => {
                $(".role-list").append(`<option value="${item}">${item}</option>`);
            });
        }
    });
}

function initDepartmentList() {
    $(".department-list").html(`<option value="">-- Chọn Phòng ban --</option>`);
    $.ajax({
        url: DEPARTMENT_API_URL + "/list",
        type: 'GET',
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result) => {
            result.forEach(item => {
                $("#filter-department-select").append(`<option value="${item.name}">${item.name}</option>`);
                $("#modal-department-select").append(`<option value="${item.id}">${item.name}</option>`);
            });
        }
    });
}

function filterAccount() {
    getAccountApiParam.role = $("#filter-role-select").val();
    getAccountApiParam.departmentName = $("#filter-department-select").val();
    initAccountTable();
}

function resetAccountFilterInput() {
    resetFilterInput();
    getAccountApiParam.reset();
}

function initAccountTable() {
    initAccountTableParam(getAccountApiParam.getParamString());
}

function refreshAccountTable() {
    getAccountApiParam.reset();
    initAccountTable();
}

//khởi tạo danh sách cho bảng nhân viên
function initAccountTableParam(param) {
    $('#tableBody').empty();
    $.ajax({
        url: ACCOUNT_API_URL + param,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result) => {
            result.content.forEach(function (item) {
                $('#tableBody').append(
                    `<tr>
                        <td><input type='checkbox' name='selectAccount' value='${item.id}'></td>
                        <td>${item.username}</td>
                        <td>${item.firstName} ${item.lastName}</td>
                        <td>${item.role}</td>
                        <td>${item.departmentName}</td>
                        <td class="flex-container-x-center">
                            <a class="edit" title="Sửa" data-toggle="tooltip" onclick="openUpdateAccountModal(${item.id})"><i class="material-icons">&#xE254;</i></a>
                            <a class="delete" title="Xóa" data-toggle="tooltip" onclick="openDeleteAccountModal(${item.id})"><i class="material-icons">&#xE872;</i></a>
                        </td>
                    </tr>`
                );
                paginationAccount(result);
            })
        }
    });
}

function paginationAccount(result) {
    const activeNumber = result.number + 1;
    $('#tablePager').html(`<a title="Previous" onclick="toAccountPage(${activeNumber - 1})">&laquo;</a>`);
    for (let i = 0; i < result.totalPages; i++) {
        const curNumber = i + 1;
        if (curNumber == activeNumber) {
            $('#tablePager').append(`<a class="active">${curNumber}</a>`);
        } else {
            $('#tablePager').append(`<a onclick="toAccountPage(${curNumber})">${curNumber}</a>`);
        }
    }
    const nextNumber = activeNumber < result.totalPages ? activeNumber + 1 : activeNumber;
    $('#tablePager').append(`<a title="Next" onclick="toAccountPage(${nextNumber})">&raquo;</a>`);
}

function toAccountPage(number) {
    getAccountApiParam.pageNumber = number;
    initAccountTable();
}

function openAddNewAccountModal() {
    $("#addNewAccountModal").modal("show");
    $("#addNewAccountModalTitle").html("Tạo Nhân viên");
    initDepartmentList();
    resetModal();
}

function hideAddNewAccountModal() {
    $("#addNewAccountModal").modal("hide");
    resetModal();
}

function createNewAccount() {
    const account = {
        username: $("#usernameInput").val(),
        password: DEFAULT_PASSWORD,
        email: $("#usernameInput").val() + "@gmail.com",
        firstName: $("#firstNameInput").val(),
        lastName: $("#lastNameInput").val(),
        role: $("#modal-role-select").val(),
        departmentId: $("#modal-department-select").val()
    }

    let validationFailMsg = "";
    if (!account.username || account.username.length < 8 || account.username.length > 20) {
        validationFailMsg += `"Username" không để trống, độ dài 8-20 ký tự.<br>`;
    }
    if (!account.password || account.password.length < 6 || account.password.length > 8) {
        validationFailMsg += `"Password" không để trống, độ dài 6-8 ký tự.<br>`;
    }
    if (!account.firstName || account.firstName.length > 50) {
        validationFailMsg += `"Tên" không để trống, độ dài tối đa 50 ký tự.<br>`;
    }
    if (!account.lastName || account.firstName.length > 50) {
        validationFailMsg += `"Họ" không để trống, độ dài tối đa 50 ký tự.<br>`;
    }
    if (!account.role || account.role == "") {
        validationFailMsg += `"Role" không để trống.<br>`;
    }
    if (!account.departmentId || account.departmentId == "") {
        validationFailMsg += `"Department" không để trống.<br>`;
    }
    if (!account.email || account.email.length > 50) {
        validationFailMsg += `"Email" không để trống, độ dài tối đa 50 ký tự.<br>`;
    }
    if (validationFailMsg != "") {
        $("#errorMessageModal").modal("show");
        $("#errorMessageModal .modal-body").html(validationFailMsg);
        return;
    }

    let isSuccess = true;
    $.ajax({
        url: ACCOUNT_API_URL,
        type: 'POST',
        data: JSON.stringify(account),
        contentType: "application/json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result, status, xhr) => {
            if (status == "success" || xhr.status == 200) {
                showAlertSuccess(`Đã thêm thành công "${account.name}"`);
            }
        },
        error: (xhr) => {
            showErrorMessage(xhr);
            showAlertError("Đã xảy ra lỗi");
            isSuccess = false;
        }
    });
    if (isSuccess) {
        getAccountApiParam.reset();
        initAccountTable();
        hideAddNewAccountModal();
    }
}

function getCheckedAccountIds() {
    let ids = [];
    $('#tableBody input:checked').each(function () {
        ids.push(this.value);
    });
    return ids;
}

function openUpdateAccountModal(id) {
    $("#addNewAccountModal").modal("show");
    $("#addNewAccountModalTitle").html("Cập nhật Nhân viên");
    initDepartmentList();
    getAccountById(id);
}

function getAccountById(id) {
    $.ajax({
        url: ACCOUNT_API_URL + "/" + id,
        type: 'GET',
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: function (result) {
            tempAccount = result;
            //fill data
            $("#accountId").val(result.id);
            $("#usernameInput").val(result.username);
            $("#firstNameInput").val(result.firstName);
            $("#lastNameInput").val(result.lastName);
            $("#modal-role-select").val(result.role);
            $("#modal-department-select").val(result.departmentId);
        },
        error: (xhr) => showErrorMessage(xhr)
    });
}

function updateAccount(id) {
    tempAccount.username = $("#usernameInput").val();
    tempAccount.firstName = $("#firstNameInput").val();
    tempAccount.lastName = $("#lastNameInput").val();
    tempAccount.role = $("#modal-role-select").val();
    tempAccount.departmentId = $("#modal-department-select").val();

    let validationFailMsg = "";
    if (!tempAccount.username || tempAccount.username.length < 8 || tempAccount.username.length > 20) {
        validationFailMsg += `"Username" không để trống, độ dài 8-20 ký tự.<br>`;
    }
    if (!tempAccount.firstName || tempAccount.firstName.length > 50) {
        validationFailMsg += `"Tên" không để trống, độ dài tối đa 50 ký tự.<br>`;
    }
    if (!tempAccount.lastName || tempAccount.firstName.length > 50) {
        validationFailMsg += `"Họ" không để trống, độ dài tối đa 50 ký tự.<br>`;
    }
    if (!tempAccount.role || tempAccount.role == "") {
        validationFailMsg += `"Role" không để trống.<br>`;
    }
    if (!tempAccount.departmentId || tempAccount.departmentId == "") {
        validationFailMsg += `"Department" không để trống.<br>`;
    }
    if (validationFailMsg != "") {
        $("#errorMessageModal").modal("show");
        $("#errorMessageModal .modal-body").html(validationFailMsg);
        return;
    }

    let isSuccess = true;
    $.ajax({
        url: ACCOUNT_API_URL + "/" + id,
        type: 'PUT',
        data: JSON.stringify(tempAccount), // body
        contentType: "application/json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result, status, xhr) => {
            if (status == "success" || xhr.status == 200) {
                showAlertSuccess(`Đã sửa thành công "${tempAccount.name}"`);
            }
        },
        error: (xhr) => {
            showErrorMessage(xhr);
            showAlertError("Đã xảy ra lỗi");
            isSuccess = false;
        }
    });
    if (isSuccess) {
        getAccountApiParam.reset();
        initAccountTable();
        hideAddNewAccountModal();
    }
}

function saveAccount() {
    const id = $("#accountId").val();
    if (id == undefined || id == "") {
        createNewAccount();
    } else {
        updateAccount(id);
    }
}

function openDeleteAccountModal(id) {
    $("#deleteAccountModal").modal("show");
    if (id != undefined && id != "") {
        $("#accountId").val(id);
        $("#deleteAccountModal").find(".modal-body").html("Bạn có muốn xóa Nhân viên?")
    } else {
        $("#deleteAccountModal").find(".modal-body").html("Bạn có muốn xóa tất cả Nhân viên đã chọn?")
    }
}

function confirmDeleteAccount() {
    const id = $("#accountId").val();
    if (id != undefined && id != "") {
        deleteAccount(id);
    } else {
        deleteAccountInBatch();
    }
    hideDeleteAccountModal();
}

function hideDeleteAccountModal() {
    $("#deleteAccountModal").modal("hide");
    resetModal();
}

function deleteAccount(id) {
    $.ajax({
        url: ACCOUNT_API_URL + "/" + id,
        type: 'DELETE',
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result, status, xhr) => {
            if (status == "success" || xhr.status == 200) {
                showAlertSuccess("Đã xóa thành công");
            }
        },
        error: (xhr) => {
            showErrorMessage(xhr);
            showAlertError("Đã xảy ra lỗi");
        }
    });
    getAccountApiParam.reset();
    initAccountTable();
}

function deleteAccountInBatch() {
    const data = getCheckedAccountIds();

    let validationFailMsg = "";
    if (data.length == 0) {
        validationFailMsg += `Danh sách id cần xóa không được trống.<br>`;
    }
    if (validationFailMsg != "") {
        $("#errorMessageModal").modal("show");
        $("#errorMessageModal .modal-body").html(validationFailMsg);
        return;
    }
    
    $.ajax({
        url: ACCOUNT_API_URL,
        type: 'DELETE',
        data: JSON.stringify(data), // body
        contentType: "application/json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result, status, xhr) => {
            if (status == "success" || xhr.status == 200) {
                showAlertSuccess("Đã xóa thành công");
            }
        },
        error: (xhr) => {
            showErrorMessage(xhr);
            showAlertError("Đã xảy ra lỗi");
        }
    });
    getAccountApiParam.reset();
    initAccountTable();
}