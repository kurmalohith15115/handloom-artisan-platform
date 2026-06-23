<?php

session_start();

include "config/db.php";

if(!isset($_SESSION['customer_id']))
{
    header("Location: customer-login.html");
    exit();
}

$customer_id = $_SESSION['customer_id'];
$product_id = $_POST['product_id'];

$check = mysqli_query(
$conn,
"SELECT * FROM cart
WHERE customer_id='$customer_id'
AND product_id='$product_id'"
);

if(mysqli_num_rows($check)>0)
{
    mysqli_query(
    $conn,
    "UPDATE cart
    SET quantity = quantity + 1
    WHERE customer_id='$customer_id'
    AND product_id='$product_id'"
    );
}
else
{
    mysqli_query(
    $conn,
    "INSERT INTO cart
    (customer_id,product_id,quantity)
    VALUES
    ('$customer_id','$product_id',1)"
    );
}

header("Location: cart.php");

?>