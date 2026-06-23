<?php

include "config/db.php";

$id = $_GET['id'];

$sql = "DELETE FROM products WHERE id='$id'";

if($conn->query($sql))
{
    header("Location: view-products.php");
}
else
{
    echo $conn->error;
}

?>