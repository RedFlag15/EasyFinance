function validateEmail(email){
    var rp = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return rp.test(email)
}


function validate(){
    var pass = $("#inputPassword").val();
    var $emailval = $("#emailval");
    var $passval = $("#passval")
    var $passval2 = $("#passval2")
    var $passval3 = $("#passval3")
    var $passval4 = $("#passval4")
    var passconfirm = $("#inputPasswordConfirm").val()
    var $passconfirmation = $("#passconfirmation")
    var email = $("#email").val();

    

    $emailval.text("")
    $passval.text("")
    $passval2.text("")
    $passval3.text("")
    $passval4.text("")

    //email validation
    if (validateEmail(email)){
        $emailval.text ("Valid");
        $emailval.css("color","green");
    }
    else{
        $emailval.text ("* Not a valid email address");
        $emailval.css ("color", "red");
    }

    //password validation
    if (pass.length < 8){
        $passval.text("* Use 8 or more characters");
        $passval.css("color", "red");
    }
    else{
        $passval.text("Use 8 or more characters");
        $passval.css("color", "green");
    }

    if (pass.search(/[0-9]/) === -1){
        $passval2.text("* Use a number (e.g. 1234)");
        $passval2.css("color", "red");
        
    }
    else{
        $passval2.text("Use a number");
        $passval2.css("color", "green");
    }

    if (pass.search(/[A-Z]/) < 0 || pass.search(/[a-z]/) < 0){
        $passval3.text("* Use upper and lower case letters (e.g. Aa)");
        $passval3.css("color", "red");
    }
    else{
        $passval3.text("Use upper and lower case letters");
        $passval3.css("color", "green");
    }
    
    if (pass.search(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/) < 0){
        $passval4.text("* Use a symbol (e.g. !#$%-)");
        $passval4.css("color", "red");
    }
    else{
        $passval4.text("Use a symbol");
        $passval4.css("color", "green");
    }

    if (pass.length > 0){
        if (pass === passconfirm){
            $passconfirmation.text("Passwords match");
            $passconfirmation.css("color", "green");
        }
        else{
            $passconfirmation.text("* Passwords don't match");
            $passconfirmation.css("color", "red");
        }
    }

    return false;
}

function validateField(field){
    var x = field["id"];
    if (x === "email"){
        var email = $("#email").val();
        if (validateEmail(email)){
            return true;
        }
        else{
            return false;
        }

    }
    if (x === "inputPassword"){
        var pass = $("#inputPassword").val();
        if (pass.length < 8){
            return false;
        }
        if (pass.search(/[0-9]/) === -1){
            return false;       
        }
        if (pass.search(/[A-Z]/) < 0 || pass.search(/[a-z]/) < 0){
            return false;
        }     
        if (pass.search(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/) < 0){
            return false;
        }
        else{
            return true;
        }
    }
    if (x === "inputPasswordConfirm"){
        var pass = $("#inputPassword").val();
        var passconfirm = $("#inputPasswordConfirm").val()
        if (pass === passconfirm){
            return true;
        }
        else{
            return false;
        }
    }
    if (x === "submitButton")
    {
        return true;
    }
}

function validateForm(){
    var x = document.forms["formtovalidate"];

    for (var i = 0; i < x.length; i=i+1){
        if (!validateField(x[i])){
            validate();
            alert("Invalid Fields.")
            return false;
        }
    }
}