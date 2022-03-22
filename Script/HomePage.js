var DbPharmacy = openDatabase('Pharmacy', '1.0', 'this is the Pharmacy database', 24 * 1024 * 1024);

(function() {
    var current = document.cookie;
    current = current.split("=");
    document.getElementById("currentuser").innerHTML = current[1];
    document.getElementById("currentuser").style.textTransform = "Capitalize";
    document.getElementById("currentuser").style.color = "blue";
    if (current[1] == "abdullah") {
        document.getElementById("addus").style.display = "inline";
    } else {
        document.getElementById("addus").style.display = "none";
    }
})();

function Adduser() {
    hideothers();
    document.getElementById("adduserfrom").style.display = "block";
}


function SaveUserData() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var Repassword = document.getElementById("Repassword").value;
    if (password != Repassword || password == "" || Repassword == "") {
        document.getElementById("msg").innerText = "Password not match";
    } else {
        // console.log(username, password); for test

        DbPharmacy.transaction(function(tx) {

            var hashedpass = md5(password);
            //console.log(hashedpass);
            tx.executeSql('insert into users (username,password) values(?,?) ;', [username, hashedpass], function(tx, results) {
                document.getElementById("msg").innerText = "";
                document.getElementById("adduserfrom").style.display = "none";
                location.reload();
            }, function() {
                document.getElementById("Can't add the user , username is duplicated");
            });

        });
    }

}

function deleteitem() {
    hideothers();
    document.getElementById("itemtodeleteform").style.display = "block";
}

function GetitemToDeleteInfo() {
    var id = document.getElementById("itemtodelete").value;
    DbPharmacy.transaction(function(tx) {
        tx.executeSql("select * from items where itemid = ?", [parseInt(id)], function(tx, result) {
            var len = result.rows.length;
            if (len > 0) {
                document.getElementById("itemToDeleteInfo").innerHTML = "Item to be deleted info: ID -> " +
                    result.rows[0].itemid + " , Name -> " + result.rows[0].name +
                    " , Quantity -> " + result.rows[0].quantity + " item image -> " + `<img width="80px" height="80px" src=${result.rows[0].pictureurl}>`;
                document.getElementById("deletebtn").disabled = false;
            } else {
                document.getElementById("deletebtn").disabled = true;
                document.getElementById("itemToDeleteInfo").innerText = "Not found, enter existing item ID.";
            }

        }, function() {
            alert("can't");
        });
    });

}

function ConfirmDelete() {
    var idtodelete = document.getElementById("itemtodelete").value;
    if (idtodelete != "") {
        var promptResponse = confirm("Sure you want to delete ?");
        if (promptResponse == true) {
            DbPharmacy.transaction(function(tx) {
                tx.executeSql("delete from items where itemid = ?", [idtodelete], function() {
                    alert("item deleted");
                    location.reload();
                }, function() {
                    alert("can't delete this id (SQL error)");
                });

            });
        }

    } else {
        alert("No id to delete");
    }
}

function logout() {
    document.cookie = "currentuser" + "=" + "" + ";" + "path=/";
    open("../HTML/Index.html", "_self");
}

function additem() {
    hideothers();

    document.getElementById("additem").style.display = "block";
    document.getElementById("saveeditedbtn").style.display = "none";
    document.getElementById("itemid").value = "";
    document.getElementById("itemid").disabled = false;
    document.getElementById("itemMsg").innerText = "";
}

function changeitemmsg() {

    document.getElementById("itemMsg").innerText = "";

}

