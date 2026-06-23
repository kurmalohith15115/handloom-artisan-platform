<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

include "config/db.php";

if(!isset($_SESSION['customer_id']))
{
    header("Location: customer-login.html");
    exit();
}

$customer_id = $_SESSION['customer_id'];
$customer_name = $_SESSION['customer_name'];

$total = $_POST['amount'] ?? 0;

$sql = "INSERT INTO orders
(
customer_id,
customer_name,
amount,
status
)

VALUES
(
'$customer_id',
'$customer_name',
'$total',
'Pending'
)";

if(!mysqli_query($conn, $sql))
{
    die("MySQL Error: " . mysqli_error($conn));
}

/* Reduce Product Stock */

$cartProducts = mysqli_query(
$conn,
"SELECT *
FROM cart
WHERE customer_id='$customer_id'"
);

while($item = mysqli_fetch_assoc($cartProducts))
{
    mysqli_query(
    $conn,

    "UPDATE products

    SET stock = stock - ".$item['quantity']."

    WHERE id='".$item['product_id']."'"
    );
}

/* Clear Cart */

mysqli_query(
$conn,
"DELETE FROM cart
WHERE customer_id='$customer_id'"
);
?>

<!DOCTYPE html>
<html>
<head>
<title>Payment Success</title>
<link rel="stylesheet" href="css/style.css">
</head>
<body>

<div style="text-align:center;padding:50px;">

<h1>Payment Successful ✅</h1>

<h2>Amount Paid: ₹<?php echo $total; ?></h2>

<p>Your order has been placed successfully.</p>

<br>

<a href="invoice.php">
<button>
Download Invoice
</button>
</a>

<br><br>

<a href="customer-dashboard.php">
<button>
Go To Dashboard
</button>
</a>

</div>

</body>
</html>