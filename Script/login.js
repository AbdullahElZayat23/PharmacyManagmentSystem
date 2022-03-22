function validate() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var userDB = openDatabase('Pharmacy', '1.0', 'this is the Pharmacy database', 24 * 1024 * 1024);
    if (!userDB) {
        alert('Database can not be opened');
    } else {
        userDB.transaction(function(tx) {

            var hashedpass = md5(password);
            //console.log(hashedpass);
            tx.executeSql('select * from users where username = ? and password = ? ;', [username, hashedpass], function(tx, results) {

                var len = results.rows.length;
                if (len > 0) {
                    // console.log(len); for test
                    document.getElementById("msg").innerText = "";
                    setCookie("currentuser", username);
                    open("../HTML/HomePage.html", "_self");
                } else {
                    document.getElementById("msg").innerText = "Wrong username or password";
                }

            }, null);

        });

    }
}

function changemsg() {
    document.getElementById("msg").innerText = "";
}

function setCookie(cname, cvalue, exdays) {
    /* const d = new Date();
     d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
     let expires = "expires=" + d.toUTCString();*/
    document.cookie = cname + "=" + cvalue + ";" + "path=/";
}
(
    function createDatabase() {
        var PharmacyDB = openDatabase('Pharmacy', '1.0', 'this is the pharmacy database', 24 * 1024 * 1024);
        if (!PharmacyDB) {
            alert('Database not Created');
        } else {
            PharmacyDB.transaction(function(tx) {
                tx.executeSql('CREATE TABLE if not exists  users (username TEXT  primary key,password TEXT)');
                tx.executeSql('CREATE TABLE if not exists items (itemid INTEGER  primary key,name TEXT unique ,quantity INTEGER ,pictureurl TEXT )');
                tx.executeSql('CREATE TABLE if not exists invoice (InvoiceNo INTEGER  primary key,Invoicedate DATE,customerName TEXT,Processtype TEXT,items_quantitites TEXT)');
                // tx.executeSql('CREATE TABLE if not exists invoiceitems (InvoiceNo INTEGER  ,items TEXT,quantities INTEGER,FOREIGN KEY(InvoiceNo) REFERENCES invoice(InvoiceNo))');
                var password = md5("admin123");
                tx.executeSql('insert into  users values("abdullah",?)', [password]);
                /*tx.executeSql('drop table users');
                tx.executeSql('drop table items');
                tx.executeSql('drop table invoice');*/
            });
        }
    }
)();