function saveitem() {
    var imgSrcValue = document.querySelector("#showscreenshotimg");
    var itemId = document.getElementById("itemid").value;
    var itemname = document.getElementById("itemname").value;
    var itemquantity = document.getElementById("itemquantity").value;
    if (itemquantity != "" && itemid != "" && itemname != "" && imgSrcValue.src != "") {

        DbPharmacy.transaction(function(tx) {
            tx.executeSql("select itemid from items where itemid =?", [itemId], function(tx, result) {
                var len = result.rows.length;
                if (len > 0) {
                    /*tx.executeSql("update items set quantity = (select quantity from items where itemid=?) + ? where itemid = ? ", [itemId, itemquantity, itemId], function() {
                        document.getElementById("additem").style.display = "none";
                        imgSrcValue.src = "";
                        location.reload();
                        alert("Item already exists and it's quantity is updated");
                    }, null);*/
                    alert("Item already exists");
                } else {
                    DbPharmacy.transaction(function(txx) {
                        var canvas = document.querySelector("#showscreenshot");
                        let imgAsStr = canvas.toDataURL();
                        txx.executeSql("insert into items (itemid,name,quantity,pictureurl) values(?,?,?,?)", [itemId, itemname, itemquantity, imgAsStr], function() {
                            document.getElementById("additem").style.display = "none";
                            imgSrcValue.src = "";
                            location.reload();
                            alert("Item added");
                        }, function() {
                            alert("can't be added( maybe name is duplicated)");
                        });
                    });

                }
            }, null);
        });

    } else {
        document.getElementById("itemMsg").innerText = "Item can't be added (required filed is empty or item id is duplicated)";
    }

}

function showInvoiceNumber() {
    DbPharmacy.transaction(function(tx) {
        tx.executeSql("select max(InvoiceNo) from invoice", [], function(tx, result) {
            var max = result.rows[0];
            document.getElementById("invoicnumber").value = max["max(InvoiceNo)"] + 1;
            document.getElementById("invoicnumber").disabled = true;
        }, null);
    })
}

function Makeinvoice() {
    hideothers();
    document.getElementById("invoice").style.display = "inline";
    document.getElementById("SaveInvoiceBtn").disabled = true;
    document.getElementById("item").innerHTML = "";
    showInvoiceNumber();
    DbPharmacy.transaction(function(tx) {
        tx.executeSql("Select * from items", [], function(tx, result) {
            var len = result.rows.length,
                i;
            document.getElementById("item").innerHTML = "<option selected disabled></option>"
            for (i = 0; i < len; i++) {
                document.getElementById("item").innerHTML += "<option>" + result.rows[i].name + "</option>";
            }
        }, null);
    })
}
var ArrayOfItems = "";
var flag = 0;

function showItemsData() {

    var item = document.getElementById("item");
    var NameValue = item.options[item.selectedIndex].text;
    var quantity = document.getElementById("itemquantitytoadd").value;

    if (NameValue != "" && quantity != "") {
        ArrayOfItems += NameValue + ":" + quantity + ",";
        flag = 1;
        document.getElementById("SaveInvoiceBtn").disabled = false;
        document.getElementById("itemsadded").innerHTML += "<br>" + "item name: " + NameValue + ",Item quantity: " + quantity;
    } else {
        alert("No items selected to add");
    }


}

function saveinvoice() {

    var date = document.getElementById("invoiceDate").value;
    var customerName = document.getElementById("Customername").value;
    var type = document.querySelector("input[name='Processtype']:checked").value;
    var items_quantities = document.getElementById("itemsadded").innerText;
    var invoicenumber = document.getElementById("invoicnumber").value;

    if (date != "" && customerName != "" && type != "" && items_quantities != "" && invoicenumber != "") {
        DbPharmacy.transaction(function(tx) {
            tx.executeSql("insert into invoice (InvoiceNo ,Invoicedate,customerName,Processtype ,items_quantitites ) values(?,?,?,?,?)", [invoicenumber, date, customerName, type, items_quantities], function() {
                AffectItemsChanges(type, ArrayOfItems);
                alert("Invoice is added successfully");
                document.getElementById("itemsadded").innerHTML = "";
                //location.reload();
            }, function() {
                alert("Invoice not added");
            });
        });
    }

}


