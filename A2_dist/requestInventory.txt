<?php
/* 
* "I Basil_Joby, 000918729, certify that this material is my original work.
*  No other person's work has been used without suitable acknowledgment and I have not made my work available to anyone else."
*/

/**
 *  A PHP to retrive and output the json data of the shops
 * 
 * @author Basil Joby
 * @version 2024.00
 * @package COMP 10260 Assignment 2
 */
if (isset($_GET['shop'])) {
    $shopID = (int)$_GET['shop'];
    $shop_var =$shopID +1;
    $fileName = "Shop{$shop_var}.json";

    // Cheking the Existance of the file before reading it 
    if (file_exists($fileName)) {
        $data = file_get_contents($fileName);
        if ($data !== false) {
            echo json_encode(json_decode($data, true));
        } else {
            echo "Error: Could not read the file.";
        }
    } else {
        echo "Error: File does not exist.";
    }
} else {
    echo "Error: Invalid shop ID.";
}
?>
