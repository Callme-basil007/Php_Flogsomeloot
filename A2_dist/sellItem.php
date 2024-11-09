<?php
/* 
* "I Basil_Joby, 000918729, certify that this material is my original work.
*  No other person's work has been used without suitable acknowledgment and I have not made my work available to anyone else."
*/

// Get and validate the input values
$shop = filter_input(INPUT_POST, 'shop', FILTER_VALIDATE_INT);
$gold = filter_input(INPUT_POST, 'gold', FILTER_VALIDATE_INT);
$itemData = json_decode(filter_input(INPUT_POST, 'item', FILTER_UNSAFE_RAW), true);

if (is_null($shop) || is_null($gold) || is_null($itemData)) {
    echo json_encode(["success" => false, "message" => "Invalid parameters."]);
    exit;
}

// Set up the file path and checks for its existence
$shopID = $shop + 1;
$fileName = "Shop{$shopID}.json";

if (!file_exists($fileName)) {
    echo json_encode(["success" => false, "message" => "Shop file does not exist."]);
    exit;
}

// Decodes the shops inventory data
$shopInventory = json_decode(file_get_contents($fileName), true);
$itemID = $itemData['id'];

// Updates the inventory by increment quantity if item exists else add new item with double the price
$foundItem = false;
foreach ($shopInventory as &$currentItem) {
    if ($currentItem['id'] === $itemID) {
        $currentItem['quantity'] += 1;
        $foundItem = true;
        break;
    }
}
if (!$foundItem) {
    $shopInventory[] = [
        "id" => $itemData['id'],
        "name" => $itemData['name'],
        "description" => $itemData['description'],
        "price" => $itemData['price'] * 2,
        "quantity" => 1
    ];
}

// Updates the gold and saves the  updated inventory
$newGold = $gold + $itemData['price'];
file_put_contents($fileName, json_encode($shopInventory, JSON_PRETTY_PRINT));

// Returning the response
echo json_encode([
    "success" => true,
    "message" => "Thank you for selling the item!",
    "gold" => $newGold,
    "debug" => "Sell operation successful"
]);


?>