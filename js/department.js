const DEPARTMENT_API_URL = 'https://railway23-bao-springboot.herokuapp.com/api/v1/departments';

var getDepartmentApiParam = {
    lang: "vi",
    pageNumber: 0,
    search: "",
    minDate: "",
    maxDate: "",
    typeSelect: "",
    getParamString() {
        return "?pageNumber=" + this.pageNumber
            + "&search=" + this.search
            + "&minCreatedDate=" + this.minDate
            + "&maxCreatedDate=" + this.maxDate
            + "&type=" + this.typeSelect
            + "&lang=" + this.lang;
    },
    reset() {
        this.pageNumber = 0;
        this.search = "";
        this.minDate = "";
        this.maxDate = "";
        this.typeSelect = "";
    }
};

var tempDepartment;

function initDepartmentPage() {
    getDepartmentApiParam.reset();
    initDepartmentTable();
    initTypeList();
    document.getElementById("filter-submit").onclick = filterDepartment;
    $("#searchBox").keydown(function (event) {
        const keyCode = event.which;
        if (keyCode == 13) {
            getDepartmentApiParam.search = $("#searchBox").val();
            initDepartmentTable();
        }
    });
}

function initTypeList() {
    $(".type-list").html(`<option value="">-- Choose a type --</option>`);
    $.ajax({
        url: DEPARTMENT_API_URL + "/types",
        type: 'GET',
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result) => {
            result.forEach(item => {
                $(".type-list").append(`<option value="${item.value}">${item.name}</option>`);
            });
        },
        error: (xhr) => {
            showErrorMessage(xhr);
            showAlertError("Đã xảy ra lỗi");
        }
    });
}

function filterDepartment() {
    getDepartmentApiParam.minDate = $("#minDate").val();
    getDepartmentApiParam.maxDate = $("#maxDate").val();
    getDepartmentApiParam.typeSelect = $("#type-select").val();
    initDepartmentTable();
}

function resetDepartmentFilterInput() {
    resetFilterInput();
    getDepartmentApiParam.reset();
}

function initDepartmentTable() {
    initDepartmentTableParam(getDepartmentApiParam.getParamString());
}

function refreshDepartmentTable() {
    getDepartmentApiParam.reset();
    initDepartmentTable();
}

//khởi tạo danh sách cho bảng nhân viên
function initDepartmentTableParam(param) {
    $('#tableBody').empty();
    $.ajax({
        url: DEPARTMENT_API_URL + param,
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result, status, xhr) => {
            result.content.forEach(function (item) {
                $('#tableBody').append(
                    `<tr>
                        <td><input type='checkbox' name='selectDepartment' value='${item.id}'></td>
                        <td>${item.name}</td>
                        <td>${item.totalMember}</td>
                        <td>${item.type}</td>
                        <td>${item.createdDate}</td>
                        <td>
                            <a class="add-member" title="Add member" data-toggle="tooltip" onclick="openAddAccountModal(${item.id})"><i class="material-icons">&#xe7fe;</i></a>
                            <a class="edit" title="Edit" data-toggle="tooltip" onclick="openUpdateDepartmentModal(${item.id})"><i class="material-icons">&#xE254;</i></a>
                            <a class="delete" title="Delete" data-toggle="tooltip" onclick="openDeleteDepartmentModal(${item.id})"><i class="material-icons">&#xE872;</i></a>
                        </td>
                    </tr>`
                );
                pagination(result);
            })
        }
    });
}

function pagination(result) {
    const activeNumber = result.number + 1;
    $('#tablePager').html(`<a title="Previous" onclick="toDeparmentPage(${activeNumber - 1})">&laquo;</a>`);
    for (let i = 0; i < result.totalPages; i++) {
        const curNumber = i + 1;
        if (curNumber == activeNumber) {
            $('#tablePager').append(`<a class="active">${curNumber}</a>`);
        } else {
            $('#tablePager').append(`<a onclick="toDeparmentPage(${curNumber})">${curNumber}</a>`);
        }
    }
    const nextNumber = activeNumber < result.totalPages ? activeNumber + 1 : activeNumber;
    $('#tablePager').append(`<a title="Next" onclick="toDeparmentPage(${nextNumber})">&raquo;</a>`);
}

function toDeparmentPage(number) {
    getDepartmentApiParam.pageNumber = number;
    initDepartmentTable();
}

function openAddDepartmentModal() {
    $("#addDepartmentModal").modal("show");
    $("#addDepartmentModalTitle").html("Tạo Phòng ban");
    $("#add-account button").show();
    resetModal();
    initAddAccountTable();
}

function hideAddDepartmentModal() {
    $("#addDepartmentModal").modal("hide");
    resetModal();
}

function openAddAccountModal(id) {
    $("#addAccountModal").modal("show");
    if (id != undefined && id != "") {
        initAddAccountTable();
        getDepartmentById(id);
    }
}

function initAddAccountTable() {
    $.ajax({
        url: ACCOUNT_API_URL + "/list",
        type: 'GET',
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result) => {
            $('#tableBodyAccountList').empty();
            result.forEach((item) => {
                $('#tableBodyAccountList').append(
                    `<tr>
                        <td><input type='checkbox' name='selectAccount' value='${item.id}'></td>
                        <td class='groupName'>${item.username}</td>
                        <td class='member'>${item.firstName} ${item.lastName}</td>
                        <td class='creator'>${item.role}</td>
                    </tr>`
                );
            });
        }
    });
}

function hideAddAccountModal() {
    $("#addAccountModal").modal("hide");
}

