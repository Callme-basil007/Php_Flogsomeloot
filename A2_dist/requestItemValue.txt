<?php
$shop = filter_input(INPUT_GET, "shop", FILTER_VALIDATE_INT); // Validate as integer
$id = filter_input(INPUT_GET, "id", FILTER_VALIDATE_INT); // Validate as integer

$csvFile = 'itemValues.csv';

// Check if `shop` and `id` are valid
if ($shop === false || $id === false) {
    echo "Invalid shop or item ID.";
    exit;
}

// Check if the CSV file exists
if (!file_exists($csvFile)) {
    echo "CSV file not found.";
    exit;
}

// Read CSV data into an array
$data = array_map('str_getcsv', file($csvFile));

// Validate `shop` and `id` indices
if (!isset($data[$shop]) || !isset($data[$shop][$id - 1])) {
    echo "Item not found.";
    exit;
}

// Retrieve and output the item
$item = $data[$shop][$id - 1];
echo $item;
?>
