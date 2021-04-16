function show() {
    const p = document.getElementsByClassName('password-input');
    for (let pass of p) {
        pass.setAttribute('type', 'text');
    }
    document.getElementById('password-control').style.backgroundImage = "url('pics/closedEye.png')";
}

function hide() {
    const p = document.getElementsByClassName('password-input');
    for (let pass of p) {
        pass.setAttribute('type', 'password');
    }
    document.getElementById('password-control').style.backgroundImage = "url('pics/openEye.png')";
}

let inputCondition = 0;


function changePassStatus(){
    if (inputCondition === 0) {
        inputCondition = 1;
        show();
    } else {
        inputCondition = 0;
        hide();
    }
}

export default changePassStatus;