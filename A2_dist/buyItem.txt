<?php
/* 
* "I Basil_Joby, 000918729, certify that this material is my original work.
*  No other person's work has been used without suitable acknowledgment and I have not made my work available to anyone else."
*/

/**
 *  A PHP script to process the items purchases from a shops inventory system.
 * 
 * @author Basil Joby
 * @version 2024.00
 * @package COMP 10260 Assignment 2
 */



// Function Used to Sanitize and filter the user inputs to prevent Croos side scripting attacks
function get_sanitized_input($name) {
    return filter_input(INPUT_GET, $name, FILTER_SANITIZE_NUMBER_INT);
}

// Retrieves and then sanitizes the  inputs
$shop = get_sanitized_input("shop");
$id = get_sanitized_input("id");
$gold = get_sanitized_input("gold");

// Implementing Json file paths for each shopes 
$shopFiles = ["Shop1.json", "Shop2.json", "Shop3.json"];

// Validatesthe  shop parameter and cheks if the file exits or not
if (!isset($shopFiles[$shop]) || !file_exists($shopFiles[$shop])) {
    echo json_encode(["error" => "Invalid shop selected."]);
    exit;
}

// Loding the hops Data
$shopData = json_decode(file_get_contents($shopFiles[$shop]), true);
if ($shopData === null) {
    echo json_encode(["error" => "Failed to load shop data."]);
    exit;
}

// function to Find the item in shop-inventory by ID
function find_item_by_id($data, $id) {
    foreach ($data as $index => $item) {
        if ($item["id"] == $id) {
            return $index;
        }
    }
    return -1;
}

$itemIndex = find_item_by_id($shopData, $id);
if ($itemIndex === -1) {
    echo json_encode(["error" => "Item not found in inventory."]);
    exit;
}

$item = $shopData[$itemIndex];
$itemPrice = $item["price"];

// Cheking if the user has enough money or not and displays message 
if ($gold < $itemPrice) {
    echo json_encode([
        "message" => "You need more gold for this item.",
        "gold" => $gold,
        "debug" => "Player has $gold, but the price is $itemPrice."
    ]);
    exit;
}

// subtracting item price from players gold
$wallet = $gold - $itemPrice;


// Reduce the items  quantity and check wheter it should be removed or not
$shopData[$itemIndex]["quantity"]--;
if ($shopData[$itemIndex]["quantity"] <= 0) {
    array_splice($shopData, $itemIndex, 1); // Removes the  item from  the shop inventory
}


// saving the updated shop Data
if (file_put_contents($shopFiles[$shop], json_encode($shopData)) === false) {
        echo json_encode(["error" => "Failed to update shop inventory."]);
         exit;
}


// Responding  with  the success message and the  updated inventory
echo json_encode([
        "success" => "true",
        "message" => "Thank you for your purchase!",
        "gold" => $wallet,
        "item" => $item,
        "debug" => "Purchased item $id for $itemPrice gold. Remaining gold: $wallet."
]);
?>
