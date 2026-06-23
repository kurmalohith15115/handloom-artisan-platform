<?php

session_start();
include "config/db.php";

$customer_id = $_SESSION['customer_id'];
$product_id = $_POST['product_id'];
$rating = $_POST['rating'];
$review = $_POST['review'];

$sql = "INSERT INTO reviews
(
customer_id,
product_id,
rating,
review
)
VALUES
(
'$customer_id',
'$product_id',
'$rating',
'$review'
)";

if(mysqli_query($conn,$sql))
{
    header("Location: customer-products.php");
    exit();
}
else
{
    echo mysqli_error($conn);
}

?>