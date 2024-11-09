<?php

$a = copy("Shop1.json.backup", "Shop1.json");
$b = copy("Shop2.json.backup", "Shop2.json");
$c = copy("Shop3.json.backup", "Shop3.json");

if ($a && $b && $c) {
    echo "JSON files successfully reset!";
} else {
    echo "An error occurred...";
}


?>
