<?php

include "config/db.php";

$id = $_POST['id'];
$status = $_POST['status'];

mysqli_query(
$conn,
"UPDATE orders
SET status='$status'
WHERE id='$id'"
);

header("Location: manage-orders.php");
exit();

?>