function createNewDepartment() {
    const department = {
        name: $("#nameInput").val(),
        totalMember: getCheckedAddAccountIds().length,
        type: $("#modal-type-select").val(),
        accounts: getCheckedAddAccountIds()
    }

    let validationFailMsg = "";
    if (!department.name || department.name.length > 30) {
        validationFailMsg += `"Tên Phòng ban" không để trống, độ dài tối đa 30 ký tự.<br>`;
    }
    if (!department.type || department.type == "") {
        validationFailMsg += `"Loại Phòng ban" không để trống.<br>`;
    }
    if (validationFailMsg != "") {
        $("#errorMessageModal").modal("show");
        $("#errorMessageModal .modal-body").html(validationFailMsg);
        return;
    }
    let isSuccess = true;
    $.ajax({
        url: DEPARTMENT_API_URL,
        type: 'POST',
        data: JSON.stringify(department), // body
        contentType: "application/json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result, status, xhr) => {
            if (status == "success" || xhr.status == 200) {
                showAlertSuccess(`Đã thêm thành công "${department.name}"`);
            }
        },
        error: (xhr) => {
            showErrorMessage(xhr);
            showAlertError("Đã xảy ra lỗi");
            isSuccess = false;
        }
    });
    if (isSuccess) {
        getDepartmentApiParam.reset();
        initDepartmentTable();
        hideAddDepartmentModal();
    }
}

function getCheckedAddAccountIds() {
    let ids = [];
    const checkboxes = $("input[name='selectAccount']");
    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            ids.push({ id: checkbox.value });
        }
    }
    return ids;
}

function openUpdateDepartmentModal(id) {
    $("#addDepartmentModal").modal("show");
    $("#addDepartmentModalTitle").html("Cập nhật Phòng ban");
    $("#add-account button").hide();
    initAddAccountTable();
    getDepartmentById(id);
}

function getDepartmentById(id) {
    $.ajax({
        url: DEPARTMENT_API_URL + "/" + id,
        type: 'GET',
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: function (result) {
            tempDepartment = result;

            $("#departmentId").val(result.id);
            $("#nameInput").val(result.name);
            $("#modal-type-select").val(result.type);

            const accounts = result.accounts;
            for (const account of accounts) {
                $(`input[name='selectAccount'][value=${account.id}]`).attr("checked", true);
            }
        }
    });
}

function saveAccountList() {
    const id = $("#departmentId").val();
    if (id != undefined && id != "") {
        updateDepartmentAccountList(id);
    }
    hideAddAccountModal();
}

function updateDepartmentAccountList(id) {
    tempDepartment.totalMember = getCheckedAddAccountIds().length;
    tempDepartment.accounts = getCheckedAddAccountIds();
    updateDepartmentAction(id);
}

function updateDepartment(id) {
    tempDepartment.name = $("#nameInput").val();
    tempDepartment.type = $("#modal-type-select").val();
    
    let validationFailMsg = "";
    if (!tempDepartment.name || tempDepartment.name.length > 30) {
        validationFailMsg += `"Tên Phòng ban" không để trống, độ dài tối đa 30 ký tự.<br>`;
    }
    if (!tempDepartment.type || tempDepartment.type == "") {
        validationFailMsg += `"Loại Phòng ban" không để trống.<br>`;
    }
    if (validationFailMsg != "") {
        $("#errorMessageModal").modal("show");
        $("#errorMessageModal .modal-body").html(validationFailMsg);
        return;
    }

    updateDepartmentAction(id);
}

function updateDepartmentAction(id) {
    let isSuccess = true;
    $.ajax({
        url: DEPARTMENT_API_URL + "/" + id,
        type: 'PUT',
        data: JSON.stringify(tempDepartment), // body
        contentType: "application/json",
        async: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(loginUser.username + ":" + loginUser.password));
        },
        success: (result, status, xhr) => {
            if (status == "success" || xhr.status == 200) {
                showAlertSuccess(`Đã sửa thành công "${tempDepartment.name}"`);
            }
        },
        error: (xhr) => {
            showErrorMessage(xhr);
            showAlertError("Đã xảy ra lỗi");
            isSuccess = false;
        }
    });
    if (isSuccess) {
        getDepartmentApiParam.reset();
        initDepartmentTable();
        hideAddDepartmentModal();
    }
}

function saveDepartment() {
    const id = $("#departmentId").val();
    if (id == undefined || id == "") {
        createNewDepartment();
    } else {
        updateDepartment(id);
    }
}

function openDeleteDepartmentModal(id) {
    $("#deleteDepartmentModal").modal("show");
    if (id != undefined && id != "") {
        $("#departmentId").val(id);
        $("#deleteDepartmentModal").find(".modal-body").html("Bạn có muốn xóa Phòng ban?")
    } else {
        $("#deleteDepartmentModal").find(".modal-body").html("Bạn có muốn xóa tất cả Phòng ban đã chọn?")
    }
}

function confirmDeleteDepartment() {
    const id = $("#departmentId").val();
    if (id != undefined && id != "") {
        deleteDepartment(id);
    } else {
        deleteDepartmentInBatch();
    }
    hideDeleteDepartmentModal();
}

function hideDeleteDepartmentModal() {
    $("#deleteDepartmentModal").modal("hide");
    resetModal();
}

function deleteDepartment(id) {
    $.ajax({
        url: `${DEPARTMENT_API_URL}/${id}?lang=${getDepartmentApiParam.lang}`,
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
    getDepartmentApiParam.reset();
    initDepartmentTable();
}

function deleteDepartmentInBatch() {
    const data = getCheckedDepartmentIds();

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
        url: DEPARTMENT_API_URL,
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
    getDepartmentApiParam.reset();
    initDepartmentTable();
}

function getCheckedDepartmentIds() {
    let ids = [];
    $('#tableBody input:checked').each(function () {
        ids.push(this.value);
    });
    return ids;
}