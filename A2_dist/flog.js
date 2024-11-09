// Run initializer after DOM elements load
window.addEventListener("load", run);

// Really secure, right? If only there was a way to prevent the client from simply reassigning these values in the JS console...
var activeShop = 2;
const shopImage = [ "shopkeep2.webp", "shopkeep5.webp", "shopkeep3.webp" ];
var playerGold = 400;
var playerInv = [{ "id" : 1, "name" : "Copper Dagger", "description" : "Every shop's got to have one, right?", "quantity" : 1 }];

// Startup function
async function run () {
    await changeShop(0);
}

async function reset() {
    await fetch ("reset.php")
        .then( response => response.text())
        .then( data => console.log(data));
    await changeShop(0);
    playerInv = [{ "id" : 1, "name" : "Copper Dagger", "description" : "Every shop's got to have one, right?", "quantity" : 1 }];
    playerGold = 400;
    await populatePlayerData();
}

// Performs fetch request to obtain the sell price of an item in the player's inventory for the current shop
async function fetchItemValue (id) {
    let x;
    await fetch ("requestItemValue.php?id=" + id + "&shop=" + activeShop)
        .then( response => response.text())
        .then( data => x = data);
    return x;
}

// Performs a fetch request to obtain the contents of a shop's JSON file.
async function fetchInventory (which) {
    await fetch ("requestInventory.php?shop=" + which)
        .then( response => response.json())
        .then( data => populateInventory(data, "#storeInv", true));
}

// Calls "fetchItemValue" for each item in the player's inventory, then displays the table using populateInventory
async function populatePlayerData() {
    document.querySelector("#gold").innerHTML = playerGold;
    if (playerInv.length > 0) {
        for (let i = 0; i < playerInv.length; i++) {
            let value = await fetchItemValue(playerInv[i]["id"]);
            playerInv[i]["price"] = value;
        }
    }
    populateInventory(playerInv, "#playerInv", false);
}

// Constructs an inventory table.
// data -> Inventory to be displayed
// outputDiv -> ID string of the output div
// isShop -> generates tables slightly differently depending on whether this is a shop or player inventory.
function populateInventory(data, outputDiv, isShop) {

    if (data == []) {
        document.querySelector(outputDiv).innerHTML = "No items!";
        return;
    }

    document.querySelector(outputDiv).innerHTML = "";
    let tbl = document.createElement('table');
    // bootstrap stuff
    tbl.className = "table table-striped table-bordered table-hover"
    //tbl.classList.add("table", "table-striped");
    //tbl.classList.add("table-striped");
    //tbl.classList.add("table-bordered");
    //tbl.classList.add("table-hover");

    let thead = document.createElement("thead");
    let row = document.createElement("tr");

    let th1 = document.createElement("th");
    th1.innerHTML = "Description";
    let th2 = document.createElement("th");
    th2.innerHTML = "Quantity"
    let th3 = document.createElement("th");
    th3.innerHTML = (isShop)? "Buy Price" : "Sell Price";
    let th4 = document.createElement("th");
    row.appendChild(th1);
    row.appendChild(th3);
    row.appendChild(th2);
    row.appendChild(th4);

    thead.appendChild(row);
    tbl.appendChild(thead);
    let tbody = document.createElement("tbody");
    for (let i = 0; i < data.length; i ++) {
        let row = document.createElement("tr");
        let td1 = document.createElement("td");
        td1.innerHTML = "<h6>" + data[i]["name"] + " - <small> " + data[i]["description"] + "</small></h6> ";

        //td1.appendChild(document.createTextNode(data[i]["name"]));
        row.appendChild(td1);

//        row.appendChild(td2);

        let td3 = document.createElement("td");
        td3.appendChild(document.createTextNode(data[i]["price"]));
        row.appendChild(td3);

        let td4 = document.createElement("td");
        td4.appendChild(document.createTextNode(data[i]["quantity"]));
        row.appendChild(td4);

        let td5 = document.createElement("td");
        let btn = document.createElement("button");
        btn.addEventListener("click", flog);
        btn.id = data[i]["id"];
        btn.buying = isShop;
        btn.item = data[i];
        btn.innerHTML = (isShop) ? "Buy!" : "Sell!";
        td5.appendChild(btn);
        row.appendChild(td5);

        tbody.appendChild(row);
    }
    tbl.appendChild(tbody);
    document.querySelector(outputDiv).appendChild(tbl);
}

// Helper function which generates a url encoded list of parameters (even JSON!)
function obj2params(obj) {
    out = [];
    for (let key in obj) {
        out.push(key + "=" + JSON.stringify(obj[key]));
    }
    return out.join("&");
}

// Guts of the buy/sell buttons.
async function flog () {
    if (this.buying) { // shop button
        await fetch ("buyItem.php?shop=" + activeShop + "&id=" + this.id + "&gold=" + playerGold)
          .then( response => response.json())
          .then( data => addtoInventory(data));
    } else { // player inventory button
        const data = { shop : activeShop
                     , gold : playerGold
                     , item : this.item
                     };

        await fetch ("sellItem.php", {
            method : 'POST',
            headers : { "Content-Type" : "application/x-www-form-urlencoded" },
            body : obj2params(data)
        })
          .then( response => response.json())
          .then( response => removeFromInventory(response, this.id));
    }

}

// Removes one item with given ID from the player's inventory
function removeFromInventory(response, id) {
    if (response.debug != undefined) {
        console.log(response.debug);
    }
    document.querySelector("#speech").innerHTML = "Merchant : " + response.message;
    if (response.success) {
        playerGold = response.gold;
        for (let i = 0; i < playerInv.length; i++) {
            if (id == playerInv[i].id) {
                playerInv[i].quantity --;
                if (playerInv[i].quantity === 0) {
                    playerInv.splice(i,1);
                }
            }
        }
        populatePlayerData();
        fetchInventory(activeShop);
    }
}

// Adds an item from the shop to the player's inventory
function addtoInventory(data) {
    if (data.debug != undefined) {
        console.log(data.debug);
    }
    document.querySelector("#speech").innerHTML = "Merchant : " + data.message;
    if (data.success == 'true') {
        playerGold = data.gold;
        let flag = true;
        for (let i = 0; i < playerInv.length; i++) {
            if (data.item.id == playerInv[i].id) {
                playerInv[i].quantity ++;
                flag = false;
            }
        }
        if (flag) {
            playerInv.push(data.item);
            playerInv[playerInv.length-1].quantity = 1;
        }
        populatePlayerData();
        fetchInventory(activeShop);
    } else {
        console.log("no change!")
    }
}

// loads a new shop. (no PHP involved).
async function changeShop(which) {
    activeShop = which;
    document.querySelector("#shopimg").src = shopImage[which];
    fetchInventory(which);
    await populatePlayerData();
}