function AffectItemsChanges(type, ArrayOfItems) {

    var itemlen = ArrayOfItems.split(",").length,
        i;
    if (type == "sell") {

        DbPharmacy.transaction(function(tx) {

            for (i = 0; i < itemlen - 1; i++) {
                let nametobe, quantitytobe;
                nametobe = ArrayOfItems.split(",")[i].split(":")[0]; //name
                quantitytobe = ArrayOfItems.split(",")[i].split(":")[1]; //quantity
                console.log("name" + nametobe);
                console.log("quantity" + quantitytobe);
                tx.executeSql("update items set quantity = (select quantity from items where name=?) - ? where name = ? ", [nametobe, quantitytobe * 1, nametobe], function() {
                    alert("Item updated successfully");
                }, null);
            }
            ArrayOfItems = "";
        });

    } else if (type == "buy") {
        DbPharmacy.transaction(function(tx) {
            for (i = 0; i < itemlen - 1; i++) {
                let nametobe, quantitytobe;
                nametobe = ArrayOfItems.split(",")[i].split(":")[0]; //name
                quantitytobe = ArrayOfItems.split(",")[i].split(":")[1]; //quantity
                tx.executeSql("update items set quantity = (select quantity from items where name=?) + ? where name = ? ", [nametobe, quantitytobe * 1, nametobe], function() {
                    alert("Item updated successfully");

                }, null);
            }
            ArrayOfItems = "";
        });
    }


}

function showitems() {
    hideothers();
    document.getElementById("Showitems").style.display = "inline";
    DbPharmacy.transaction(function(tx) {
        tx.executeSql("select * from items", [], function(tx, result) {
            var len = result.rows.length,
                i;
            var htmlCode = "";
            for (i = 0; i < len; i++) {
                let currentRecord = result.rows[i];

                htmlCode += `
                        <tr>
                            <td>
                                ${currentRecord.itemid}
                            </td>
                            <td>
                                ${currentRecord.name}
                            </td>
                            <td>
                                ${currentRecord.quantity}
                            </td>
                            <td>
                            <img src='${currentRecord.pictureurl}'>
                            </td>
                            <td>
                                <button  data-currentitemid="${currentRecord.itemid}" onclick="EditItem(this)">Edit</button>
                            </td>
                        </tr>
                        `;
            }
            document.getElementById("itemsTableBody").innerHTML = htmlCode;

        }, null);
    });
}

function EditItem(Callerid) {
    let id = Callerid.dataset.currentitemid;
    document.getElementById("Showitems").style.display = "none";
    document.getElementById("additem").style.display = "block";
    document.getElementById("itemid").value = id;
    document.getElementById("itemid").disabled = true;
    document.getElementById("savebtn").style.display = "none";
    document.getElementById("saveeditedbtn").style.display = "flex";
    document.getElementById("itemMsg").innerText = "";
    //alert(EditItem.caller);
}


function SaveEditedItem() {
    var imgSrcValue = document.querySelector("#showscreenshotimg");
    var itemId = document.getElementById("itemid").value;
    var itemname = document.getElementById("itemname").value;
    var itemquantity = document.getElementById("itemquantity").value;

    if (itemquantity != "" && itemname != "" && imgSrcValue.src != "") {
        DbPharmacy.transaction(function(tx) {
            var canvas = document.querySelector("#showscreenshot");
            let imgAsStr = canvas.toDataURL();
            tx.executeSql("update items set name=?, quantity=?, pictureurl=? where itemid = ?", [itemname, itemquantity, imgAsStr, itemId], function(tx, result) {
                document.getElementById("additem").style.display = "none";
                imgSrcValue.src = "";
                location.reload();
                alert("Item updated");
            }, function(tx, error) {
                console.log(error);
                alert("can't be updated");
            });
        });

    } else {
        document.getElementById("itemMsg").innerText = "Item can't be added (required filed is empty or item id is duplicated)";
    }

}

function hideothers() {

    document.getElementById("adduserfrom").style.display = "none";
    document.getElementById("itemtodeleteform").style.display = "none";
    document.getElementById("additem").style.display = "none";
    document.getElementById("invoice").style.display = "none";
    document.getElementById("Showitems").style.display = "none";
}