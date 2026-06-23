<?php

session_start();
include "config/db.php";

$customer_name = $_SESSION['customer_name'];

$order = mysqli_query(
$conn,
"SELECT *
FROM orders
WHERE customer_name='$customer_name'
ORDER BY id DESC
LIMIT 1"
);

$row = mysqli_fetch_assoc($order);

?>

<!DOCTYPE html>
<html>
<head>
<title>Invoice</title>
</head>
<body>

<div style="width:700px;margin:auto;padding:20px;border:1px solid #000;">

<h1 align="center">
Handloom Artisan Platform
</h1>

<hr>

<h3>Invoice</h3>

<p>
Order ID:
<?php echo $row['id']; ?>
</p>

<p>
Customer:
<?php echo $row['customer_name']; ?>
</p>

<p>
Amount:
₹<?php echo $row['amount']; ?>
</p>

<p>
Status:
<?php echo $row['status']; ?>
</p>

<p>
Date:
<?php echo $row['created_at']; ?>
</p>

<hr>

<h2>
Thank You For Shopping With Us ❤️
</h2>

<button onclick="window.print()">
Print Invoice
</button>

</div>

</body>
</html>