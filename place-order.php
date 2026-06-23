<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

echo "<pre>";
print_r($_SESSION);
echo "</pre>";
exit();

if(!isset($_SESSION['customer_id']))
{
    header("Location: customer-login.html");
    exit();
}

include "config/db.php";

$$_SESSION['customer_id'] = $row['id'];
$_SESSION['customer_name'] = $row['name'];

$total = 0;

$sql = "
SELECT products.price, cart.quantity
FROM cart
JOIN products ON cart.product_id = products.id
WHERE cart.customer_id='$customer_id'
";

$result = mysqli_query($conn, $sql);

while($row = mysqli_fetch_assoc($result))
{
    $total += ($row['price'] * $row['quantity']);
}

if($total <= 0)
{
    die("Cart is empty.");
}

$insert = mysqli_query(
$conn,
"INSERT INTO orders
(customer_id, customer_name, amount, status, created_at)
VALUES
('$customer_id', '$customer_name', '$total', 'Placed', NOW())"
);

if(!$insert)
{
    die("Order Insert Error: " . mysqli_error($conn));
}

mysqli_query(
$conn,
"DELETE FROM cart
WHERE customer_id='$customer_id'"
);

?>

<!DOCTYPE html>
<html>
<head>
<title>Order Success</title>
</head>
<body>

<h2>Order Placed Successfully ✅</h2>

<p>Your order has been placed.</p>

<a href="order-history.php">
View My Orders
</a>

<br><br>

<a href="customer-dashboard.php">
Go To Dashboard
</a>

</body>
</html>