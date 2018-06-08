function deleteAcc(btn){
    btn.setAttribute("id","pressed");
    var tb = document.getElementById("accountTable");
    var res = confirm("Are you sure you want to Delete this Account?.");
    if (res === true){    
        for(var i = 1; i < tb.rows.length; i++){ 
            if (tb.rows[i].cells.item(3).innerHTML.search("pressed") > 0 ){
                document.getElementById("accountNumber").value = tb.rows[i].cells.item(0).innerHTML;
                document.getElementById("bank").value = tb.rows[i].cells.item(1).innerHTML;
            }   
        }
        document.getElementById("confirmDelete").submit();
    }

  }

  function deleteBud(btn){
    btn.setAttribute("id","pressed");
    var tb = document.getElementById("accountTable");
    var res = confirm("Are you sure you want to Delete this Budget?.");
    if (res === true){    
        for(var i = 1; i < tb.rows.length; i++){ 
            if (tb.rows[i].cells.item(3).innerHTML.search("pressed") > 0 ){
                document.getElementById("budgetName").value = tb.rows[i].cells.item(0).innerHTML;
            }   
        }
        document.getElementById("confirmDelete").submit();
    }

  }